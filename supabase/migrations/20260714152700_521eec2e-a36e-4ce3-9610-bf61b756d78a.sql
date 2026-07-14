
-- 1. Restrict EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.expire_old_subscriptions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_property_subscription_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_contact_messages_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_generate_invoice() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_profiles_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_properties_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_expired_premium_properties() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;
-- has_role must remain callable so RLS policies referencing it can evaluate
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

-- 2. Storage: drop the unconditional public SELECT policy
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;

-- 3. Drop redundant permissive service_role policy on chat_rate_limits (service_role bypasses RLS anyway)
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.chat_rate_limits;

-- 4. Properties SELECT policy: enforce approval_status for public visibility
DROP POLICY IF EXISTS "Public can view properties without contact info" ON public.properties;

CREATE POLICY "Owners and admins can view all their properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view approved active properties"
  ON public.properties FOR SELECT
  USING (status = 'active' AND approval_status = 'approved');

-- 5. Move contact fields into a separate table with owner/admin-only access
CREATE TABLE public.property_contacts (
  property_id uuid PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
  contact_phone text,
  contact_email text,
  contact_whatsapp text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_contacts TO authenticated;
GRANT ALL ON public.property_contacts TO service_role;

ALTER TABLE public.property_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins can view contacts"
  ON public.property_contacts FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
      AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "Owners can insert their contacts"
  ON public.property_contacts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Owners can update their contacts"
  ON public.property_contacts FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Owners can delete their contacts"
  ON public.property_contacts FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.user_id = auth.uid()
  ));

-- Migrate existing contact data
INSERT INTO public.property_contacts (property_id, contact_phone, contact_email, contact_whatsapp)
SELECT id, contact_phone, contact_email, contact_whatsapp
FROM public.properties
WHERE contact_phone IS NOT NULL OR contact_email IS NOT NULL OR contact_whatsapp IS NOT NULL
ON CONFLICT (property_id) DO NOTHING;

-- Drop leaked columns from public properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE public.properties DROP COLUMN IF EXISTS contact_email;
ALTER TABLE public.properties DROP COLUMN IF EXISTS contact_whatsapp;
