import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPremiumProperties();
  }, []);

  const fetchPremiumProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const formattedProperties = data?.map((prop: any) => ({
        id: prop.id,
        title: prop.title,
        location: `${prop.location}, ${prop.city}`,
        price: prop.price.toLocaleString('fr-FR'),
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        surface: prop.surface,
        image: prop.images && prop.images.length > 0 ? prop.images[0] : '',
        type: prop.type,
        description: prop.description,
        status: prop.status,
        views: prop.views,
        createdAt: prop.created_at,
        isPremium: prop.is_premium,
      })) || [];

      setProperties(formattedProperties);
    } catch (error) {
      console.error("Error fetching premium properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-12 xs:py-16 md:py-20 bg-gradient-subtle">
        <div className="container mx-auto px-2 xs:px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Chargement des annonces premium...</p>
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-12 xs:py-16 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-2 xs:px-4">
        <div className="text-center mb-8 xs:mb-12 animate-fade-in-up flex flex-col items-center">
          <h2 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 xs:mb-4 px-2">
            Nos meilleures{" "}
            <span className="text-secondary">offres immobilières</span>
          </h2>
          <p className="text-sm xs:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Découvrez notre sélection de biens immobiliers récents et en vedette
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
