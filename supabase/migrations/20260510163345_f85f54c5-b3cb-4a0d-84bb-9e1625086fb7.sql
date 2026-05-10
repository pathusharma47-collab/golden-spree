
-- =========== ROLES ===========
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== METAL TYPE ENUM ===========
CREATE TYPE public.metal_type AS ENUM ('gold', 'silver');

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner updates profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner inserts profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== WALLETS ===========
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  welcome_bonus_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views wallet" ON public.wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner updates wallet" ON public.wallets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner inserts wallet" ON public.wallets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== WALLET TRANSACTIONS ===========
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit','debit')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wallet_tx_user ON public.wallet_transactions(user_id, created_at DESC);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views wallet tx" ON public.wallet_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner inserts wallet tx" ON public.wallet_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========== HOLDINGS ===========
CREATE TABLE public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metal metal_type NOT NULL,
  grams NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, metal)
);
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views holdings" ON public.holdings
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner manages holdings" ON public.holdings
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER holdings_updated_at BEFORE UPDATE ON public.holdings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== INVESTMENT TRANSACTIONS ===========
CREATE TABLE public.investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy','sell','sip','gift_sent','gift_received','redeem','spin_reward')),
  metal metal_type,
  grams NUMERIC,
  amount_inr NUMERIC,
  gst_amount NUMERIC,
  rate NUMERIC,
  ref_id TEXT,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_tx_user ON public.investment_transactions(user_id, created_at DESC);
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views inv tx" ON public.investment_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner inserts inv tx" ON public.investment_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========== ACTIVE SIPs ===========
CREATE TABLE public.active_sips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  metal metal_type NOT NULL,
  monthly_amount NUMERIC NOT NULL,
  duration INTEGER NOT NULL,
  bonus_reward TEXT,
  completed_months INTEGER NOT NULL DEFAULT 0,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  total_grams NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','completed')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.active_sips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views sips" ON public.active_sips
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner manages sips" ON public.active_sips
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER sips_updated_at BEFORE UPDATE ON public.active_sips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== SPIN HISTORY ===========
CREATE TABLE public.spin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_label TEXT NOT NULL,
  reward_amount NUMERIC NOT NULL,
  spun_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, spun_on)
);
ALTER TABLE public.spin_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views spin" ON public.spin_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner inserts spin" ON public.spin_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========== GIFTS ===========
CREATE TABLE public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  metal metal_type NOT NULL,
  grams NUMERIC NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sender views gifts" ON public.gifts
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sender inserts gifts" ON public.gifts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- =========== REDEMPTIONS ===========
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('home_delivery','store_pickup','sell_back')),
  metal metal_type NOT NULL,
  grams NUMERIC NOT NULL,
  amount_inr NUMERIC,
  address JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views redemptions" ON public.redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner manages redemptions" ON public.redemptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER redemptions_updated_at BEFORE UPDATE ON public.redemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== TIGHTEN EXISTING TABLES ===========
ALTER TABLE public.kyc_details ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.nominees ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payment_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Anyone can insert kyc" ON public.kyc_details;
DROP POLICY IF EXISTS "Anyone can update kyc" ON public.kyc_details;
DROP POLICY IF EXISTS "Anyone can view kyc" ON public.kyc_details;
CREATE POLICY "Owner views kyc" ON public.kyc_details
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner inserts kyc" ON public.kyc_details
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner updates kyc" ON public.kyc_details
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert nominees" ON public.nominees;
DROP POLICY IF EXISTS "Anyone can update nominees" ON public.nominees;
DROP POLICY IF EXISTS "Anyone can delete nominees" ON public.nominees;
DROP POLICY IF EXISTS "Anyone can view nominees" ON public.nominees;
CREATE POLICY "Owner views nominees" ON public.nominees
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner manages nominees" ON public.nominees
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Anyone can update payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Anyone can view payment transactions" ON public.payment_transactions;
CREATE POLICY "Owner views payments" ON public.payment_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner inserts payments" ON public.payment_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner updates payments" ON public.payment_transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Anyone can update banners" ON public.banners;
DROP POLICY IF EXISTS "Anyone can delete banners" ON public.banners;
CREATE POLICY "Admins manage banners" ON public.banners
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can insert prices" ON public.metal_prices;
DROP POLICY IF EXISTS "Anyone can update prices" ON public.metal_prices;
CREATE POLICY "Admins manage prices" ON public.metal_prices
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== SIGNUP TRIGGER ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := UPPER(SUBSTRING(REPLACE(NEW.id::text, '-', '') FROM 1 FOR 8));

  INSERT INTO public.profiles (user_id, email, display_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    ref_code
  );

  INSERT INTO public.wallets (user_id, balance, welcome_bonus_applied)
  VALUES (NEW.id, 100, true);

  INSERT INTO public.wallet_transactions (user_id, type, amount, description, category)
  VALUES (NEW.id, 'credit', 100, '🎁 Welcome Bonus', 'bonus');

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
