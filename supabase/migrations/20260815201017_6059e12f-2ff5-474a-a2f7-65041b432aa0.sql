DROP POLICY IF EXISTS "Users can update their own estimation requests" ON public.estimation_requests;

CREATE POLICY "Users can update their own estimation requests"
ON public.estimation_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_estimation_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  NEW.status := OLD.status;
  NEW.estimated_price := OLD.estimated_price;
  NEW.response_message := OLD.response_message;
  NEW.responded_at := OLD.responded_at;
  NEW.responded_by := OLD.responded_by;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_estimation_admin_fields_trg ON public.estimation_requests;
CREATE TRIGGER protect_estimation_admin_fields_trg
BEFORE UPDATE ON public.estimation_requests
FOR EACH ROW
EXECUTE FUNCTION public.protect_estimation_admin_fields();