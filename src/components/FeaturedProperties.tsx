import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame } from "lucide-react";
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
      const { data: premiumData, error: premiumError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .eq('is_premium', true)
        .order('premium_expires_at', { ascending: false })
        .limit(6);

      if (premiumError) throw premiumError;

      let allProperties = premiumData || [];

      if (allProperties.length < 6) {
        const { data: recentData, error: recentError } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .eq('is_premium', false)
          .order('created_at', { ascending: false })
          .limit(6 - allProperties.length);

        if (recentError) throw recentError;

        allProperties = [...allProperties, ...(recentData || [])];
      }

      const formattedProperties = allProperties.map((prop: any) => ({
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
        premiumExpiresAt: prop.premium_expires_at,
      }));

      setProperties(formattedProperties);
    } catch (error) {
      console.error("Error fetching premium properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
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
    <section className="py-20 md:py-28 relative overflow-hidden bg-mesh">
      {/* Brand background accents - logo palette */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Annonces en vedette</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Nos meilleures{" "}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              offres
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Découvrez notre sélection de biens immobiliers récents et en vedette
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-14">
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

        <div className="flex justify-center">
          <Link to="/properties">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-2xl font-semibold text-base px-8 py-6 shadow-lg hover:shadow-[0_0_30px_hsl(var(--secondary)/0.3)] transition-all duration-300 group"
            >
              Voir tous les biens
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
