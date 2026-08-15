import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PACK_LABELS: Record<string, string> = {
  boost: "Boost",
  premium: "Premium",
  agence: "Agence",
};

const BILLINGS = ["monthly", "yearly"] as const;
type Billing = (typeof BILLINGS)[number];
const PENDING_KEY = "pending_pack_checkout";

type PaymentState = "loading" | "active" | "pending" | "expired" | "none" | "error";

const PackCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawPack = (searchParams.get("pack") || "").trim().toLowerCase();
  const rawBilling = (searchParams.get("billing") || "").trim().toLowerCase();
  const packId = Object.prototype.hasOwnProperty.call(PACK_LABELS, rawPack) ? rawPack : "";
  const billing: Billing | "" = (BILLINGS as readonly string[]).includes(rawBilling)
    ? (rawBilling as Billing)
    : "";

  const [state, setState] = useState<PaymentState>("loading");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  const idemStorageKey = `pack_idem_${packId}_${billing}`;

  const getIdempotencyKey = useCallback((rotate = false) => {
    try {
      if (rotate) sessionStorage.removeItem(idemStorageKey);
      let key = sessionStorage.getItem(idemStorageKey) || "";
      if (!key) {
        key = crypto.randomUUID().replace(/-/g, "");
        sessionStorage.setItem(idemStorageKey, key);
      }
      return key;
    } catch {
      return crypto.randomUUID().replace(/-/g, "");
    }
  }, [idemStorageKey]);

  const startPayment = useCallback(
    async (forceNew = false) => {
      setBusy(true);
      setError(null);
      try {
        const idempotencyKey = getIdempotencyKey(forceNew);
        const { data, error: fnError } = await supabase.functions.invoke("initiate-pack-payment", {
          body: { packId, billing, idempotencyKey, forceNew, origin: window.location.origin },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        if (!data?.paymentUrl) throw new Error("Lien de paiement indisponible");
        try {
          sessionStorage.removeItem(PENDING_KEY);
        } catch { /* ignore */ }
        window.location.replace(data.paymentUrl);
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Le paiement n'a pas pu être lancé");
      } finally {
        setBusy(false);
      }
    },
    [packId, billing, getIdempotencyKey],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Paramètres invalides -> retour propre à l'écran de choix des packs
    if (!packId || !billing) {
      try {
        sessionStorage.removeItem(PENDING_KEY);
      } catch { /* ignore */ }
      navigate("/#packs", { replace: true });
      return;
    }

    const nextPath = `/checkout?pack=${encodeURIComponent(packId)}&billing=${billing}`;
    const goToAuth = () => {
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ packId, billing }));
      } catch { /* ignore */ }
      navigate(`/auth?next=${encodeURIComponent(nextPath)}`, { replace: true });
    };

    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        goToAuth();
        return;
      }

      // 1) Statut courant du paiement pour ce pack/billing
      const { data, error: fnError } = await supabase.functions.invoke("initiate-pack-payment", {
        body: { packId, billing, mode: "status" },
      });
      if (fnError || data?.error) {
        setState("error");
        setError(data?.error || "Impossible de vérifier le statut du paiement");
        return;
      }

      if (data?.state === "active") {
        setExpiresAt(data.expiresAt ?? null);
        setState("active");
        return;
      }

      if (data?.state === "expired") {
        // Lien précédent périmé : on propose une relance (même pack, même billing)
        setState("expired");
        return;
      }

      // 2) Aucun lien valide connu -> on lance (ou réutilise) le paiement
      setState("pending");
      await startPayment(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") goToAuth();
    });

    run();

    return () => subscription.unsubscribe();
  }, [packId, billing, navigate, startPayment]);

  const packLabel = PACK_LABELS[packId] ?? "";
  const billingLabel = billing === "yearly" ? "annuel" : "mensuel";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          {state === "error" ? (
            <>
              <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Paiement indisponible</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button
                onClick={() => startPayment(true)}
                disabled={busy}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mb-3"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Générer un nouveau lien de paiement
              </Button>
              <Link to="/#packs">
                <Button variant="outline" className="w-full h-12 rounded-xl font-semibold">
                  Revenir aux packs
                </Button>
              </Link>
            </>
          ) : state === "active" ? (
            <>
              <CheckCircle2 className="h-10 w-10 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Pack {packLabel} actif</h1>
              <p className="text-muted-foreground mb-6">
                Votre abonnement {billingLabel} est valide
                {expiresAt ? ` jusqu'au ${new Date(expiresAt).toLocaleDateString("fr-FR")}` : ""}.
              </p>
              <Link to="/dashboard">
                <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mb-3">
                  Aller au tableau de bord
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => startPayment(true)}
                disabled={busy}
                className="w-full h-12 rounded-xl font-semibold"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Renouveler maintenant
              </Button>
            </>
          ) : state === "expired" ? (
            <>
              <Clock className="h-10 w-10 mx-auto text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Lien de paiement expiré</h1>
              <p className="text-muted-foreground mb-6">
                Votre précédent lien pour le pack {packLabel} ({billingLabel}) n'est plus valable.
                Relancez un nouveau paiement, le pack et la facturation restent identiques.
              </p>
              <Button
                onClick={() => startPayment(true)}
                disabled={busy}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mb-3"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Relancer le paiement
              </Button>
              <Link to="/#packs">
                <Button variant="outline" className="w-full h-12 rounded-xl font-semibold">
                  Changer de pack
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
              <h1 className="text-2xl font-bold mb-2">Pack {packLabel}</h1>
              <p className="text-muted-foreground mb-4">
                {state === "loading"
                  ? "Vérification du statut de votre paiement…"
                  : `Redirection vers le paiement sécurisé (${billingLabel})…`}
              </p>
              <p className="inline-flex items-center gap-2 text-sm text-primary font-medium">
                <ShieldCheck className="h-4 w-4" />
                Paiement sécurisé
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PackCheckout;
