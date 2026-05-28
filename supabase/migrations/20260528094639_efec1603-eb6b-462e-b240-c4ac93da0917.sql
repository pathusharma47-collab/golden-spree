-- 1. Add purity columns
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS purity text NOT NULL DEFAULT '22k';
ALTER TABLE public.investment_transactions ADD COLUMN IF NOT EXISTS purity text;
ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS purity text;

-- Normalize existing rows
UPDATE public.holdings SET purity = CASE WHEN metal = 'silver' THEN 'silver' ELSE '22k' END;
UPDATE public.investment_transactions SET purity = CASE WHEN metal = 'silver' THEN 'silver' ELSE '22k' END WHERE purity IS NULL;
UPDATE public.redemptions SET purity = CASE WHEN metal = 'silver' THEN 'silver' ELSE '22k' END WHERE purity IS NULL;

-- Unique per (user, metal, purity)
DROP INDEX IF EXISTS holdings_user_metal_unique;
CREATE UNIQUE INDEX IF NOT EXISTS holdings_user_metal_purity_unique
  ON public.holdings (user_id, metal, purity);

-- 2. process_investment with purity
CREATE OR REPLACE FUNCTION public.process_investment(_metal text, _amount numeric, _source text DEFAULT 'buy', _purity text DEFAULT '22k')
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _bal numeric; _rate numeric; _gst numeric; _net numeric; _grams numeric;
  _existing_id uuid; _existing_grams numeric; _eff_purity text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF _metal NOT IN ('gold','silver') THEN RAISE EXCEPTION 'invalid metal'; END IF;
  IF _amount IS NULL OR _amount < 10 THEN RAISE EXCEPTION 'minimum investment is 10'; END IF;
  IF _source NOT IN ('buy','sip') THEN RAISE EXCEPTION 'invalid source'; END IF;

  _eff_purity := CASE WHEN _metal = 'silver' THEN 'silver'
                      WHEN _purity = '24k' THEN '24k'
                      ELSE '22k' END;

  SELECT balance INTO _bal FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF _bal IS NULL THEN RAISE EXCEPTION 'wallet not found'; END IF;
  IF _bal < _amount THEN RAISE EXCEPTION 'insufficient balance'; END IF;

  SELECT CASE
           WHEN _metal = 'silver' THEN silver
           WHEN _eff_purity = '24k' THEN gold_24k
           ELSE gold_22k
         END INTO _rate
  FROM public.metal_prices ORDER BY updated_at DESC LIMIT 1;
  IF _rate IS NULL OR _rate <= 0 THEN RAISE EXCEPTION 'price unavailable'; END IF;

  _gst := round(_amount * 0.03, 2);
  _net := _amount - _gst;
  _grams := round(_net / _rate, 4);

  UPDATE public.wallets SET balance = balance - _amount, updated_at = now() WHERE user_id = _uid;

  INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
  VALUES (_uid, 'debit', _amount,
    format('Invested in %s %s (%sg) · ₹%s + ₹%s GST', _metal, _eff_purity, _grams, _net, _gst),
    'investment');

  SELECT id, grams INTO _existing_id, _existing_grams
  FROM public.holdings WHERE user_id = _uid AND metal = _metal::metal_type AND purity = _eff_purity FOR UPDATE;
  IF _existing_id IS NULL THEN
    INSERT INTO public.holdings (user_id, metal, grams, purity) VALUES (_uid, _metal::metal_type, _grams, _eff_purity);
  ELSE
    UPDATE public.holdings SET grams = _existing_grams + _grams, updated_at = now() WHERE id = _existing_id;
  END IF;

  INSERT INTO public.investment_transactions (user_id, type, metal, grams, amount_inr, gst_amount, rate, purity)
  VALUES (_uid, _source, _metal::metal_type, _grams, _amount, _gst, _rate, _eff_purity);

  RETURN jsonb_build_object('ok', true, 'grams', _grams, 'rate', _rate, 'gst', _gst, 'net', _net, 'purity', _eff_purity, 'new_balance', _bal - _amount);
END; $$;

