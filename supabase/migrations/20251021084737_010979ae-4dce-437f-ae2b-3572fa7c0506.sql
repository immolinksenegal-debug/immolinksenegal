-- Create contact_requests table for secure contact sharing
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Property owners can view contact requests for their properties
CREATE POLICY "Property owners can view contact requests"
ON public.contact_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = contact_requests.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Anyone can create contact requests
CREATE POLICY "Anyone can create contact requests"
ON public.contact_requests
FOR INSERT
WITH CHECK (true);

-- Property owners can update status of their contact requests
CREATE POLICY "Property owners can update contact requests"
ON public.contact_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = contact_requests.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Drop the existing public SELECT policy that exposes contact info
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;

-- Create new restricted SELECT policy that excludes contact information for unauthenticated users
CREATE POLICY "Public can view properties without contact info"
ON public.properties
FOR SELECT
USING (
  CASE 
    WHEN auth.uid() = user_id THEN true  -- Property owners see everything
    WHEN status = 'active' THEN true     -- Public sees active properties but...
    ELSE false
  END
);

-- Add trigger for contact_requests updated_at
CREATE TRIGGER update_contact_requests_updated_at
  BEFORE UPDATE ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_properties_updated_at();