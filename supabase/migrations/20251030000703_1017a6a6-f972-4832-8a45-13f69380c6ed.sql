-- Create subscription types enum
CREATE TYPE public.subscription_type AS ENUM ('featured', 'premium');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'pending', 'expired', 'cancelled');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  subscription_type public.subscription_type NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  payment_token TEXT,
  payment_ref TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, subscription_type)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscriptions"
  ON public.subscriptions
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Function to update property featured/premium status based on subscription
CREATE OR REPLACE FUNCTION public.update_property_subscription_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If subscription becomes active, update property
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    IF NEW.subscription_type = 'featured' THEN
      UPDATE public.properties
      SET is_featured = true
      WHERE id = NEW.property_id;
    ELSIF NEW.subscription_type = 'premium' THEN
      UPDATE public.properties
      SET is_premium = true, premium_expires_at = NEW.expires_at
      WHERE id = NEW.property_id;
    END IF;
  END IF;
  
  -- If subscription expires or is cancelled, update property
  IF NEW.status IN ('expired', 'cancelled') AND OLD.status = 'active' THEN
    IF NEW.subscription_type = 'featured' THEN
      UPDATE public.properties
      SET is_featured = false
      WHERE id = NEW.property_id;
    ELSIF NEW.subscription_type = 'premium' THEN
      UPDATE public.properties
      SET is_premium = false, premium_expires_at = NULL
      WHERE id = NEW.property_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update property status
CREATE TRIGGER update_property_on_subscription_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_property_subscription_status();

-- Function to expire old subscriptions
CREATE OR REPLACE FUNCTION public.expire_old_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$;

-- Add is_featured column to properties if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'is_featured') THEN
    ALTER TABLE public.properties ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
END $$;