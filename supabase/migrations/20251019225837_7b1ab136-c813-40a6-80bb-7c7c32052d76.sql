-- Add response fields to estimation_requests table
ALTER TABLE public.estimation_requests
ADD COLUMN IF NOT EXISTS estimated_price NUMERIC,
ADD COLUMN IF NOT EXISTS response_message TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES auth.users(id);

-- Create admin role (skip if exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can view their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all estimation requests
DROP POLICY IF EXISTS "Admins can view all estimation requests" ON public.estimation_requests;
CREATE POLICY "Admins can view all estimation requests"
ON public.estimation_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can update all estimation requests
DROP POLICY IF EXISTS "Admins can update all estimation requests" ON public.estimation_requests;
CREATE POLICY "Admins can update all estimation requests"
ON public.estimation_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));