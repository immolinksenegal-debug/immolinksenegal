import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign } from "lucide-react";
import heroImage from "@/assets/banner-villas-senegal.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Hero = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [propertyType, setPropertyType] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (propertyType) params.set('type', propertyType);
    if (city) params.set('city', city);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    navigate(`/properties?${params.toString()}`);
  };
  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden pt-20 xs:pt-22 md:pt-24 lg:pt-28">
      {/* Background Image with Modern Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Villas modernes au Sénégal - Gestion locative professionnelle"
          className="w-full h-full object-cover object-[center_40%] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/30 to-background/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(237,116,60,0.08)_0%,transparent_70%)]"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-2 xs:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up flex flex-col items-center">
          {/* Badge Premium */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 glass-effect-dark rounded-full border border-accent/30">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-sm font-semibold text-foreground">Immo Link Sénégal</span>
          </div>

          <h1 className="text-3xl xs:text-4xl md:text-6xl lg:text-7xl font-light text-foreground mb-4 xs:mb-6 leading-tight px-2 tracking-tight">
            Gestion locative et solutions{" "}
            <span className="font-bold bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent">
              immobilières modernes
            </span>
          </h1>
          <p className="text-base xs:text-lg md:text-xl text-muted-foreground font-light mb-8 xs:mb-10 max-w-2xl mx-auto px-4">
            Votre partenaire de confiance pour vendre, louer ou estimer votre bien
          </p>

          {/* Search Bar */}
          <div className="glass-effect rounded-3xl p-5 xs:p-7 shadow-glow-secondary w-full max-w-3xl mx-auto animate-scale-in border-2 border-secondary/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4">
              <div className="sm:col-span-1">
                {isMobile ? (
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary flex-shrink-0 pointer-events-none z-10" />
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full bg-white/90 border border-white/30 h-11 xs:h-12 rounded-xl text-sm xs:text-base pl-10 pr-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.5em 1.5em',
                      }}
                    >
                      <option value="">Type</option>
                      <option value="Appartement">Appartement</option>
                      <option value="Maison">Maison</option>
                      <option value="Villa">Villa</option>
                      <option value="Terrain">Terrain</option>
                      <option value="Bureau">Bureau</option>
                    </select>
                  </div>
                ) : (
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="w-full bg-white/90 border-white/30 h-11 xs:h-12 rounded-xl text-sm xs:text-base">
                      <Home className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent 
                      position="popper" 
                      sideOffset={4}
                      align="start"
                    >
                      <SelectItem value="Appartement">Appartement</SelectItem>
                      <SelectItem value="Maison">Maison</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Terrain">Terrain</SelectItem>
                      <SelectItem value="Bureau">Bureau</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="sm:col-span-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    placeholder="Ville"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10 bg-white/90 border-white/30 h-11 xs:h-12 rounded-xl text-sm xs:text-base"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    placeholder="Prix max"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="pl-10 bg-white/90 border-white/30 h-11 xs:h-12 rounded-xl text-sm xs:text-base"
                  />
                </div>
              </div>

               <div className="sm:col-span-2 lg:col-span-1">
                <Button 
                  onClick={handleSearch}
                  className="w-full h-11 xs:h-12 bg-gradient-to-r from-accent via-accent to-secondary hover:shadow-glow-accent text-white shadow-elevated transition-smooth rounded-xl font-bold text-sm xs:text-base"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xs:gap-5 md:gap-7 mt-10 xs:mt-14 w-full max-w-4xl mx-auto px-2">
            {[
              { label: "Biens disponibles", value: "500+", color: "primary" },
              { label: "Villes couvertes", value: "15+", color: "secondary" },
              { label: "Clients satisfaits", value: "1000+", color: "accent" },
              { label: "Agences partenaires", value: "50+", color: "primary" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-effect-dark rounded-2xl p-4 xs:p-5 hover-lift text-center flex flex-col items-center justify-center border-2 border-white/10 hover:border-accent/50 transition-smooth group"
              >
                <div className={`text-2xl xs:text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-br from-accent via-white to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-smooth`}>
                  {stat.value}
                </div>
                <div className="text-xs xs:text-sm font-medium text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
