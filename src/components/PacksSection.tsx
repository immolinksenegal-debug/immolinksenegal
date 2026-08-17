import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Sparkles, Zap, Crown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const billingToggle = [
  { label: "Mensuel", value: "monthly" },
  { label: "Annuel", value: "yearly" },
];

const packs = [
  {
    id: "decouverte",
    name: "Découverte",
    description: "Idéal pour tester la plateforme.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Sparkles,
    cta: "Publier gratuitement",
    to: "/dashboard",
    payable: false,
    features: ["1 annonce active", "Visibilité standard", "7 jours de diffusion", "Messagerie de contact"],
    excluded: ["Mise en avant", "Badge vérifié", "Statistiques avancées"],
    highlighted: false,
  },
  {
    id: "boost",
    name: "Boost",
    description: "Pour vendre ou louer rapidement.",
    monthlyPrice: 2500,
    yearlyPrice: 24000,
    icon: Zap,
    cta: "Choisir Boost",
    to: "/dashboard",
    payable: true,
    features: ["5 annonces actives", "Mise en avant 7 jours", "Statistiques de vues", "Badge Boost", "Support prioritaire"],
    excluded: ["Top position permanente", "Multi-utilisateurs"],
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Le plus choisi par les propriétaires.",
    monthlyPrice: 7500,
    yearlyPrice: 72000,
    icon: Crown,
    cta: "Choisir Premium",
    to: "/dashboard",
    payable: true,
    features: ["20 annonces actives", "Top position 14 jours/mois", "Badge Vérifié", "Estimation IA illimitée", "Statistiques avancées", "Support prioritaire"],
    excluded: ["Multi-utilisateurs"],
    highlighted: true,
  },
  {
    id: "agence",
    name: "Agence",
    description: "Pour les professionnels de l’immobilier.",
    monthlyPrice: 25000,
    yearlyPrice: 250000,
    icon: Building2,
    cta: "Contacter l’équipe commerciale",
    to: "/contact",
    payable: false,
    features: ["Annonces illimitées", "Top position permanente", "CRM & gestion des prospects", "Jusqu’à 10 collaborateurs", "API & exports", "Account manager dédié"],
    excluded: [],
    highlighted: false,
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-FR").format(price);
};

const PacksSection = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (packId: string) => {
    try {
      setLoadingPack(packId);
      const checkoutPath = `/checkout?pack=${encodeURIComponent(packId)}&billing=${billing}`;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.info("Connectez-vous pour finaliser votre pack");
        navigate(`/auth?next=${encodeURIComponent(checkoutPath)}`);
        return;
      }

      const { data, error } = await supabase.functions.invoke("initiate-pack-payment", {
        body: { packId, billing, origin: window.location.origin },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.paymentUrl) throw new Error("Lien de paiement indisponible");

      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Le paiement n'a pas pu être lancé");
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <section id="packs" className="py-16 sm:py-24 bg-muted/40 relative overflow-hidden">
      {/* Background mesh */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{ background: "transparent" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
            Nos forfaits
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
            Des packs adaptés à chaque besoin.
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Que vous soyez particulier, propriétaire ou professionnel, choisissez la formule qui vous correspond et maximisez la visibilité de vos biens.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-soft">
            {billingToggle.map((option) => (
              <button
                key={option.value}
                onClick={() => setBilling(option.value as "monthly" | "yearly")}
                className={cn(
                  "relative px-5 py-2 text-sm font-semibold rounded-full transition-colors",
                  billing === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={billing === option.value}
              >
                {option.label}
                {option.value === "yearly" && (
                  <span className="ml-2 hidden sm:inline-block text-[10px] uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {packs.map((pack) => {
            const Icon = pack.icon;
            const price = billing === "monthly" ? pack.monthlyPrice : pack.yearlyPrice;
            const period = billing === "monthly" ? "/mois" : "/an";

            return (
              <div
                key={pack.id}
                className={cn(
                  "group relative rounded-3xl border p-6 sm:p-7 flex flex-col pack-card",
                  pack.highlighted
                    ? "pack-card-featured bg-primary border-primary text-primary-foreground shadow-[0_24px_60px_-20px_hsl(var(--primary)/0.35)] scale-[1.02]"
                    : "bg-card border-border shadow-card"
                )}
              >
                {pack.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-glow">
                      <Sparkles className="h-3 w-3" />
                      Le plus populaire
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center mb-4 icon-pop",
                      pack.highlighted ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300" />
                  </div>
                  <h3 className={cn("font-display text-xl sm:text-2xl font-bold", pack.highlighted ? "text-primary-foreground" : "text-foreground")}>
                    {pack.name}
                  </h3>
                  <p className={cn("mt-1 text-sm", pack.highlighted ? "text-primary-foreground/75" : "text-muted-foreground")}>
                    {pack.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={cn("font-display text-3xl sm:text-4xl font-extrabold", pack.highlighted ? "text-primary-foreground" : "text-foreground")}>
                      {price === 0 ? "Gratuit" : `${formatPrice(price)} FCFA`}
                    </span>
                    {price > 0 && (
                      <span className={cn("text-sm", pack.highlighted ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {period}
                      </span>
                    )}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className={cn("mt-1 text-xs", pack.highlighted ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      Économisez {formatPrice(pack.monthlyPrice * 12 - pack.yearlyPrice)} FCFA/an
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={cn("h-4 w-4 mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110", pack.highlighted ? "text-secondary" : "text-secondary")} />
                      <span className={cn("text-sm", pack.highlighted ? "text-primary-foreground/90" : "text-foreground")}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {pack.excluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className={cn("h-4 w-4 mt-0.5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold", pack.highlighted ? "bg-primary-foreground/20 text-primary-foreground/60" : "bg-muted text-muted-foreground")}>
                        -
                      </span>
                      <span className={cn("text-sm", pack.highlighted ? "text-primary-foreground/50" : "text-muted-foreground/80 line-through")}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {pack.payable ? (
                  <Button
                    onClick={() => handleSubscribe(pack.id)}
                    disabled={loadingPack === pack.id}
                    className={cn(
                      "btn-sheen w-full h-12 rounded-xl font-semibold transition-all duration-300 active:translate-y-px",
                      pack.highlighted
                        ? "bg-primary text-primary-foreground border-2 border-primary-foreground/70 hover:bg-primary-foreground hover:text-primary shadow-[0_12px_30px_-12px_hsl(var(--foreground)/0.5)]"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {loadingPack === pack.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Redirection...
                      </>
                    ) : (
                      pack.cta
                    )}
                  </Button>
                ) : (
                  <Link to={pack.to} className="block">
                    <Button
                      className={cn(
                        "btn-sheen w-full h-12 rounded-xl font-semibold transition-all duration-300 active:translate-y-px",
                        pack.highlighted
                          ? "bg-primary text-primary-foreground border-2 border-primary-foreground/70 hover:bg-primary-foreground hover:text-primary shadow-[0_12px_30px_-12px_hsl(var(--foreground)/0.5)]"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {pack.cta}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Tous les prix sont en FCFA. Paiement sécurisé par mobile money ou carte bancaire. Annulation à tout moment.
        </p>
      </div>
    </section>
  );
};

export default PacksSection;
