-- Restreindre l'accès aux demandes d'estimation
DROP POLICY IF EXISTS "Anyone can create estimation requests" ON public.estimation_requests;
DROP POLICY IF EXISTS "Users can view their own estimation requests" ON public.estimation_requests;
DROP POLICY IF EXISTS "Admins can view all estimation requests" ON public.estimation_requests;

CREATE POLICY "Anyone can create estimation requests"
ON public.estimation_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own estimation requests"
ON public.estimation_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all estimation requests"
ON public.estimation_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Restreindre l'accès aux messages de contact
DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users can view their own contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can create contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own contact messages"
ON public.contact_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contact messages"
ON public.contact_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Restreindre l'accès aux demandes de contact propriétés
DROP POLICY IF EXISTS "Anyone can create contact requests" ON public.contact_requests;

CREATE POLICY "Anyone can create contact requests"
ON public.contact_requests
FOR INSERT
WITH CHECK (true);

-- Bloquer explicitement l'accès public en lecture
CREATE POLICY "Only owners and admins can view contact requests"
ON public.contact_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = contact_requests.property_id 
    AND properties.user_id = auth.uid()
  ) 
  OR has_role(auth.uid(), 'admin')
);