import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, AlertTriangle, CheckCircle2, Loader2, ArrowRight, Home, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logoAuth from "@/assets/logo-immo-link-main.png";

const emailSchema = z.string().trim().email({ message: "Email invalide" });

type Status = "checking" | "valid" | "already_confirmed" | "expired" | "invalid";

const MESSAGES: Record<Exclude<Status, "checking" | "valid" | "already_confirmed">, { title: string; description: string }> = {
  expired: {
    title: "Votre lien de validation a expiré",
    description:
      "Pour votre sécurité, les liens de confirmation ne restent valides que quelques heures. Indiquez votre adresse email ci-dessous pour recevoir un nouveau lien.",
  },
  invalid: {
    title: "Ce lien de validation n'est pas valide",
    description:
      "Le lien a peut-être déjà été utilisé, ou il a été tronqué par votre messagerie. Demandez un nouveau lien pour activer votre compte.",
  },
};


const REDIRECT_DELAY_MS = 5000;


const AuthConfirm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(REDIRECT_DELAY_MS / 1000));
  const [redirectTarget, setRedirectTarget] = useState("/auth");
  const [hasSession, setHasSession] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const params = useMemo(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return {
      error: searchParams.get("error") ?? hash.get("error"),
      errorCode: searchParams.get("error_code") ?? hash.get("error_code"),
      errorDescription: searchParams.get("error_description") ?? hash.get("error_description"),
      emailHint: searchParams.get("email") ?? "",
      next: searchParams.get("next") ?? hash.get("next") ?? "",
    };
  }, [searchParams]);

  useEffect(() => {
    if (params.emailHint) setEmail(params.emailHint);

    const resolve = async () => {
      if (params.error || params.errorCode) {
        const code = `${params.errorCode ?? ""} ${params.errorDescription ?? ""}`.toLowerCase();
        setStatus(code.includes("expired") ? "expired" : "invalid");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setHasSession(true);
        const next =
          params.next && params.next.startsWith("/") && !params.next.startsWith("//")
            ? params.next
            : "/dashboard";
        setRedirectTarget(next);
      } else {
        setHasSession(false);
        const loginNext =
          params.next && params.next.startsWith("/") && !params.next.startsWith("//")
            ? params.next
            : "/dashboard";
        setRedirectTarget(`/auth?next=${encodeURIComponent(loginNext)}`);
      }
      setStatus("valid");
    };

    resolve();
  }, [params, navigate]);

  useEffect(() => {
    if (status !== "valid") return;

    setCountdown(Math.ceil(REDIRECT_DELAY_MS / 1000));
    let remaining = REDIRECT_DELAY_MS;

    timerRef.current = setInterval(() => {
      remaining -= 1000;
      setCountdown(Math.max(0, Math.ceil(remaining / 1000)));
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        navigate(redirectTarget, { replace: true });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, redirectTarget, navigate]);

  const cancelRedirect = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(0);
  };


  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const validEmail = emailSchema.parse(email);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: validEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Envoi impossible",
          description: error.message.toLowerCase().includes("rate")
            ? "Trop de demandes. Patientez quelques minutes avant de réessayer."
            : error.message,
        });
        return;
      }

      setSent(true);
      toast({
        title: "Nouveau lien envoyé",
        description: `Un nouvel email de confirmation a été envoyé à ${validEmail}.`,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ variant: "destructive", title: "Erreur de validation", description: err.errors[0].message });
      } else {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer le lien pour le moment." });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Helmet>
        <title>Confirmation du compte | Immo Link Sénégal</title>
        <meta name="description" content="Confirmez votre compte Immo Link Sénégal ou demandez un nouveau lien de validation si le vôtre a expiré." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <img src={logoAuth} alt="Immo Link Sénégal" className="h-14 mx-auto mb-6" />

        {status === "checking" && (
          <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p>Vérification de votre lien…</p>
          </div>
        )}

        {status === "valid" && (
          <div className="text-center space-y-5 py-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Votre compte est activé !</h1>
              <p className="text-sm text-muted-foreground">
                Votre adresse email a été confirmée avec succès.{" "}
                {hasSession
                  ? "Vous allez être redirigé vers votre espace personnel."
                  : "Connectez-vous pour accéder à votre espace personnel."}
              </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                Redirection automatique dans{" "}
                <span className="font-semibold text-primary">{countdown}s</span>
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / Math.ceil(REDIRECT_DELAY_MS / 1000)) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {hasSession ? (
                <Button
                  onClick={() => {
                    cancelRedirect();
                    navigate(redirectTarget, { replace: true });
                  }}
                  className="w-full h-12 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90"
                >
                  Accéder à mon espace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    cancelRedirect();
                    navigate(redirectTarget, { replace: true });
                  }}
                  className="w-full h-12 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90"
                >
                  Se connecter
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  cancelRedirect();
                  navigate("/", { replace: true });
                }}
                className="w-full h-12 rounded-xl font-semibold border-border hover:bg-muted"
              >
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </div>
          </div>
        )}

        {(status === "expired" || status === "invalid") && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
              <h1 className="text-xl font-bold text-foreground">{MESSAGES[status].title}</h1>
              <p className="text-sm text-muted-foreground">{MESSAGES[status].description}</p>
            </div>

            {sent ? (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground text-center">
                <p className="font-semibold">Nouveau lien envoyé</p>
                <p className="mt-1 text-muted-foreground">
                  Vérifiez votre boîte de réception (et vos spams) à l'adresse <span className="font-medium text-foreground">{email}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm-email" className="text-foreground font-medium">
                    Votre adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <Input
                      id="confirm-email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10 bg-background border-border h-12 rounded-xl text-foreground"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full h-12 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90"
                >
                  {isSending ? "Envoi en cours…" : "Recevoir un nouveau lien"}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground">
              <Link
                to={
                  params.next && params.next.startsWith("/") && !params.next.startsWith("//")
                    ? `/auth?next=${encodeURIComponent(params.next)}`
                    : "/auth"
                }
                className="text-primary font-medium hover:underline"
              >
                Retour à la connexion
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthConfirm;
