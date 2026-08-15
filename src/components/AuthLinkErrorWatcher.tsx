import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Détecte les erreurs de lien d'authentification (#error=...&error_code=otp_expired)
 * renvoyées par le backend sur n'importe quelle page et redirige vers l'écran dédié.
 */
const AuthLinkErrorWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/auth/confirm") return;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const search = new URLSearchParams(window.location.search);
    const error = hash.get("error") ?? search.get("error");
    const errorCode = hash.get("error_code") ?? search.get("error_code");

    if (!error && !errorCode) return;

    const params = new URLSearchParams();
    if (error) params.set("error", error);
    if (errorCode) params.set("error_code", errorCode);
    const description = hash.get("error_description") ?? search.get("error_description");
    if (description) params.set("error_description", description);

    window.history.replaceState(null, "", location.pathname + location.search);
    navigate(`/auth/confirm?${params.toString()}`, { replace: true });
  }, [location, navigate]);

  return null;
};

export default AuthLinkErrorWatcher;
