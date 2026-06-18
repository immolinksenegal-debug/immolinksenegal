
-- 1. Properties: restrict contact columns from anonymous access via column-level privileges
REVOKE SELECT ON public.properties FROM anon;
GRANT SELECT (
  id, user_id, title, description, type, price, location, city,
  bedrooms, bathrooms, surface, images, status, views,
  created_at, updated_at, is_premium, premium_expires_at,
  approval_status, is_featured, latitude, longitude
) ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;

-- 2. Storage: remove the overly permissive INSERT policy for property-images
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;

-- 3. property_contracts: allow users to view their own contracts
CREATE POLICY "Users can view their own contracts"
ON public.property_contracts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
