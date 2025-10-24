import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign } from "lucide-react";
import heroImage from "@/assets/hero-mer-senegal.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Hero = () => {
  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden pt-20 xs:pt-22 md:pt-24 lg:pt-28">
      {/* Drapeau Sénégal en haut */}
      <div className="absolute top-0 left-0 right-0 z-20 flex">
        <div className="senegal-flag-stripe senegal-flag-green"></div>
        <div className="senegal-flag-stripe senegal-flag-yellow"></div>
        <div className="senegal-flag-stripe senegal-flag-red"></div>
      </div>

      {/* Background Image with Modern Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Immobilier moderne au Sénégal"
          className="w-full h-full object-cover scale-110 animate-[scale-in_20s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 gradient-overlay animate-senegal-wave"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,223,66,0.15)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,133,63,0.2)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(227,27,35,0.15)_0%,transparent_50%)]"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-2 xs:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up flex flex-col items-center">
          {/* Badge Sénégal */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-effect-dark rounded-full animate-pulse-glow">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm font-semibold text-white">🇸🇳 Plateforme N°1 au Sénégal</span>
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          </div>

          <h1 className="text-4xl xs:text-5xl md:text-7xl font-extrabold text-white mb-4 xs:mb-6 leading-tight px-2 drop-shadow-2xl">
            Trouvez votre bien immobilier idéal au{" "}
            <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent animate-senegal-wave">
              Sénégal
            </span>
          </h1>
          <p className="text-lg xs:text-xl md:text-2xl text-white font-medium mb-8 xs:mb-10 max-w-2xl mx-auto px-4 drop-shadow-lg">
            La plateforme moderne et intuitive pour acheter, vendre ou louer votre propriété
          </p>

          {/* Search Bar */}
          <div className="glass-effect rounded-3xl p-5 xs:p-7 shadow-glow-secondary w-full max-w-3xl mx-auto animate-scale-in border-2 border-secondary/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4">
              <div className="sm:col-span-1">
                <Select>
                  <SelectTrigger className="w-full bg-white/90 border-white/30 h-11 xs:h-12 rounded-xl text-sm xs:text-base">
                    <Home className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appartement">Appartement</SelectItem>
                    <SelectItem value="maison">Maison</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="bureau">Bureau</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    placeholder="Ville"
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
                    className="pl-10 bg-white/90 border-white/30 h-11 xs:h-12 rounded-xl text-sm xs:text-base"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <Button className="w-full h-11 xs:h-12 bg-gradient-to-r from-secondary via-secondary-glow to-secondary hover:shadow-glow-secondary text-primary-foreground shadow-elevated transition-smooth rounded-xl font-bold text-sm xs:text-base animate-pulse-glow">
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
                className="glass-effect-dark rounded-2xl p-4 xs:p-5 hover-lift text-center flex flex-col items-center justify-center border-2 border-white/10 hover:border-secondary/50 transition-smooth group"
              >
                <div className={`text-2xl xs:text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-br from-secondary via-white to-accent bg-clip-text text-transparent group-hover:scale-110 transition-smooth`}>
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
