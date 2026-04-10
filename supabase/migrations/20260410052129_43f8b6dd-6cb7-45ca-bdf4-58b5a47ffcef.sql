
-- Create metal_prices table
CREATE TABLE public.metal_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gold_24k NUMERIC NOT NULL DEFAULT 7150,
  gold_22k NUMERIC NOT NULL DEFAULT 6550,
  silver NUMERIC NOT NULL DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metal_prices ENABLE ROW LEVEL SECURITY;

-- Anyone can view prices
CREATE POLICY "Anyone can view prices"
  ON public.metal_prices
  FOR SELECT
  USING (true);

-- Authenticated users can insert prices
CREATE POLICY "Authenticated users can insert prices"
  ON public.metal_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update prices
CREATE POLICY "Authenticated users can update prices"
  ON public.metal_prices
  FOR UPDATE
  TO authenticated
  USING (true);

-- Timestamp trigger
CREATE TRIGGER update_metal_prices_updated_at
  BEFORE UPDATE ON public.metal_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.metal_prices (gold_24k, gold_22k, silver) VALUES (7150, 6550, 85);
