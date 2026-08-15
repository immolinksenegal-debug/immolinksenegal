CREATE TABLE public.payment_webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL DEFAULT 'paytech',
  ref_command text,
  event_type text,
  status text NOT NULL,
  message text,
  subscription_id uuid,
  user_id uuid,
  amount numeric,
  payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_webhook_logs TO authenticated;
GRANT ALL ON public.payment_webhook_logs TO service_role;

ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment webhook logs"
ON public.payment_webhook_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_payment_webhook_logs_created_at ON public.payment_webhook_logs (created_at DESC);
CREATE INDEX idx_payment_webhook_logs_status ON public.payment_webhook_logs (status);