import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-immobilier-senegal.jpg";
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
    <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden pt-20 xs:pt-22 md:pt-24 lg:pt-28">
      {/* Background Image with Futuristic Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Villas modernes au Sénégal - Gestion locative professionnelle" 
          className="w-full h-full object-cover object-[center_40%] sm:object-center opacity-40" 
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
        {/* Neon glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.15)_0%,transparent_50%)]"></div>
        {/* Animated scan line */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan-line_4s_linear_infinite]"></div>
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30 animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-2 xs:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up flex flex-col items-center">
          {/* Badge Premium with neon effect */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 glass-effect rounded-full border border-primary/30 animate-glow-pulse">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Immo Link Sénégal
            </span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_hsl(var(--primary))]"></span>
          </div>

          <h1 className="text-3xl xs:text-4xl md:text-6xl lg:text-7xl font-light text-foreground mb-4 xs:mb-6 leading-tight px-2 tracking-tight">
            Gestion locative et solutions{" "}
            <span className="font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
              immobilières modernes
            </span>
          </h1>
          
          <p className="text-base xs:text-lg mb-8 xs:mb-10 max-w-2xl mx-auto px-4 text-muted-foreground my-[15px] font-medium md:text-base text-center">
            Votre partenaire de confiance pour{" "}
            <span className="text-primary">vendre</span>,{" "}
            <span className="text-secondary">louer</span> ou{" "}
            <span className="text-accent">estimer</span> votre bien
          </p>

          {/* Search Bar with glassmorphism */}
          <div className="glass-effect rounded-2xl p-5 xs:p-7 w-full max-w-3xl mx-auto animate-scale-in border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4">
              <div className="sm:col-span-1">
                {isMobile ? (
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary flex-shrink-0 pointer-events-none z-10" />
                    <select 
                      value={propertyType} 
                      onChange={e => setPropertyType(e.target.value)} 
                      className="w-full bg-background/80 border border-border/50 h-11 xs:h-12 rounded-xl text-sm xs:text-base pl-10 pr-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300d4ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.5em 1.5em'
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
                    <SelectTrigger className="w-full bg-background/80 border-border/50 h-11 xs:h-12 rounded-xl text-sm xs:text-base hover:border-primary/50 transition-all focus:ring-primary/50">
                      <Home className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                      <SelectValue placeholder="Type" />
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
                    className="pl-10 bg-background/80 border-border/50 h-11 xs:h-12 rounded-xl text-sm xs:text-base hover:border-secondary/50 focus:border-secondary focus:ring-secondary/50 transition-all" 
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
                    className="px-4 bg-background/80 border-border/50 h-11 xs:h-12 rounded-xl text-sm xs:text-base hover:border-accent/50 focus:border-accent focus:ring-accent/50 transition-all" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <Button 
                  onClick={handleSearch} 
                  className="w-full h-11 xs:h-12 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] hover:bg-[position:right_center] text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all duration-500 rounded-xl font-bold text-sm xs:text-base group"
                >
                  <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats with neon cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xs:gap-5 md:gap-7 mt-10 xs:mt-14 w-full max-w-4xl mx-auto px-2">
            {[
              { label: "Biens disponibles", value: "500+", color: "primary" },
              { label: "Villes couvertes", value: "15+", color: "secondary" },
              { label: "Clients satisfaits", value: "1000+", color: "accent" },
              { label: "Agences partenaires", value: "50+", color: "primary" }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="glass-effect rounded-2xl p-4 xs:p-5 text-center flex flex-col items-center justify-center border border-border/30 hover:border-primary/50 transition-all duration-300 group cursor-default"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className={`text-2xl xs:text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-br from-${stat.color} via-secondary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <div className="text-xs xs:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.label}
                </div>
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-${stat.color}/5 to-transparent`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
};

export default Hero;
