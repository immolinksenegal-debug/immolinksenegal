-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can upload their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images of active approved properties" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all property images" ON storage.objects;

-- Rendre le bucket property-images privé pour renforcer la sécurité
UPDATE storage.buckets 
SET public = false 
WHERE id = 'property-images';

-- Politique: Les propriétaires peuvent télécharger leurs propres images
CREATE POLICY "Users can upload their own property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique: Les propriétaires peuvent voir leurs propres images
CREATE POLICY "Users can view their own property images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique: Les propriétaires peuvent mettre à jour leurs propres images
CREATE POLICY "Users can update their own property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique: Les propriétaires peuvent supprimer leurs propres images
CREATE POLICY "Users can delete their own property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique: Le public peut voir les images des propriétés actives et approuvées
CREATE POLICY "Public can view images of active approved properties"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'property-images' AND
  EXISTS (
    SELECT 1 
    FROM public.properties p
    WHERE p.status = 'active' 
      AND p.approval_status = 'approved'
      AND p.user_id::text = (storage.foldername(storage.objects.name))[1]
  )
);

-- Politique: Les admins peuvent gérer toutes les images
CREATE POLICY "Admins can manage all property images"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'property-images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'property-images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);