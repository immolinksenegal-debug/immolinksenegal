DROP POLICY IF EXISTS "Property owners can update contact requests" ON public.contact_requests;

CREATE POLICY "Property owners can update contact requests"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = contact_requests.property_id
      AND properties.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = contact_requests.property_id
      AND properties.user_id = auth.uid()
  )
  AND status IN ('pending', 'contacted', 'closed', 'archived')
  AND length(requester_name) BETWEEN 1 AND 200
  AND length(requester_email) BETWEEN 3 AND 320
  AND (message IS NULL OR length(message) <= 5000)
  AND (requester_phone IS NULL OR length(requester_phone) <= 50)
);