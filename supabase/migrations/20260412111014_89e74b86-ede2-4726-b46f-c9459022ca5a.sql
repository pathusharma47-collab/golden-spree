
CREATE TABLE public.kyc_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  pan_number TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'verified',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view kyc" ON public.kyc_details FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert kyc" ON public.kyc_details FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update kyc" ON public.kyc_details FOR UPDATE TO anon, authenticated USING (true);

CREATE TRIGGER update_kyc_details_updated_at
  BEFORE UPDATE ON public.kyc_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
