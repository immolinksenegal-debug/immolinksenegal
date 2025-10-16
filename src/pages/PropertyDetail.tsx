import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Eye,
  Home as HomeIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
      incrementViews();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError(true);
        return;
      }

      setProperty(data);
    } catch (error) {
      console.error("Error fetching property:", error);
      setError(true);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'annonce",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const { data: currentProperty } = await supabase
        .from('properties')
        .select('views')
        .eq('id', id)
        .single();

      if (currentProperty) {
        await supabase
          .from('properties')
          .update({ views: (currentProperty.views || 0) + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 xs:pt-20 pb-8 xs:pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-secondary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 xs:pt-20 pb-8 xs:pb-12 bg-gradient-subtle">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
            <Card className="shadow-card border-border/50 max-w-2xl mx-auto">
              <CardContent className="text-center py-12">
                <HomeIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Annonce introuvable
                </h3>
                <p className="text-muted-foreground mb-6">
                  L'annonce que vous recherchez n'existe pas ou a été supprimée.
                </p>
                <Button
                  onClick={() => navigate('/properties')}
                  className="bg-secondary hover:bg-secondary-glow text-white"
                >
                  Voir toutes les annonces
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : [];
  const publishedDate = new Date(property.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 xs:pt-20 pb-8 xs:pb-12">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          {/* Gallery */}
          {images.length > 0 && (
            <div className="mb-4 xs:mb-6 md:mb-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 xs:gap-4 rounded-xl xs:rounded-2xl overflow-hidden shadow-elegant">
                <div className="md:col-span-2 aspect-video md:aspect-[21/9] overflow-hidden group cursor-pointer">
                  <img
                    src={images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                    loading="eager"
                  />
                </div>
                {images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-video overflow-hidden group cursor-pointer">
                    <img
                      src={image}
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              {images.length > 5 && (
                <div className="text-center mt-4">
                  <Badge variant="secondary" className="text-xs xs:text-sm px-3 xs:px-4 py-2">
                    <Eye className="h-3 w-3 xs:h-4 xs:w-4 mr-1" />
                    +{images.length - 5} photos supplémentaires
                  </Badge>
                </div>
              )}
            </div>
          )}

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
                        {publishedDate}
                      </span>
                      {property.views > 0 && (
                        <span className="text-xs xs:text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3 xs:h-4 xs:w-4" />
                          {property.views} vues
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-sm xs:text-base text-muted-foreground">
                      <MapPin className="h-4 w-4 xs:h-5 xs:w-5 mr-1 text-secondary" />
                      <span>{property.location}, {property.city}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 xs:gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-xl h-8 w-8 xs:h-10 xs:w-10 hover-scale"
                      onClick={() => {
                        setIsFavorite(!isFavorite);
                        toast({
                          title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
                          description: isFavorite 
                            ? "Ce bien a été retiré de vos favoris" 
                            : "Ce bien a été ajouté à vos favoris",
                        });
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 xs:h-5 xs:w-5 transition-all ${
                          isFavorite ? "fill-destructive text-destructive scale-110" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-xl h-8 w-8 xs:h-10 xs:w-10 hover-scale"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: property.title,
                            text: `Découvrez ce bien: ${property.title}`,
                            url: window.location.href,
                          }).catch(() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast({
                              title: "Lien copié!",
                              description: "Le lien a été copié dans votre presse-papiers",
                            });
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Lien copié!",
                            description: "Le lien a été copié dans votre presse-papiers",
                          });
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 xs:h-5 xs:w-5" />
                    </Button>
                  </div>
                </div>

                <div className="text-2xl xs:text-3xl md:text-4xl font-bold text-secondary">
                  {property.price.toLocaleString('fr-FR')}{" "}
                  <span className="text-base xs:text-xl font-normal text-muted-foreground">
                    FCFA
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="glass-effect rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 md:gap-6">
                  {property.bedrooms && (
                    <div className="text-center p-3 xs:p-4 rounded-xl bg-secondary/5 hover-lift">
                      <Bed className="h-6 w-6 xs:h-8 xs:w-8 text-secondary mx-auto mb-2" />
                      <div className="text-xl xs:text-2xl font-bold text-foreground">
                        {property.bedrooms}
                      </div>
                      <div className="text-xs xs:text-sm text-muted-foreground">Chambres</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-3 xs:p-4 rounded-xl bg-secondary/5 hover-lift">
                      <Bath className="h-6 w-6 xs:h-8 xs:w-8 text-secondary mx-auto mb-2" />
                      <div className="text-xl xs:text-2xl font-bold text-foreground">
                        {property.bathrooms}
                      </div>
                      <div className="text-xs xs:text-sm text-muted-foreground">
                        Salles de bain
                      </div>
                    </div>
                  )}
                  {property.surface && (
                    <div className="text-center p-3 xs:p-4 rounded-xl bg-secondary/5 hover-lift">
                      <Square className="h-6 w-6 xs:h-8 xs:w-8 text-secondary mx-auto mb-2" />
                      <div className="text-xl xs:text-2xl font-bold text-foreground">
                        {property.surface}
                      </div>
                      <div className="text-xs xs:text-sm text-muted-foreground">m²</div>
                    </div>
                  )}
                  <div className="text-center p-3 xs:p-4 rounded-xl bg-secondary/5 hover-lift">
                    <MapPin className="h-6 w-6 xs:h-8 xs:w-8 text-secondary mx-auto mb-2" />
                    <div className="text-xl xs:text-2xl font-bold text-foreground">{property.city}</div>
                    <div className="text-xs xs:text-sm text-muted-foreground">Ville</div>
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

              {/* Additional Information */}
              <div className="glass-effect rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-card">
                <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-foreground mb-3 xs:mb-4">
                  Informations supplémentaires
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Type de bien</span>
                    <span className="text-sm font-semibold text-foreground">{property.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Ville</span>
                    <span className="text-sm font-semibold text-foreground">{property.city}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Adresse</span>
                    <span className="text-sm font-semibold text-foreground">{property.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Statut</span>
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                      {property.status === 'active' ? 'Disponible' : property.status === 'sold' ? 'Vendu' : 'En attente'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Publiée le</span>
                    <span className="text-sm font-semibold text-foreground">{publishedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Contact */}
            <div className="lg:col-span-1">
              <div className="glass-effect rounded-xl xs:rounded-2xl p-4 xs:p-6 shadow-card lg:sticky lg:top-24 animate-scale-in">
                <h3 className="text-lg xs:text-xl font-bold text-foreground mb-4 xs:mb-6">
                  Intéressé par ce bien ?
                </h3>
                
                <div className="space-y-3 xs:space-y-4 mb-4 xs:mb-6">
                  <div className="p-3 xs:p-4 rounded-xl bg-secondary/5">
                    <div className="font-semibold text-sm xs:text-base text-foreground mb-1">
                      Contactez le propriétaire
                    </div>
                    <div className="text-xs xs:text-sm text-muted-foreground">
                      Prenez contact pour organiser une visite
                    </div>
                  </div>

                  {property.contact_phone ? (
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold h-10 xs:h-12 text-sm xs:text-base"
                      asChild
                    >
                      <a href={`tel:${property.contact_phone}`}>
                        <Phone className="mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                        Appeler maintenant
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-secondary/50 text-white rounded-xl font-semibold h-10 xs:h-12 text-sm xs:text-base"
                      disabled
                    >
                      <Phone className="mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                      Numéro non disponible
                    </Button>
                  )}

                  {property.contact_whatsapp && (
                    <Button 
                      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white transition-smooth rounded-xl font-semibold h-10 xs:h-12 text-sm xs:text-base mb-3"
                      asChild
                    >
                      <a 
                        href={`https://wa.me/${property.contact_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé par votre bien: ${property.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Contacter sur WhatsApp
                      </a>
                    </Button>
                  )}

                  {property.contact_email ? (
                    <Button
                      variant="outline"
                      className="w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-smooth rounded-xl font-semibold h-10 xs:h-12 text-sm xs:text-base"
                      asChild
                    >
                      <a href={`mailto:${property.contact_email}?subject=Intéressé par: ${encodeURIComponent(property.title)}&body=Bonjour,%0D%0A%0D%0AJe suis intéressé par votre bien situé à ${encodeURIComponent(property.location)}.%0D%0A%0D%0AMerci de me contacter.`}>
                        <Mail className="mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                        Envoyer un message
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-2 border-border text-muted-foreground rounded-xl font-semibold h-10 xs:h-12 text-sm xs:text-base"
                      disabled
                    >
                      <Mail className="mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                      Email non disponible
                    </Button>
                  )}
                </div>

                <div className="pt-4 xs:pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    ID de l'annonce: {property.id.slice(0, 8)}...
                  </p>
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
