-- Create property_contracts table for managing mandates and rental contracts
CREATE TABLE public.property_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('mandat_gestion', 'contrat_location')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent')),
  
  -- Owner information
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  owner_address TEXT NOT NULL,
  owner_id_number TEXT,
  
  -- Property information
  property_id UUID,
  property_address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  property_description TEXT,
  property_surface NUMERIC,
  
  -- Tenant information (for rental contracts)
  tenant_name TEXT,
  tenant_email TEXT,
  tenant_phone TEXT,
  tenant_address TEXT,
  tenant_id_number TEXT,
  
  -- Contract details
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent NUMERIC NOT NULL,
  commission_rate NUMERIC DEFAULT 10,
  security_deposit NUMERIC,
  
  -- Additional terms
  special_conditions TEXT,
  
  -- Generated PDF
  pdf_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_contracts ENABLE ROW LEVEL SECURITY;

-- Admins can view all contracts
CREATE POLICY "Admins can view all contracts"
ON public.property_contracts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create contracts
CREATE POLICY "Admins can create contracts"
ON public.property_contracts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update contracts
CREATE POLICY "Admins can update contracts"
ON public.property_contracts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete contracts
CREATE POLICY "Admins can delete contracts"
ON public.property_contracts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_property_contracts_updated_at
BEFORE UPDATE ON public.property_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_properties_updated_at();

-- Add index for performance
CREATE INDEX idx_property_contracts_user_id ON public.property_contracts(user_id);
CREATE INDEX idx_property_contracts_contract_type ON public.property_contracts(contract_type);
CREATE INDEX idx_property_contracts_status ON public.property_contracts(status);