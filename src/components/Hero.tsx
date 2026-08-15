import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, ShieldCheck } from "lucide-react";
import heroImageDesktop from "@/assets/hero-senegal-futuriste.jpg";
import heroImageMobile from "@/assets/hero-senegal-futuriste-mobile.jpg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: "+10 000", label: "biens immobiliers" },
  { value: "+1 500", label: "propriétaires" },
  { value: "+500", label: "professionnels" },
];

const Hero = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"vente" | "location">("vente");
  const [propertyType, setPropertyType] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("transaction", mode);
    if (propertyType) params.set("type", propertyType);
    if (city) params.set("city", city);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Photographie immobilière plein écran */}
      <div className="absolute inset-0 z-0">
        <picture className="w-full h-full">
          <source media="(max-width: 768px)" srcSet={heroImageMobile} />
          <source media="(min-width: 769px)" srcSet={heroImageDesktop} />
          <img
            src={heroImageDesktop}
            alt="Villa contemporaine haut de gamme au Sénégal"
            className="w-full h-full object-cover object-[center_40%]"
          />
        </picture>
        {/* Voile bleu nuit pour lisibilité premium */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-primary/40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-28 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-primary-foreground">
              Plateforme immobilière sécurisée — Sénégal & Afrique de l'Ouest
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-primary-foreground">
            Trouvez le bien qui correspond à
            <span className="text-accent"> votre projet.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg lg:text-xl text-primary-foreground/85 max-w-2xl leading-relaxed">
            Achetez, louez, vendez ou publiez votre bien immobilier sur une plateforme simple,
            moderne et sécurisée.
          </p>
        </div>

        {/* Barre de recherche flottante */}
        <div className="mt-9 w-full max-w-5xl">
          <div className="rounded-2xl bg-card shadow-[0_30px_70px_-30px_hsl(var(--primary)/0.6)] border border-border overflow-hidden">
            {/* Onglets */}
            <div className="flex border-b border-border">
              {([
                { key: "vente", label: "Acheter" },
                { key: "location", label: "Louer" },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMode(tab.key)}
                  className={`relative px-6 sm:px-8 py-3.5 text-sm sm:text-base font-semibold transition-colors ${
                    mode === tab.key
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {mode === tab.key && (
                    <span className="absolute bottom-0 left-4 right-4 h-[3px] rounded-full bg-secondary" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Que recherchez-vous ?"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 pl-10 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="md:col-span-3 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Localisation"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 pl-10 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="md:col-span-2">
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="h-12 rounded-xl bg-background border-border text-foreground">
                    <Home className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} align="start">
                    <SelectItem value="Appartement">Appartement</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Maison">Maison</SelectItem>
                    <SelectItem value="Terrain">Terrain</SelectItem>
                    <SelectItem value="Bureau">Bureau</SelectItem>
                    <SelectItem value="Commerce">Commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1.5 md:col-span-2">
                <Input
                  placeholder="Budget max"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-12 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="md:col-span-1">
                <Button
                  onClick={handleSearch}
                  className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-[0_10px_24px_-10px_hsl(var(--secondary)/0.9)] transition-all"
                >
                  <Search className="h-4 w-4 md:mr-0 mr-2" />
                  <span className="md:hidden">Rechercher</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-3">
            {stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-accent">{s.value}</span>
                <span className="text-sm text-primary-foreground/80">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
