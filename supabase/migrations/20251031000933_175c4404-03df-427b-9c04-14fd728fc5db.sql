-- Add subscription plan types and update subscriptions table
-- Define subscription plans with pricing
CREATE TYPE public.subscription_plan AS ENUM ('monthly', 'yearly');

-- Add plan field to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS plan public.subscription_plan DEFAULT 'monthly';

-- Add invoice data column for PDF generation
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS invoice_number text UNIQUE,
ADD COLUMN IF NOT EXISTS invoice_data jsonb;

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_month text;
  sequence_num integer;
  invoice_num text;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 8) AS integer)
  ), 0) + 1
  INTO sequence_num
  FROM public.subscriptions
  WHERE invoice_number LIKE 'INV-' || year_month || '%';
  
  invoice_num := 'INV-' || year_month || LPAD(sequence_num::text, 4, '0');
  
  RETURN invoice_num;
END;
$$;

-- Add trigger to auto-generate invoice number on subscription activation
CREATE OR REPLACE FUNCTION public.auto_generate_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') AND NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_invoice
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_invoice();