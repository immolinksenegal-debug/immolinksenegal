
-- Convert has_role to SECURITY INVOKER. It only queries user_roles WHERE user_id=_user_id,
-- and existing RLS on user_roles lets each user see their own roles, so self-checks (auth.uid()) still work.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
