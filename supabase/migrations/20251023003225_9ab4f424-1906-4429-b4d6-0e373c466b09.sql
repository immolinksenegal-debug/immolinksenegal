-- Fix function search path mutable warning
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.chat_rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$;