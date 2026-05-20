
CREATE TABLE public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  platform text NOT NULL CHECK (platform IN ('ios','android','web')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_tokens_user ON public.device_tokens(user_id);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views tokens"
ON public.device_tokens FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner inserts token"
ON public.device_tokens FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates token"
ON public.device_tokens FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owner deletes token"
ON public.device_tokens FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_device_tokens_updated_at
BEFORE UPDATE ON public.device_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
