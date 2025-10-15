import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import appartementImage from "@/assets/appartement-moderne.jpg";
import maisonImage from "@/assets/maison-contemporaine.jpg";
import villaImage from "@/assets/villa-piscine.jpg";

const FeaturedProperties = () => {
  const properties = [
    {
      id: "1",
      title: "Appartement moderne au Plateau",
      location: "Plateau, Dakar",
      price: "45.000.000",
      bedrooms: 3,
      bathrooms: 2,
      surface: 120,
      image: appartementImage,
      type: "Appartement",
      featured: true,
    },
    {
      id: "2",
      title: "Villa contemporaine avec piscine",
      location: "Almadies, Dakar",
      price: "125.000.000",
      bedrooms: 5,
      bathrooms: 4,
      surface: 350,
      image: villaImage,
      type: "Villa",
      featured: true,
    },
    {
      id: "3",
      title: "Maison familiale spacieuse",
      location: "Mermoz, Dakar",
      price: "75.000.000",
      bedrooms: 4,
      bathrooms: 3,
      surface: 220,
      image: maisonImage,
      type: "Maison",
      featured: true,
    },
  ];

  return (
    <section className="py-12 xs:py-16 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-2 xs:px-4">
        <div className="text-center mb-8 xs:mb-12 animate-fade-in-up flex flex-col items-center">
          <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-foreground mb-3 xs:mb-4 px-2">
            Biens immobiliers{" "}
            <span className="text-secondary">populaires</span>
          </h2>
          <p className="text-sm xs:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Découvrez notre sélection de biens d'exception au Sénégal
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 md:gap-8 mb-8 xs:mb-12">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard {...property} />
            </div>
          ))}
        </div>

        <div className="flex justify-center px-4">
          <Link to="/properties" className="w-full xs:w-auto flex justify-center">
            <Button
              size="lg"
              variant="outline"
              className="w-full xs:w-auto border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-smooth rounded-xl font-semibold shadow-soft text-sm xs:text-base px-4 xs:px-6 py-3"
            >
              Voir tous les biens
              <ArrowRight className="ml-2 h-4 w-4 xs:h-5 xs:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
