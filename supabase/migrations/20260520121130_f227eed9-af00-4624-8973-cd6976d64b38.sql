
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audience text NOT NULL CHECK (audience IN ('user','admin','all')),
  recipient_id uuid, -- null for broadcast or admin-audience
  sender_id uuid,
  title text NOT NULL,
  body text NOT NULL,
  category text,
  link text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read_by uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_audience ON public.notifications(audience, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see: addressed to them, or broadcast 'all'. Admins see admin-bound + everything.
CREATE POLICY "View notifications"
ON public.notifications FOR SELECT TO authenticated
USING (
  recipient_id = auth.uid()
  OR audience = 'all'
  OR (audience = 'admin' AND public.has_role(auth.uid(),'admin'))
  OR public.has_role(auth.uid(),'admin')
);

-- Only admins can insert directly (and the send_notification function as SECURITY DEFINER)
CREATE POLICY "Admins insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Users can update only the read_by array (to mark as read for themselves)
CREATE POLICY "Mark as read"
ON public.notifications FOR UPDATE TO authenticated
USING (
  recipient_id = auth.uid()
  OR audience = 'all'
  OR (audience = 'admin' AND public.has_role(auth.uid(),'admin'))
)
WITH CHECK (true);

-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function: admin sends notification (to all users, or to one user)
CREATE OR REPLACE FUNCTION public.send_notification(
  _title text,
  _body text,
  _recipient_id uuid DEFAULT NULL,
  _link text DEFAULT NULL,
  _category text DEFAULT 'admin'
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO public.notifications (audience, recipient_id, sender_id, title, body, category, link)
  VALUES (
    CASE WHEN _recipient_id IS NULL THEN 'all' ELSE 'user' END,
    _recipient_id, _uid, _title, _body, _category, _link
  );

  RETURN jsonb_build_object('ok', true);
END; $$;

-- Helper: notify admins of user activity
CREATE OR REPLACE FUNCTION public.notify_admins(_title text, _body text, _category text, _user_id uuid, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (audience, sender_id, title, body, category, metadata)
  VALUES ('admin', _user_id, _title, _body, _category, _meta);
END; $$;

-- Trigger: wallet transactions
CREATE OR REPLACE FUNCTION public.trg_notify_wallet_tx()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE user_id = NEW.user_id;
  PERFORM public.notify_admins(
    CASE WHEN NEW.type='credit' THEN '💰 Wallet credited' ELSE '💸 Wallet debited' END,
    format('%s: ₹%s · %s', COALESCE(_email,'User'), NEW.amount, COALESCE(NEW.description,NEW.category,'')),
    COALESCE(NEW.category,'wallet'),
    NEW.user_id,
    jsonb_build_object('type', NEW.type, 'amount', NEW.amount)
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER notify_admin_wallet_tx
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_wallet_tx();

-- Trigger: KYC submitted
CREATE OR REPLACE FUNCTION public.trg_notify_kyc()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_admins(
    '🪪 KYC submitted',
    format('%s %s · PAN %s', NEW.first_name, NEW.last_name, NEW.pan_number),
    'kyc', NEW.user_id, jsonb_build_object('status', NEW.status)
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER notify_admin_kyc
AFTER INSERT ON public.kyc_details
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_kyc();

-- Trigger: redemption
CREATE OR REPLACE FUNCTION public.trg_notify_redemption()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE user_id = NEW.user_id;
  PERFORM public.notify_admins(
    '📦 Redemption request',
    format('%s · %s %sg (%s)', COALESCE(_email,'User'), NEW.metal, NEW.grams, NEW.type),
    'redemption', NEW.user_id, jsonb_build_object('type', NEW.type)
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER notify_admin_redemption
AFTER INSERT ON public.redemptions
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_redemption();

-- Trigger: gift
CREATE OR REPLACE FUNCTION public.trg_notify_gift()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_admins(
    '🎁 Gold gift sent',
    format('To %s (%s) · %s %sg', NEW.recipient_name, NEW.recipient_phone, NEW.metal, NEW.grams),
    'gift', NEW.sender_id, '{}'::jsonb
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER notify_admin_gift
AFTER INSERT ON public.gifts
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_gift();

-- Trigger: SIP started
CREATE OR REPLACE FUNCTION public.trg_notify_sip()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE user_id = NEW.user_id;
  PERFORM public.notify_admins(
    '📈 New SIP started',
    format('%s · %s ₹%s/mo for %s months', COALESCE(_email,'User'), NEW.plan_name, NEW.monthly_amount, NEW.duration),
    'sip', NEW.user_id, '{}'::jsonb
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER notify_admin_sip
AFTER INSERT ON public.active_sips
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_sip();

-- Trigger: new signup welcomes user + alerts admin
CREATE OR REPLACE FUNCTION public.trg_notify_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (audience, recipient_id, title, body, category)
  VALUES ('user', NEW.user_id, '👋 Welcome to Maheshwari Alankar',
    'Your wallet has been credited with ₹100 welcome bonus. Start investing in gold & silver!', 'welcome');

  PERFORM public.notify_admins(
    '🆕 New user signup', format('%s joined', NEW.email), 'signup', NEW.user_id, '{}'::jsonb
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER notify_signup
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_signup();
