
-- Credit wallet from a verified Razorpay payment (idempotent on order_id).
-- Called by edge function using service role (bypasses RLS by default).
CREATE OR REPLACE FUNCTION public.credit_wallet_from_payment(
  _user_id uuid,
  _order_id text,
  _amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _already_credited boolean;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'invalid amount';
  END IF;

  -- Idempotency: only credit once per order
  SELECT EXISTS (
    SELECT 1 FROM public.wallet_transactions
    WHERE user_id = _user_id AND category = 'razorpay' AND description LIKE '%' || _order_id || '%'
  ) INTO _already_credited;
  IF _already_credited THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  UPDATE public.wallets SET balance = balance + _amount, updated_at = now()
   WHERE user_id = _user_id;

  INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
  VALUES (_user_id, 'credit', _amount,
    format('Added via Razorpay · order %s', _order_id), 'razorpay');

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.credit_wallet_from_payment(uuid, text, numeric) FROM PUBLIC, anon, authenticated;

-- Process a daily spin reward atomically (one per day enforced).
CREATE OR REPLACE FUNCTION public.process_spin_reward(
  _label text,
  _amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _spun_today boolean;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  IF _amount IS NULL OR _amount < 0 OR _amount > 100 THEN
    RAISE EXCEPTION 'invalid reward';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.spin_history WHERE user_id = _uid AND spun_on = CURRENT_DATE
  ) INTO _spun_today;
  IF _spun_today THEN
    RAISE EXCEPTION 'already spun today';
  END IF;

  INSERT INTO public.spin_history (user_id, reward_label, reward_amount)
  VALUES (_uid, _label, _amount);

  IF _amount > 0 THEN
    UPDATE public.wallets SET balance = balance + _amount, updated_at = now()
     WHERE user_id = _uid;

    INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
    VALUES (_uid, 'credit', _amount, format('🎁 Spin reward: %s', _label), 'reward');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_spin_reward(text, numeric) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.process_spin_reward(text, numeric) TO authenticated;
