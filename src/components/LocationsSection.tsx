import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import dakarImg from "@/assets/loc-dakar.jpg";
import almadiesImg from "@/assets/loc-almadies.jpg";
import mermozImg from "@/assets/loc-mermoz.jpg";
import ngorImg from "@/assets/loc-ngor.jpg";
import salyImg from "@/assets/loc-saly.jpg";
import mbourImg from "@/assets/loc-mbour.jpg";
import diamniadioImg from "@/assets/loc-diamniadio.jpg";
import thiesImg from "@/assets/loc-thies.jpg";
import saintLouisImg from "@/assets/loc-saint-louis.jpg";

const locations = [
  { city: "Dakar", span: "col-span-2 row-span-2 md:col-span-2 md:row-span-2", image: dakarImg, alt: "Vue aérienne de Dakar au coucher du soleil", focal: "object-center", sizes: "(min-width: 768px) 50vw, 100vw" },
  { city: "Almadies", span: "", image: almadiesImg, alt: "Villas modernes en bord de mer aux Almadies", focal: "object-center", sizes: "(min-width: 768px) 25vw, 50vw" },
  { city: "Mermoz", span: "", image: mermozImg, alt: "Immeubles résidentiels du quartier Mermoz à Dakar", focal: "object-center", sizes: "(min-width: 768px) 25vw, 50vw" },
  { city: "Ngor", span: "", image: ngorImg, alt: "Île de Ngor et eaux turquoise", focal: "object-center", sizes: "(min-width: 768px) 25vw, 50vw" },
  { city: "Saly", span: "col-span-2 md:col-span-2", image: salyImg, alt: "Plage de Saly bordée de palmiers", focal: "object-[center_60%]", sizes: "(min-width: 768px) 50vw, 100vw" },
  { city: "Mbour", span: "", image: mbourImg, alt: "Pirogues colorées sur la plage de Mbour", focal: "object-[center_55%]", sizes: "(min-width: 768px) 25vw, 50vw" },
  { city: "Diamniadio", span: "", image: diamniadioImg, alt: "Nouvelle ville moderne de Diamniadio", focal: "object-center", sizes: "(min-width: 768px) 25vw, 50vw" },
  { city: "Thiès", span: "", image: thiesImg, alt: "Rue arborée de la ville de Thiès", focal: "object-center", sizes: "(min-width: 768px) 25vw, 50vw" },
  { city: "Saint-Louis", span: "", image: saintLouisImg, alt: "Architecture coloniale de Saint-Louis et pont Faidherbe", focal: "object-[center_45%]", sizes: "(min-width: 768px) 25vw, 50vw" },
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
          <Link to="/properties" className="text-sm font-semibold text-primary hover:text-primary transition-colors">
            Voir toutes les zones →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[130px] sm:auto-rows-[160px] gap-4">
          {locations.map(({ city, span, image, alt }) => (
            <Link
              key={city}
              to={`/properties?city=${encodeURIComponent(city)}`}
              className={`group relative rounded-2xl overflow-hidden border border-border bg-primary shadow-card hover:shadow-elevated transition-all duration-300 ${span}`}
            >
              <img
                src={image}
                alt={alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-primary/45 group-hover:bg-primary/35 transition-colors duration-300" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,hsl(var(--primary)/0.9),transparent)]" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="font-display text-lg sm:text-xl font-bold text-primary-foreground">{city}</span>
                </div>
                <span className="text-xs sm:text-sm text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
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
