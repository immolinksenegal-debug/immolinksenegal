import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MessageSquare, CheckCircle2 } from "lucide-react";

const OwnerSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--secondary)/0.35)_0%,transparent_55%)]" />
          <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-12 lg:p-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent mb-4">Propriétaires</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground leading-tight">
                Votre bien mérite d'être vu.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
                Publiez votre bien, touchez davantage de prospects et gérez vos annonces depuis un
                espace professionnel.
              </p>

              <ul className="mt-7 space-y-3">
                {["Publication en quelques étapes", "Statistiques de performance en temps réel", "Demandes et visites centralisées"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-primary-foreground/90">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span className="text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to="/dashboard" className="inline-block mt-8">
                <Button className="h-12 px-7 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-[0_12px_30px_-12px_hsl(var(--secondary)/0.9)]">
                  Publier mon bien
                </Button>
              </Link>
            </div>

            {/* Aperçu dashboard */}
            <div className="relative">
              <div className="rounded-2xl bg-card border border-border shadow-elevated p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Tableau de bord</p>
                    <p className="font-display font-bold text-foreground">Mes performances</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                    +18% ce mois
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: Eye, value: "2 480", label: "Vues" },
                    { icon: MessageSquare, value: "124", label: "Contacts" },
                    { icon: BarChart3, value: "12", label: "Annonces" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="rounded-xl border border-border bg-muted/40 p-3">
                      <Icon className="h-4 w-4 text-secondary mb-2" />
                      <p className="font-display font-bold text-foreground">{value}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-end gap-2 h-24">
                  {[40, 62, 48, 78, 56, 88, 70].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 rounded-t-md bg-primary/20"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerSection;
