import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign } from "lucide-react";
import heroImage from "@/assets/hero-immobilier-senegal.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Immobilier moderne au Sénégal"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(160,220,180,0.1),transparent_50%)]"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-2 xs:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up flex flex-col items-center">
          <h1 className="text-3xl xs:text-4xl md:text-6xl font-bold text-white mb-4 xs:mb-6 leading-tight px-2">
            Trouvez votre bien immobilier idéal au{" "}
            <span className="text-secondary-glow">Sénégal</span>
          </h1>
          <p className="text-base xs:text-lg md:text-xl text-white/90 mb-8 xs:mb-10 max-w-2xl mx-auto px-4">
            La plateforme moderne et intuitive pour acheter, vendre ou louer votre propriété
          </p>

          {/* Search Bar */}
          <div className="glass-effect rounded-2xl p-4 xs:p-6 shadow-elevated w-full max-w-3xl mx-auto animate-scale-in">
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
                <Button className="w-full h-11 xs:h-12 bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold text-sm xs:text-base">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 md:gap-6 mt-8 xs:mt-12 w-full max-w-3xl mx-auto px-2">
            {[
              { label: "Biens disponibles", value: "500+" },
              { label: "Villes couvertes", value: "15+" },
              { label: "Clients satisfaits", value: "1000+" },
              { label: "Agences partenaires", value: "50+" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-effect rounded-xl p-3 xs:p-4 hover-lift text-center flex flex-col items-center justify-center"
              >
                <div className="text-xl xs:text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs xs:text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
