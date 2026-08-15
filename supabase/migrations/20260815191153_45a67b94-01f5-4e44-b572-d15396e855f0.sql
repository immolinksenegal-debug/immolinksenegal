ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_account_emails boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_pack_expiry boolean NOT NULL DEFAULT true;