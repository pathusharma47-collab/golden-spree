
CREATE TABLE public.nominees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  nominee_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  nominee_dob DATE,
  nominee_pan TEXT,
  nominee_phone TEXT,
  percentage INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view nominees" ON public.nominees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert nominees" ON public.nominees FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update nominees" ON public.nominees FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete nominees" ON public.nominees FOR DELETE TO anon, authenticated USING (true);

CREATE TRIGGER update_nominees_updated_at
  BEFORE UPDATE ON public.nominees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
