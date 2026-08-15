ALTER TABLE public.pack_subscriptions
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS payment_url text;

CREATE UNIQUE INDEX IF NOT EXISTS pack_subscriptions_idempotency_key_uidx
  ON public.pack_subscriptions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;