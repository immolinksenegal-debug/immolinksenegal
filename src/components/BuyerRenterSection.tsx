import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, KeyRound } from "lucide-react";

const cards = [
  {
    icon: Search,
    title: "Je cherche à acheter",
    text: "Trouvez votre prochain investissement ou votre future résidence.",
    cta: "Rechercher un bien",
    to: "/properties?transaction=vente",
  },
  {
    icon: KeyRound,
    title: "Je cherche à louer",
    text: "Découvrez des logements disponibles correspondant à votre budget.",
    cta: "Voir les locations",
    to: "/properties?transaction=location",
  },
];

const BuyerRenterSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {cards.map(({ icon: Icon, title, text, cta, to }) => (
            <div
              key={title}
              className="group rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-soft hover:shadow-elevated transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors duration-300">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">{title}</h3>
              <p className="mt-3 text-muted-foreground text-base leading-relaxed max-w-md">{text}</p>
              <Link to={to} className="inline-block mt-7">
                <Button
                  variant="outline"
                  className="h-11 px-6 rounded-xl border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground font-semibold transition-colors"
                >
                  {cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuyerRenterSection;
