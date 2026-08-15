import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const locations = [
  { city: "Dakar", span: "md:col-span-2 md:row-span-2" },
  { city: "Almadies", span: "" },
  { city: "Mermoz", span: "" },
  { city: "Ngor", span: "" },
  { city: "Saly", span: "md:col-span-2" },
  { city: "Mbour", span: "" },
  { city: "Diamniadio", span: "" },
  { city: "Thiès", span: "" },
  { city: "Saint-Louis", span: "" },
];

const LocationsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary mb-3">Localisations</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
              Explorez les zones les plus recherchées
            </h2>
          </div>
          <Link to="/properties" className="text-sm font-semibold text-primary hover:text-secondary transition-colors">
            Voir toutes les zones →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[130px] sm:auto-rows-[160px] gap-4">
          {locations.map(({ city, span }) => (
            <Link
              key={city}
              to={`/properties?city=${encodeURIComponent(city)}`}
              className={`group relative rounded-2xl overflow-hidden border border-border bg-primary shadow-card hover:shadow-elevated transition-all duration-300 ${span}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.35)_0%,transparent_60%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="font-display text-lg sm:text-xl font-bold text-primary-foreground">{city}</span>
                </div>
                <span className="text-xs sm:text-sm text-primary-foreground/70 group-hover:text-primary-foreground transition-colors">
                  Découvrir les biens
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
