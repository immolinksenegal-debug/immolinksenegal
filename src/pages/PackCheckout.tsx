import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
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

const PackCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawPack = (searchParams.get("pack") || "").trim().toLowerCase();
  const rawBilling = (searchParams.get("billing") || "").trim().toLowerCase();
  const packId = Object.prototype.hasOwnProperty.call(PACK_LABELS, rawPack) ? rawPack : "";
  const billing: Billing | "" = (BILLINGS as readonly string[]).includes(rawBilling)
    ? (rawBilling as Billing)
    : "";
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

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
      // Mémorise l'intention pour reprendre exactement le même pack après connexion
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ packId, billing }));
      } catch { /* ignore */ }
      navigate(`/auth?next=${encodeURIComponent(nextPath)}`, { replace: true });
    };

    const startPayment = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("initiate-pack-payment", {
          body: { packId, billing, origin: window.location.origin },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        if (!data?.paymentUrl) throw new Error("Lien de paiement indisponible");
        try {
          sessionStorage.removeItem(PENDING_KEY);
        } catch { /* ignore */ }
        window.location.replace(data.paymentUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Le paiement n'a pas pu être lancé");
      }
    };

    const run = async () => {
      // Session vérifiée côté serveur d'auth (évite les faux négatifs à l'hydratation)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        goToAuth();
        return;
      }
      await startPayment();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") goToAuth();
    });

    run();

    return () => subscription.unsubscribe();
  }, [packId, billing, navigate]);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          {error ? (
            <>
              <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Paiement indisponible</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link to="/#packs">
                <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Revenir aux packs
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
              <h1 className="text-2xl font-bold mb-2">
                Pack {PACK_LABELS[packId] ?? ""}
              </h1>
              <p className="text-muted-foreground mb-4">
                Redirection vers le paiement sécurisé ({billing === "yearly" ? "annuel" : "mensuel"})…
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
