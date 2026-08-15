CREATE OR REPLACE FUNCTION public.expire_old_pack_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Abonnements actifs arrivés à échéance
  UPDATE public.pack_subscriptions
  SET status = 'expired', updated_at = now()
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < now();

  -- Paiements en attente jamais finalisés (lien de paiement périmé après 30 min)
  UPDATE public.pack_subscriptions
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending'
    AND created_at < now() - interval '30 minutes';
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_old_pack_subscriptions() TO service_role;