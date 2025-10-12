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
  BarChart3,
  Eye,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import appartementImage from "@/assets/appartement-moderne.jpg";

const Dashboard = () => {
  // Mock user properties
  const userProperties = [
    {
      id: "1",
      title: "Mon Appartement au Plateau",
      location: "Plateau, Dakar",
      price: "45.000.000",
      bedrooms: 3,
      bathrooms: 2,
      surface: 120,
      image: appartementImage,
      type: "Appartement",
    },
  ];

  const stats = [
    { label: "Annonces actives", value: "1", icon: Home },
    { label: "Vues totales", value: "234", icon: Eye },
    { label: "Messages", value: "12", icon: MessageSquare },
    { label: "Favoris", value: "8", icon: Heart },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground">
              Gérez vos annonces et suivez vos statistiques
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="hover-lift shadow-card border-border/50 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <Icon className="h-7 w-7 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="properties" className="animate-fade-in">
            <TabsList className="mb-6 bg-card shadow-soft">
              <TabsTrigger
                value="properties"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth"
              >
                <Home className="h-4 w-4 mr-2" />
                Mes annonces
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth"
              >
                <Heart className="h-4 w-4 mr-2" />
                Favoris
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth"
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Mes annonces</CardTitle>
                    <Button className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nouvelle annonce
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {userProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userProperties.map((property) => (
                        <PropertyCard key={property.id} {...property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Home className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Aucune annonce
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Commencez par publier votre première annonce
                      </p>
                      <Button className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl">
                        <PlusCircle className="h-4 w-4 mr-2" />
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
