-- Create contract_signatures table
CREATE TABLE IF NOT EXISTS public.contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.property_contracts(id) ON DELETE CASCADE,
  signer_type TEXT NOT NULL CHECK (signer_type IN ('owner', 'tenant', 'agency')),
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all signatures
CREATE POLICY "Admins can manage all signatures"
ON public.contract_signatures
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to view signatures for their contracts
CREATE POLICY "Users can view signatures for their contracts"
ON public.contract_signatures
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.property_contracts
    WHERE property_contracts.id = contract_signatures.contract_id
    AND property_contracts.user_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_contract_signatures_contract_id ON public.contract_signatures(contract_id);
CREATE INDEX idx_contract_signatures_signer_type ON public.contract_signatures(signer_type);

-- Add signature status to contracts
ALTER TABLE public.property_contracts
ADD COLUMN IF NOT EXISTS signature_status TEXT DEFAULT 'pending' CHECK (signature_status IN ('pending', 'partially_signed', 'fully_signed'));