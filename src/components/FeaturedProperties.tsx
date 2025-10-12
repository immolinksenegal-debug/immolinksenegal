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
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Biens immobiliers{" "}
            <span className="text-secondary">populaires</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez notre sélection de biens d'exception au Sénégal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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

        <div className="text-center">
          <Link to="/">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-smooth rounded-xl font-semibold shadow-soft"
            >
              Voir tous les biens
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
