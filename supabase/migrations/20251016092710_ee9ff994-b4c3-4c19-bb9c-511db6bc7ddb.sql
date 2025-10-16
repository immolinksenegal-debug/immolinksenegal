-- Add phone number field to properties table
ALTER TABLE public.properties 
ADD COLUMN contact_phone TEXT;