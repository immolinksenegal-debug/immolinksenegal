REVOKE EXECUTE ON FUNCTION public.expire_old_pack_subscriptions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_old_pack_subscriptions() TO service_role;