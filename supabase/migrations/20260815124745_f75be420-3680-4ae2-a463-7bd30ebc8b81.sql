ALTER TABLE public.pack_subscriptions
  ADD COLUMN IF NOT EXISTS notified_active_at timestamptz,
  ADD COLUMN IF NOT EXISTS notified_expired_at timestamptz;