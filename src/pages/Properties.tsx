import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, MapPin, Home as HomeIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Properties = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  useEffect(() => {
    fetchProperties();
  }, [searchQuery, typeFilter, cityFilter, minPrice, maxPrice]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      if (typeFilter) {
        query = query.eq('type', typeFilter);
      }
      if (cityFilter) {
        query = query.ilike('city', `%${cityFilter}%`);
      }
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedProperties = data.map((prop: any) => ({
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
      }));

      setProperties(formattedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les biens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (typeFilter) params.type = typeFilter;
    if (cityFilter) params.city = cityFilter;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setCityFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 xs:pt-28 md:pt-32 lg:pt-36 pb-8 xs:pb-12 bg-gradient-subtle">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 xs:mb-10 md:mb-12 text-center animate-fade-in-up">
            <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4">
              Annonces Immobilières Sénégal
            </h1>
            <p className="text-base xs:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
              Terrain à vendre, villa, maison, appartement à Dakar, Saly, Mbour, Thiès
            </p>
            <p className="text-sm text-muted-foreground">
              {properties.length} {properties.length > 1 ? 'biens immobiliers disponibles' : 'bien immobilier disponible'}
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 xs:mb-8 shadow-card border-border/50 animate-scale-in">
            <CardContent className="p-4 xs:p-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un bien..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
                <Button
                  onClick={handleSearch}
                  className="w-full sm:w-auto bg-secondary hover:bg-secondary-glow text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border animate-fade-in">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type de bien</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value=" ">Tous</option>
                      <option value="Appartement">Appartement</option>
                      <option value="Villa">Villa</option>
                      <option value="Maison">Maison</option>
                      <option value="Terrain">Terrain</option>
                      <option value="Bureau">Bureau</option>
                      <option value="Commerce">Commerce</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Ville</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        placeholder="Ex: Dakar"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Prix min (FCFA)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Prix max (FCFA)</label>
                    <Input
                      type="number"
                      placeholder="100000000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1"
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-secondary border-r-transparent mb-4"></div>
              <p className="text-muted-foreground">Chargement des biens...</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 animate-fade-in">
              {properties.map((property, index) => (
                <div
                  key={property.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <PropertyCard {...property} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="shadow-card border-border/50">
              <CardContent className="text-center py-12">
                <HomeIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Aucun bien trouvé
                </h3>
                <p className="text-muted-foreground mb-6">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Properties;
