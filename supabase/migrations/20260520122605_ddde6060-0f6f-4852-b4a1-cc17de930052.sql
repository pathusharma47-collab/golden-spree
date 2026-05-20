
ALTER TABLE public.device_tokens
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.topic_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic)
);

ALTER TABLE public.topic_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views topics" ON public.topic_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));

CREATE POLICY "Owner inserts topics" ON public.topic_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner deletes topics" ON public.topic_subscriptions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
