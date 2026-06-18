import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, Sparkles, ArrowDown } from "lucide-react";
import heroImageDesktop from "@/assets/hero-senegal-futuriste.jpg";
import heroImageMobile from "@/assets/hero-senegal-futuriste-mobile.jpg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full Background Image - much more visible */}
      <div className="absolute inset-0 z-0">
        <picture className="w-full h-full">
          <source media="(max-width: 768px)" srcSet={heroImageMobile} />
          <source media="(min-width: 769px)" srcSet={heroImageDesktop} />
          <img 
            src={heroImageDesktop} 
            alt="Dakar futuriste - Immobilier moderne au Sénégal" 
            className="w-full h-full object-cover object-[center_35%] sm:object-center" 
          />
        </picture>
        {/* Adaptive overlay: denser on mobile for portrait image readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/92 via-background/80 to-background/95 sm:from-background/85 sm:via-background/70 sm:to-background/95"></div>
        {/* Mobile-focused radial dim around text area */}
        <div className="absolute inset-0 sm:hidden bg-[radial-gradient(ellipse_at_center,hsl(var(--background)/0.55)_0%,transparent_70%)]"></div>
        {/* Subtle color tints from logo */}
        <div className="absolute inset-0 bg-mesh opacity-80 sm:opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12)_0%,transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.1)_0%,transparent_60%)]"></div>

      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-24 pb-12">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-background/80 backdrop-blur-md border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">
              Plateforme immobilière N°1 au Sénégal
            </span>
          </div>

          <div className="mb-6 px-2">
            <h1 className="text-3xl xs:text-4xl md:text-6xl lg:text-7xl font-black leading-[1.15] tracking-tight text-foreground drop-shadow-sm">
              Trouvez votre
            </h1>
            <h1 className="text-3xl xs:text-4xl md:text-6xl lg:text-7xl font-black leading-[1.15] tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              bien idéal
            </h1>
          </div>
          
          <p className="text-lg xs:text-xl md:text-2xl mb-10 max-w-2xl mx-auto px-4 text-muted-foreground font-medium">
            Gestion locative, vente et estimation — votre partenaire de confiance au Sénégal
          </p>


          {/* Search Bar - Modern floating card */}
          <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="bg-background/70 backdrop-blur-2xl rounded-3xl p-4 xs:p-6 border border-border/40 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  {isMobile ? (
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary flex-shrink-0 pointer-events-none z-10" />
                      <select 
                        value={propertyType} 
                        onChange={e => setPropertyType(e.target.value)} 
                        className="w-full bg-muted/50 border border-border/50 h-12 rounded-xl text-sm pl-10 pr-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23d4956a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="">Type de bien</option>
                        <option value="Appartement">Appartement</option>
                        <option value="Maison">Maison</option>
                        <option value="Villa">Villa</option>
                        <option value="Terrain">Terrain</option>
                        <option value="Bureau">Bureau</option>
                      </select>
                    </div>
                  ) : (
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="w-full bg-muted/50 border-border/50 h-12 rounded-xl text-sm hover:border-primary/50 transition-all focus:ring-primary/50">
                        <Home className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                        <SelectValue placeholder="Type de bien" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4} align="start" className="glass-effect border-primary/20">
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
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                    <Input 
                      placeholder="Ville" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      className="pl-10 bg-muted/50 border-border/50 h-12 rounded-xl text-sm hover:border-secondary/50 focus:border-secondary focus:ring-secondary/50 transition-all" 
                    />
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <div className="relative">
                    <Input 
                      placeholder="Prix max (XOF)" 
                      type="number" 
                      value={maxPrice} 
                      onChange={e => setMaxPrice(e.target.value)} 
                      className="px-4 bg-muted/50 border-border/50 h-12 rounded-xl text-sm hover:border-accent/50 focus:border-accent focus:ring-accent/50 transition-all" 
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <Button 
                    onClick={handleSearch} 
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all duration-300 rounded-xl font-bold text-sm group"
                  >
                    <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Rechercher
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Modern bento grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 w-full max-w-4xl mx-auto px-2">
            {[
              { label: "Biens disponibles", value: "500+", color: "primary" },
              { label: "Villes couvertes", value: "15+", color: "accent" },
              { label: "Clients satisfaits", value: "1000+", color: "secondary" },
              { label: "Agences partenaires", value: "50+", color: "primary" },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-background/85 backdrop-blur-xl border border-border/50 p-4 xs:p-5 hover:-translate-y-1 hover:border-primary/40 transition-all duration-500"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-${stat.color}/10 blur-2xl group-hover:bg-${stat.color}/20 transition-all duration-500`} />
                <div className="relative flex flex-col items-start">
                  <span className={`text-3xl xs:text-4xl font-black bg-gradient-to-br from-${stat.color} to-${stat.color}/60 bg-clip-text text-transparent leading-none`}>
                    {stat.value}
                  </span>
                  <span className="mt-2 text-xs xs:text-sm font-medium text-muted-foreground text-left">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ArrowDown className="w-6 h-6 text-foreground/40" />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
};

export default Hero;
