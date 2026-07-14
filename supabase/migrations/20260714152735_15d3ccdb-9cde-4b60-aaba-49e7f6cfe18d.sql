
-- Replace permissive INSERT policies with basic validation
DROP POLICY IF EXISTS "Anyone can create contact requests" ON public.contact_requests;
CREATE POLICY "Anyone can create contact requests"
  ON public.contact_requests FOR INSERT
  WITH CHECK (
    length(requester_name) BETWEEN 1 AND 200
    AND length(requester_email) BETWEEN 3 AND 320
    AND requester_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (message IS NULL OR length(message) <= 5000)
    AND (requester_phone IS NULL OR length(requester_phone) <= 50)
  );

DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(subject) BETWEEN 1 AND 300
    AND length(message) BETWEEN 1 AND 5000
    AND (phone IS NULL OR length(phone) <= 50)
  );

DROP POLICY IF EXISTS "Anyone can create estimation requests" ON public.estimation_requests;
CREATE POLICY "Anyone can create estimation requests"
  ON public.estimation_requests FOR INSERT
  WITH CHECK (
    length(contact_name) BETWEEN 1 AND 200
    AND length(contact_email) BETWEEN 3 AND 320
    AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(contact_phone) BETWEEN 1 AND 50
    AND length(property_type) BETWEEN 1 AND 100
    AND length(city) BETWEEN 1 AND 100
    AND length(location) BETWEEN 1 AND 500
    AND (description IS NULL OR length(description) <= 5000)
  );
