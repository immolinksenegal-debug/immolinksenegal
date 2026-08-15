import { Link } from "react-router-dom";
import { Building2, Home, Landmark, Map, Briefcase, Store, Building, Hotel } from "lucide-react";

const categories = [
  { label: "Appartements", icon: Building2, type: "Appartement" },
  { label: "Villas", icon: Home, type: "Villa" },
  { label: "Maisons", icon: Landmark, type: "Maison" },
  { label: "Terrains", icon: Map, type: "Terrain" },
  { label: "Bureaux", icon: Briefcase, type: "Bureau" },
  { label: "Commerces", icon: Store, type: "Commerce" },
  { label: "Immeubles", icon: Building, type: "Immeuble" },
  { label: "Résidences", icon: Hotel, type: "Résidence" },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary mb-3">Catégories</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
            Explorez par catégorie
          </h2>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg">
            Sélectionnez le type de bien qui correspond à votre projet immobilier.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {categories.map(({ label, icon: Icon, type }) => (
            <Link
              key={label}
              to={`/properties?type=${encodeURIComponent(type)}`}
              className="group relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-secondary/10" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-primary/5 border border-border flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:border-secondary transition-colors duration-300">
                  <Icon className="h-5 w-5 text-primary group-hover:text-secondary-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-foreground text-base sm:text-lg">{label}</h3>
                <p className="text-sm text-muted-foreground mt-1">Voir les biens</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
