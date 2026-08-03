ALTER TABLE public.comments
  ADD CONSTRAINT comments_content_length_check
  CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000);

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND char_length(btrim(content)) BETWEEN 1 AND 2000
);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND char_length(btrim(content)) BETWEEN 1 AND 2000
);