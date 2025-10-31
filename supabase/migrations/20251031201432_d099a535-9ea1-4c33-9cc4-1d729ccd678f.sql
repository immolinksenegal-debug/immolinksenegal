-- Autoriser les admins à supprimer des propriétés
CREATE POLICY "Admins can delete all properties"
ON public.properties
FOR DELETE
USING (has_role(auth.uid(), 'admin'));