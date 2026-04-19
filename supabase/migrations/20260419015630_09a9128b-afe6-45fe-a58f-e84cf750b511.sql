CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT,
  signature TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  method TEXT,
  description TEXT,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_transactions_user_email ON public.payment_transactions(user_email);
CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment transactions"
  ON public.payment_transactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert payment transactions"
  ON public.payment_transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update payment transactions"
  ON public.payment_transactions FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();