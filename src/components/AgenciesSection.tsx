import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, ClipboardList, Users, LineChart, MessagesSquare, UserCog, Inbox, LayoutGrid } from "lucide-react";

const features = [
  { icon: Building2, label: "Gestion des biens" },
  { icon: ClipboardList, label: "Gestion des annonces" },
  { icon: Users, label: "Gestion des prospects" },
  { icon: LayoutGrid, label: "CRM intégré" },
  { icon: LineChart, label: "Statistiques" },
  { icon: UserCog, label: "Gestion des équipes" },
  { icon: MessagesSquare, label: "Messagerie" },
  { icon: Inbox, label: "Gestion des demandes" },
];

const AgenciesSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary mb-3">Professionnels</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
            Une plateforme pensée pour les professionnels de l'immobilier.
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Agences, promoteurs et gestionnaires : centralisez vos biens, vos prospects et vos
            performances dans un espace unique.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-5 hover:border-secondary/40 hover:shadow-card transition-all duration-300"
            >
              <Icon className="h-5 w-5 text-secondary mb-3" />
              <p className="font-semibold text-sm sm:text-base text-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link to="/contact">
            <Button className="h-12 px-7 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Découvrir l'offre professionnelle
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AgenciesSection;
