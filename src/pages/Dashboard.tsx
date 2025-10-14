import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  PlusCircle,
  MessageSquare,
  Heart,
  Settings,
  Eye,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyForm from "@/components/PropertyForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeAds: 0,
    totalViews: 0,
    messages: 0,
    favorites: 0,
  });

  useEffect(() => {
    fetchUserProperties();
  }, []);

  const fetchUserProperties = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProperties(data || []);
      
      // Calculate stats
      const totalViews = data?.reduce((sum, prop) => sum + (prop.views || 0), 0) || 0;
      setStats({
        activeAds: data?.filter(p => p.status === "active").length || 0,
        totalViews,
        messages: 0, // TODO: implement when messaging is added
        favorites: 0, // TODO: implement when favorites is added
      });
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos annonces",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchUserProperties();
  };

  const statsDisplay = [
    { label: "Annonces actives", value: stats.activeAds.toString(), icon: Home },
    { label: "Vues totales", value: stats.totalViews.toString(), icon: Eye },
    { label: "Messages", value: stats.messages.toString(), icon: MessageSquare },
    { label: "Favoris", value: stats.favorites.toString(), icon: Heart },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 xs:pt-20 pb-8 xs:pb-12 bg-gradient-subtle">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="mb-6 xs:mb-8 animate-fade-in-up">
            <h1 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              Tableau de bord
            </h1>
            <p className="text-sm xs:text-base text-muted-foreground">
              Gérez vos annonces et suivez vos statistiques
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 md:gap-6 mb-6 xs:mb-8">
            {statsDisplay.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="hover-lift shadow-card border-border/50 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="pt-4 xs:pt-6 pb-4 xs:pb-6 px-3 xs:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs xs:text-sm text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <p className="text-xl xs:text-2xl md:text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className="w-10 h-10 xs:w-12 xs:h-12 md:w-14 md:h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <Icon className="h-5 w-5 xs:h-6 xs:w-6 md:h-7 md:w-7 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="properties" className="animate-fade-in">
            <TabsList className="mb-4 xs:mb-6 bg-card shadow-soft flex-wrap h-auto p-1 gap-1">
              <TabsTrigger
                value="properties"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <Home className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                <span className="hidden xs:inline">Mes annonces</span>
                <span className="xs:hidden">Annonces</span>
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <Heart className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Favoris
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <MessageSquare className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth text-xs xs:text-sm px-2 xs:px-3 py-2"
              >
                <Settings className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              {showForm ? (
                <PropertyForm 
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <Card className="shadow-card border-border/50">
                  <CardHeader className="px-3 xs:px-6 py-4 xs:py-6">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
                      <CardTitle className="text-lg xs:text-xl md:text-2xl">Mes annonces</CardTitle>
                      <Button 
                        onClick={() => setShowForm(true)}
                        className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl text-xs xs:text-sm px-3 xs:px-4 py-2 w-full xs:w-auto"
                      >
                        <PlusCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                        Nouvelle annonce
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 xs:px-6">
                    {isLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-3">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : properties.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6">
                        {properties.map((property) => (
                          <PropertyCard 
                            key={property.id} 
                            id={property.id}
                            title={property.title}
                            location={`${property.location}, ${property.city}`}
                            price={property.price.toLocaleString('fr-FR')}
                            bedrooms={property.bedrooms}
                            bathrooms={property.bathrooms}
                            surface={property.surface}
                            image={property.images?.[0] || ""}
                            type={property.type}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 xs:py-12">
                        <Home className="h-12 w-12 xs:h-16 xs:w-16 text-muted-foreground/50 mx-auto mb-3 xs:mb-4" />
                        <h3 className="text-lg xs:text-xl font-semibold text-foreground mb-2">
                          Aucune annonce
                        </h3>
                        <p className="text-sm xs:text-base text-muted-foreground mb-4 xs:mb-6 px-4">
                          Commencez par publier votre première annonce
                        </p>
                        <Button 
                          onClick={() => setShowForm(true)}
                          className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl text-xs xs:text-sm px-3 xs:px-4 py-2"
                        >
                          <PlusCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                          Créer une annonce
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Mes favoris</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Aucun favori
                    </h3>
                    <p className="text-muted-foreground">
                      Les biens que vous marquez comme favoris apparaîtront ici
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Aucun message
                    </h3>
                    <p className="text-muted-foreground">
                      Vos conversations avec les acheteurs apparaîtront ici
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Paramètres du compte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Informations personnelles
                      </h3>
                      <div className="glass-effect rounded-xl p-4">
                        <p className="text-muted-foreground">
                          Fonctionnalité en cours de développement
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Notifications
                      </h3>
                      <div className="glass-effect rounded-xl p-4">
                        <p className="text-muted-foreground">
                          Fonctionnalité en cours de développement
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
