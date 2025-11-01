-- Rendre le bucket property-images public pour que les images s'affichent
UPDATE storage.buckets
SET public = true
WHERE id = 'property-images';