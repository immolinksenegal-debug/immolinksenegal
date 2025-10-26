import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Home,
  PlusCircle,
  MessageSquare,
  Heart,
  Settings,
  Eye,
  Sparkles,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyForm from "@/components/PropertyForm";
import PromotionDialog from "@/components/PromotionDialog";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { MessagesList } from "@/components/dashboard/MessagesList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<{ id: string; title: string } | null>(null);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Annonces actives", value: "0", icon: Home },
    { label: "Vues totales", value: "0", icon: Eye },
    { label: "Messages", value: "0", icon: MessageSquare },
    { label: "Favoris", value: "0", icon: Heart },
  ]);

  useEffect(() => {
    fetchUserProperties();
  }, []);

  const fetchUserProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
        isPremium: prop.is_premium,
        premiumExpiresAt: prop.premium_expires_at,
      }));

      setUserProperties(formattedProperties);

      // Fetch contact requests count
      const { count: messagesCount } = await supabase
        .from('contact_requests')
        .select('*', { count: 'exact', head: true })
        .in('property_id', data.map(p => p.id))
        .eq('status', 'pending');

      const totalViews = data.reduce((sum: number, prop: any) => sum + (prop.views || 0), 0);
      setStats([
        { label: "Annonces actives", value: data.length.toString(), icon: Home },
        { label: "Vues totales", value: totalViews.toString(), icon: Eye },
        { label: "Messages", value: (messagesCount || 0).toString(), icon: MessageSquare },
        { label: "Favoris", value: "0", icon: Heart },
      ]);
    } catch (error) {
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
    setShowPropertyForm(false);
    setEditingProperty(null);
    fetchUserProperties();
  };

  const handlePromoteProperty = (propertyId: string, propertyTitle: string) => {
    setSelectedProperty({ id: propertyId, title: propertyTitle });
    setShowPromotionDialog(true);
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Annonce supprimée avec succès",
      });

      fetchUserProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 xs:pt-28 md:pt-32 pb-8 xs:pb-12 bg-gradient-subtle">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="mb-8 xs:mb-10 md:mb-12 text-center animate-fade-in-up">
            <h1 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4">
              Tableau de bord
            </h1>
            <p className="text-base xs:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Gérez vos annonces et suivez vos statistiques
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 md:gap-6 mb-6 xs:mb-8">
            {stats.map((stat, index) => {
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
              <Card className="shadow-card border-border/50">
                <CardHeader className="px-3 xs:px-6 py-4 xs:py-6">
                  <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
                    <CardTitle className="text-lg xs:text-xl md:text-2xl">Mes annonces</CardTitle>
                    <Button 
                      onClick={() => setShowPropertyForm(true)}
                      className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl text-xs xs:text-sm px-3 xs:px-4 py-2 w-full xs:w-auto"
                    >
                      <PlusCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                      Nouvelle annonce
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-3 xs:px-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Chargement...</p>
                    </div>
                  ) : userProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6">
                      {userProperties.map((property) => (
                        <div key={property.id} className="relative">
                          <PropertyCard {...property} />
                          <div className="absolute top-2 right-2 z-10 flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditProperty(property)}
                              className="bg-primary hover:bg-primary-glow text-white transition-smooth rounded-lg text-xs px-2 py-1"
                            >
                              ✏️ Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProperty(property.id)}
                              className="transition-smooth rounded-lg text-xs px-2 py-1"
                            >
                              🗑️ Supprimer
                            </Button>
                            {!property.isPremium && (
                              <Button
                                size="sm"
                                onClick={() => handlePromoteProperty(property.id, property.title)}
                                className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-lg text-xs px-2 py-1"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Promouvoir
                              </Button>
                            )}
                          </div>
                          {property.isPremium && property.premiumExpiresAt && (
                            <div className="mt-2 text-xs text-center text-muted-foreground">
                              Premium jusqu'au {new Date(property.premiumExpiresAt).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
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
                        onClick={() => setShowPropertyForm(true)}
                        className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl text-xs xs:text-sm px-3 xs:px-4 py-2"
                      >
                        <PlusCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                        Créer une annonce
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
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
              <MessagesList />
            </TabsContent>

            <TabsContent value="settings">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <ProfileSettings />
                </div>
                <div className="space-y-6">
                  <NotificationSettings />
                  <SecuritySettings />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={showPropertyForm} onOpenChange={(open) => {
        setShowPropertyForm(open);
        if (!open) setEditingProperty(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <PropertyForm 
            onSuccess={handleFormSuccess} 
            initialData={editingProperty}
          />
        </DialogContent>
      </Dialog>

      {selectedProperty && (
        <PromotionDialog
          open={showPromotionDialog}
          onOpenChange={setShowPromotionDialog}
          propertyId={selectedProperty.id}
          propertyTitle={selectedProperty.title}
        />
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
