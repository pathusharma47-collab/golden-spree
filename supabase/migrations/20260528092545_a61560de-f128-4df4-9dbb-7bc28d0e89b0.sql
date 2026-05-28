CREATE OR REPLACE FUNCTION public.process_redemption(
  _metal text,
  _grams numeric,
  _type text,
  _address jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _rate numeric;
  _amount numeric;
  _existing_id uuid;
  _existing_grams numeric;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  IF _metal NOT IN ('gold','silver') THEN
    RAISE EXCEPTION 'invalid metal';
  END IF;
  IF _type NOT IN ('delivery','pickup','sell') THEN
    RAISE EXCEPTION 'invalid redemption type';
  END IF;
  IF _grams IS NULL OR _grams <= 0 THEN
    RAISE EXCEPTION 'invalid grams';
  END IF;

  -- Lock holding row
  SELECT id, grams INTO _existing_id, _existing_grams
  FROM public.holdings
  WHERE user_id = _uid AND metal = _metal::metal_type
  FOR UPDATE;

  IF _existing_id IS NULL OR _existing_grams < _grams THEN
    RAISE EXCEPTION 'insufficient holdings';
  END IF;

  -- Latest server-side rate
  SELECT CASE WHEN _metal = 'gold' THEN gold_22k ELSE silver END
    INTO _rate
  FROM public.metal_prices
  ORDER BY updated_at DESC
  LIMIT 1;
  IF _rate IS NULL OR _rate <= 0 THEN
    RAISE EXCEPTION 'price unavailable';
  END IF;

  _amount := round(_grams * _rate, 2);

  -- Deduct holdings
  UPDATE public.holdings
  SET grams = _existing_grams - _grams, updated_at = now()
  WHERE id = _existing_id;

  -- Record redemption
  INSERT INTO public.redemptions (user_id, type, metal, grams, amount_inr, address, status)
  VALUES (_uid, _type, _metal::metal_type, _grams, _amount, _address,
          CASE WHEN _type = 'sell' THEN 'completed' ELSE 'pending' END);

  -- For sell: credit wallet
  IF _type = 'sell' THEN
    UPDATE public.wallets
    SET balance = balance + _amount, updated_at = now()
    WHERE user_id = _uid;

    INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
    VALUES (_uid, 'credit', _amount,
      format('Sold %sg %s @ ₹%s/g', _grams, _metal, _rate),
      'redemption');
  END IF;

  -- Also log to investment_transactions ledger as a sell/redeem entry (type='redeem')
  INSERT INTO public.investment_transactions
    (user_id, type, metal, grams, amount_inr, gst_amount, rate)
  VALUES (_uid, 'redeem', _metal::metal_type, _grams, _amount, 0, _rate);

  RETURN jsonb_build_object('ok', true, 'amount', _amount, 'rate', _rate, 'grams', _grams, 'type', _type);
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_redemption(text, numeric, text, jsonb) TO authenticated;