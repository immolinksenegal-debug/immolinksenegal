-- Create table for property estimation requests
CREATE TABLE public.estimation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  surface NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  condition TEXT,
  description TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.estimation_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own estimation requests"
ON public.estimation_requests
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Anyone can create estimation requests
CREATE POLICY "Anyone can create estimation requests"
ON public.estimation_requests
FOR INSERT
WITH CHECK (true);

-- Policy: Users can update their own requests
CREATE POLICY "Users can update their own estimation requests"
ON public.estimation_requests
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_estimation_requests_updated_at
BEFORE UPDATE ON public.estimation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_properties_updated_at();