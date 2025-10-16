-- Add contact email field to properties table
ALTER TABLE public.properties 
ADD COLUMN contact_email TEXT;