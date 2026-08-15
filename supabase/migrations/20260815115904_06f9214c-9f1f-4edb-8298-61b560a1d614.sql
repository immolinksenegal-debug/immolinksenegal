CREATE TABLE IF NOT EXISTS public.pack_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL CHECK (pack_id IN ('boost','premium','agence')),
  billing TEXT NOT NULL CHECK (billing IN ('monthly','yearly')),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  payment_token TEXT,
  payment_ref TEXT UNIQUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pack_subscriptions TO authenticated;
GRANT ALL ON public.pack_subscriptions TO service_role;

ALTER TABLE public.pack_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pack subscriptions"
ON public.pack_subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS pack_subscriptions_user_id_idx ON public.pack_subscriptions (user_id);

CREATE TRIGGER update_pack_subscriptions_updated_at
BEFORE UPDATE ON public.pack_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();