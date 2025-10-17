-- Add premium fields to properties table
ALTER TABLE public.properties 
ADD COLUMN is_premium boolean DEFAULT false,
ADD COLUMN premium_expires_at timestamp with time zone;

-- Create index for premium properties query
CREATE INDEX idx_properties_premium ON public.properties(is_premium, premium_expires_at) WHERE is_premium = true;

-- Function to check and update expired premium listings
CREATE OR REPLACE FUNCTION public.update_expired_premium_properties()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Auto-expire premium status if expired
  IF NEW.is_premium = true AND NEW.premium_expires_at IS NOT NULL AND NEW.premium_expires_at < now() THEN
    NEW.is_premium = false;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-expire premium on update
CREATE TRIGGER check_premium_expiration
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_expired_premium_properties();