-- 3. process_redemption with purity
CREATE OR REPLACE FUNCTION public.process_redemption(_metal text, _grams numeric, _type text, _address jsonb DEFAULT NULL, _purity text DEFAULT '22k')
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _rate numeric; _amount numeric;
  _existing_id uuid; _existing_grams numeric; _eff_purity text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF _metal NOT IN ('gold','silver') THEN RAISE EXCEPTION 'invalid metal'; END IF;
  IF _type NOT IN ('home_delivery','store_pickup','sell_back') THEN RAISE EXCEPTION 'invalid redemption type'; END IF;
  IF _grams IS NULL OR _grams <= 0 THEN RAISE EXCEPTION 'invalid grams'; END IF;

  _eff_purity := CASE WHEN _metal = 'silver' THEN 'silver'
                      WHEN _purity = '24k' THEN '24k'
                      ELSE '22k' END;

  SELECT id, grams INTO _existing_id, _existing_grams
  FROM public.holdings WHERE user_id = _uid AND metal = _metal::metal_type AND purity = _eff_purity FOR UPDATE;
  IF _existing_id IS NULL OR _existing_grams < _grams THEN RAISE EXCEPTION 'insufficient holdings'; END IF;

  SELECT CASE
           WHEN _metal = 'silver' THEN silver
           WHEN _eff_purity = '24k' THEN gold_24k
           ELSE gold_22k
         END INTO _rate
  FROM public.metal_prices ORDER BY updated_at DESC LIMIT 1;
  IF _rate IS NULL OR _rate <= 0 THEN RAISE EXCEPTION 'price unavailable'; END IF;

  _amount := round(_grams * _rate, 2);

  UPDATE public.holdings SET grams = _existing_grams - _grams, updated_at = now() WHERE id = _existing_id;

  INSERT INTO public.redemptions (user_id, type, metal, grams, amount_inr, address, status, purity)
  VALUES (_uid, _type, _metal::metal_type, _grams, _amount, _address, _eff_purity,
          CASE WHEN _type = 'sell_back' THEN 'completed' ELSE 'pending' END);

  IF _type = 'sell_back' THEN
    UPDATE public.wallets SET balance = balance + _amount, updated_at = now() WHERE user_id = _uid;
    INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
    VALUES (_uid, 'credit', _amount, format('Sold %sg %s %s @ ₹%s/g', _grams, _metal, _eff_purity, _rate), 'redemption');
  END IF;

  INSERT INTO public.investment_transactions (user_id, type, metal, grams, amount_inr, gst_amount, rate, purity)
  VALUES (_uid, 'redeem', _metal::metal_type, _grams, _amount, 0, _rate, _eff_purity);

  RETURN jsonb_build_object('ok', true, 'amount', _amount, 'rate', _rate, 'grams', _grams, 'type', _type, 'purity', _eff_purity);
END; $$;

-- Fix arg order issue in redemptions insert (status & purity above were swapped). Re-create with correct column order:
CREATE OR REPLACE FUNCTION public.process_redemption(_metal text, _grams numeric, _type text, _address jsonb DEFAULT NULL, _purity text DEFAULT '22k')
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _rate numeric; _amount numeric;
  _existing_id uuid; _existing_grams numeric; _eff_purity text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF _metal NOT IN ('gold','silver') THEN RAISE EXCEPTION 'invalid metal'; END IF;
  IF _type NOT IN ('home_delivery','store_pickup','sell_back') THEN RAISE EXCEPTION 'invalid redemption type'; END IF;
  IF _grams IS NULL OR _grams <= 0 THEN RAISE EXCEPTION 'invalid grams'; END IF;

  _eff_purity := CASE WHEN _metal = 'silver' THEN 'silver'
                      WHEN _purity = '24k' THEN '24k'
                      ELSE '22k' END;

  SELECT id, grams INTO _existing_id, _existing_grams
  FROM public.holdings WHERE user_id = _uid AND metal = _metal::metal_type AND purity = _eff_purity FOR UPDATE;
  IF _existing_id IS NULL OR _existing_grams < _grams THEN RAISE EXCEPTION 'insufficient holdings'; END IF;

  SELECT CASE
           WHEN _metal = 'silver' THEN silver
           WHEN _eff_purity = '24k' THEN gold_24k
           ELSE gold_22k
         END INTO _rate
  FROM public.metal_prices ORDER BY updated_at DESC LIMIT 1;
  IF _rate IS NULL OR _rate <= 0 THEN RAISE EXCEPTION 'price unavailable'; END IF;

  _amount := round(_grams * _rate, 2);

  UPDATE public.holdings SET grams = _existing_grams - _grams, updated_at = now() WHERE id = _existing_id;

  INSERT INTO public.redemptions (user_id, type, metal, grams, amount_inr, address, status, purity)
  VALUES (_uid, _type, _metal::metal_type, _grams, _amount, _address,
          CASE WHEN _type = 'sell_back' THEN 'completed' ELSE 'pending' END,
          _eff_purity);

  IF _type = 'sell_back' THEN
    UPDATE public.wallets SET balance = balance + _amount, updated_at = now() WHERE user_id = _uid;
    INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
    VALUES (_uid, 'credit', _amount, format('Sold %sg %s %s @ ₹%s/g', _grams, _metal, _eff_purity, _rate), 'redemption');
  END IF;

  INSERT INTO public.investment_transactions (user_id, type, metal, grams, amount_inr, gst_amount, rate, purity)
  VALUES (_uid, 'redeem', _metal::metal_type, _grams, _amount, 0, _rate, _eff_purity);

  RETURN jsonb_build_object('ok', true, 'amount', _amount, 'rate', _rate, 'grams', _grams, 'type', _type, 'purity', _eff_purity);
END; $$;

GRANT EXECUTE ON FUNCTION public.process_investment(text, numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_redemption(text, numeric, text, jsonb, text) TO authenticated;