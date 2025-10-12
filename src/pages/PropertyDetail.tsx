import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Heart,
  Share2,
  Calendar,
} from "lucide-react";
import appartementImage from "@/assets/appartement-moderne.jpg";
import { useState } from "react";

const PropertyDetail = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data - en production, ces données viendraient d'une API
  const property = {
    id: id || "1",
    title: "Appartement moderne au Plateau",
    location: "Plateau, Dakar",
    price: "45.000.000",
    bedrooms: 3,
    bathrooms: 2,
    surface: 120,
    type: "Appartement",
    description:
      "Magnifique appartement moderne situé au cœur du Plateau. Cet espace lumineux offre une vue imprenable et dispose de finitions haut de gamme. Proche de toutes les commodités, transports et commerces. Idéal pour une famille ou un investissement locatif.",
    features: [
      "Parking privé",
      "Ascenseur",
      "Balcon",
      "Cuisine équipée",
      "Climatisation",
      "Sécurité 24/7",
      "Gardien",
      "Fibre optique",
    ],
    images: [appartementImage, appartementImage, appartementImage],
    publishedDate: "12 Mars 2025",
    seller: {
      name: "Agence Premium Dakar",
      phone: "+221 33 XXX XX XX",
      email: "contact@agencepremium.sn",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 xs:pt-20 pb-8 xs:pb-12">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          {/* Gallery */}
          <div className="mb-4 xs:mb-6 md:mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 xs:gap-4 rounded-xl xs:rounded-2xl overflow-hidden">
              <div className="md:col-span-2 aspect-video md:aspect-[21/9] overflow-hidden group">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                />
              </div>
              {property.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-video overflow-hidden group">
                  <img
                    src={image}
                    alt={`${property.title} ${index + 2}`}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xs:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 xs:space-y-6 animate-fade-in-up">
              {/* Header */}
              <div className="glass-effect rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-card">
                <div className="flex items-start justify-between mb-3 xs:mb-4">
                  <div className="flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="bg-primary text-primary-foreground text-xs xs:text-sm px-2 xs:px-3 py-1">
                        {property.type}
                      </Badge>
                      <span className="text-xs xs:text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 xs:h-4 xs:w-4" />
                        {property.publishedDate}
                      </span>
                    </div>
                    <h1 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-sm xs:text-base text-muted-foreground">
                      <MapPin className="h-4 w-4 xs:h-5 xs:w-5 mr-1 text-secondary" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 xs:gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-xl h-8 w-8 xs:h-10 xs:w-10"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={`h-4 w-4 xs:h-5 xs:w-5 ${
                          isFavorite ? "fill-destructive text-destructive" : ""
                        }`}
                      />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-xl h-8 w-8 xs:h-10 xs:w-10">
                      <Share2 className="h-4 w-4 xs:h-5 xs:w-5" />
                    </Button>
                  </div>
                </div>

                <div className="text-2xl xs:text-3xl md:text-4xl font-bold text-secondary">
                  {property.price}{" "}
                  <span className="text-base xs:text-xl font-normal text-muted-foreground">
                    FCFA
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="glass-effect rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 md:gap-6">
                  <div className="text-center p-3 xs:p-4 rounded-xl bg-secondary/5 hover-lift">
                    <Bed className="h-6 w-6 xs:h-8 xs:w-8 text-secondary mx-auto mb-2" />
                    <div className="text-xl xs:text-2xl font-bold text-foreground">
                      {property.bedrooms}
                    </div>
                    <div className="text-xs xs:text-sm text-muted-foreground">Chambres</div>
                  </div>
                  <div className="text-center p-3 xs:p-4 rounded-xl bg-secondary/5 hover-lift">
                    <Bath className="h-6 w-6 xs:h-8 xs:w-8 text-secondary mx-auto mb-2" />
                    <div className="text-xl xs:text-2xl font-bold text-foreground">
                      {property.bathrooms}
                    </div>
                    <div className="text-xs xs:text-sm text-muted-foreground">
                      Salles de bain
                    </div>
                  </div>
                  <div className="text-center p-3 xs:p-4 rounded-xl bg-secondary/5 hover-lift">
                    <Square className="h-6 w-6 xs:h-8 xs:w-8 text-secondary mx-auto mb-2" />
                    <div className="text-xl xs:text-2xl font-bold text-foreground">
                      {property.surface}
                    </div>
                    <div className="text-xs xs:text-sm text-muted-foreground">m²</div>
                  </div>
                  <div className="text-center p-3 xs:p-4 rounded-xl bg-secondary/5 hover-lift">
                    <MapPin className="h-6 w-6 xs:h-8 xs:w-8 text-secondary mx-auto mb-2" />
                    <div className="text-xl xs:text-2xl font-bold text-foreground">🏙️</div>
                    <div className="text-xs xs:text-sm text-muted-foreground">Centre-ville</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-effect rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-card">
                <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-foreground mb-3 xs:mb-4">
                  Description
                </h2>
                <p className="text-sm xs:text-base text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Characteristics */}
              <div className="glass-effect rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-card">
                <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-foreground mb-3 xs:mb-4">
                  Caractéristiques
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 xs:gap-3">
                  {property.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 xs:p-3 rounded-xl bg-secondary/5 hover-lift"
                    >
                      <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-secondary flex-shrink-0"></div>
                      <span className="text-xs xs:text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Contact */}
            <div className="lg:col-span-1">
              <div className="glass-effect rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-card lg:sticky lg:top-24 animate-scale-in">
                <h3 className="text-lg xs:text-xl font-bold text-foreground mb-4 xs:mb-6">
                  Contacter le vendeur
                </h3>
                
                <div className="space-y-3 xs:space-y-4 mb-4 xs:mb-6">
                  <div className="p-3 xs:p-4 rounded-xl bg-secondary/5">
                    <div className="font-semibold text-sm xs:text-base text-foreground mb-1">
                      {property.seller.name}
                    </div>
                    <div className="text-xs xs:text-sm text-muted-foreground">
                      Agence immobilière vérifiée
                    </div>
                  </div>

                  <Button className="w-full bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold h-10 xs:h-12 text-sm xs:text-base">
                    <Phone className="mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                    Appeler maintenant
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-smooth rounded-xl font-semibold h-10 xs:h-12 text-sm xs:text-base"
                  >
                    <Mail className="mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                    Envoyer un message
                  </Button>
                </div>

                <div className="pt-4 xs:pt-6 border-t border-border space-y-2 xs:space-y-3">
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 xs:h-4 xs:w-4 text-secondary flex-shrink-0" />
                    <span>{property.seller.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 xs:h-4 xs:w-4 text-secondary flex-shrink-0" />
                    <span className="break-all">{property.seller.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
