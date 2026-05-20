
-- 1. Atomic investment function (server prices, server GST, balance check)
CREATE OR REPLACE FUNCTION public.process_investment(
  _metal text,
  _amount numeric,
  _source text DEFAULT 'buy'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _bal numeric;
  _rate numeric;
  _gst numeric;
  _net numeric;
  _grams numeric;
  _existing_id uuid;
  _existing_grams numeric;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  IF _metal NOT IN ('gold','silver') THEN
    RAISE EXCEPTION 'invalid metal';
  END IF;
  IF _amount IS NULL OR _amount < 10 THEN
    RAISE EXCEPTION 'minimum investment is 10';
  END IF;
  IF _source NOT IN ('buy','sip') THEN
    RAISE EXCEPTION 'invalid source';
  END IF;

  -- Lock wallet row
  SELECT balance INTO _bal FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF _bal IS NULL THEN
    RAISE EXCEPTION 'wallet not found';
  END IF;
  IF _bal < _amount THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  -- Latest server-side price
  SELECT CASE WHEN _metal = 'gold' THEN gold_22k ELSE silver END
    INTO _rate
  FROM public.metal_prices
  ORDER BY updated_at DESC
  LIMIT 1;
  IF _rate IS NULL OR _rate <= 0 THEN
    RAISE EXCEPTION 'price unavailable';
  END IF;

  _gst   := round(_amount * 0.03, 2);
  _net   := _amount - _gst;
  _grams := round(_net / _rate, 4);

  -- Debit wallet
  UPDATE public.wallets SET balance = balance - _amount, updated_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
  VALUES (_uid, 'debit', _amount,
    format('Invested in %s (%sg) · ₹%s + ₹%s GST', _metal, _grams, _net, _gst),
    'investment');

  -- Upsert holdings
  SELECT id, grams INTO _existing_id, _existing_grams
  FROM public.holdings WHERE user_id = _uid AND metal = _metal::metal_type FOR UPDATE;
  IF _existing_id IS NULL THEN
    INSERT INTO public.holdings (user_id, metal, grams) VALUES (_uid, _metal::metal_type, _grams);
  ELSE
    UPDATE public.holdings SET grams = _existing_grams + _grams, updated_at = now() WHERE id = _existing_id;
  END IF;

  -- Ledger
  INSERT INTO public.investment_transactions
    (user_id, type, metal, grams, amount_inr, gst_amount, rate)
  VALUES (_uid, _source, _metal::metal_type, _grams, _amount, _gst, _rate);

  RETURN jsonb_build_object(
    'ok', true, 'grams', _grams, 'rate', _rate,
    'gst', _gst, 'net', _net, 'new_balance', _bal - _amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_investment(text, numeric, text) TO authenticated;

-- 2. Atomic withdraw function (KYC-gated)
CREATE OR REPLACE FUNCTION public.process_withdrawal(
  _amount numeric,
  _description text DEFAULT 'Withdrawn to bank'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _bal numeric;
  _kyc_ok boolean;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'invalid amount';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.kyc_details WHERE user_id = _uid AND status = 'verified'
  ) INTO _kyc_ok;
  IF NOT _kyc_ok THEN
    RAISE EXCEPTION 'KYC required';
  END IF;

  SELECT balance INTO _bal FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF _bal IS NULL OR _bal < _amount THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  UPDATE public.wallets SET balance = balance - _amount, updated_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
  VALUES (_uid, 'debit', _amount, _description, 'withdrawal');

  RETURN jsonb_build_object('ok', true, 'new_balance', _bal - _amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_withdrawal(numeric, text) TO authenticated;

-- 3. Lock down direct writes that affect money
DROP POLICY IF EXISTS "Owner manages holdings" ON public.holdings;
DROP POLICY IF EXISTS "Owner updates wallet"   ON public.wallets;

-- Holdings: keep SELECT only via existing "Owner views holdings"
-- Wallets:  keep SELECT + INSERT (signup trigger uses SECURITY DEFINER, unaffected)

-- investment_transactions INSERT was direct; replace with deny so only the
-- SECURITY DEFINER function can write (it bypasses RLS).
DROP POLICY IF EXISTS "Owner inserts inv tx" ON public.investment_transactions;
