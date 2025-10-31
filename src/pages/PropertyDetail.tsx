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
  Calendar,
  Eye,
  Home as HomeIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContactRequestDialog } from "@/components/ContactRequestDialog";
import WhatsAppChat from "@/components/WhatsAppChat";
import ShareButtons from "@/components/ShareButtons";
import SEOHead from "@/components/SEOHead";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  
  const placeholderImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop";

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

      // Check if current user is the property owner
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data.user_id === user.id) {
        setIsOwner(true);
      }
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
    : [placeholderImage];
  const publishedDate = new Date(property.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };
  
  const getImageSrc = (index: number) => {
    return imageErrors[index] || !images[index] ? placeholderImage : images[index];
  };

  // Structured Data pour la propriété
  const propertyStructuredData = property ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": property.title,
    "description": property.description,
    "image": images[0],
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "XOF",
      "availability": "https://schema.org/InStock",
      "url": `https://immolinksenegal.com/property/${id}`
    },
    "category": property.type,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city,
      "addressRegion": property.location,
      "addressCountry": "SN"
    }
  } : null;

  return (
    <div className="min-h-screen flex flex-col">
      {property && (
        <SEOHead
          title={`${property.title} - ${property.city}`}
          description={`${property.type} à vendre à ${property.city}, ${property.location}. ${property.price.toLocaleString('fr-FR')} FCFA. ${property.bedrooms ? `${property.bedrooms} chambres, ` : ''}${property.surface ? `${property.surface}m²` : ''}. ${property.description?.substring(0, 100)}...`}
          keywords={`${property.type.toLowerCase()}, ${property.city.toLowerCase()}, immobilier ${property.city.toLowerCase()}, achat ${property.type.toLowerCase()}, ${property.location.toLowerCase()}`}
          image={images[0]}
          type="product"
          structuredData={propertyStructuredData}
        />
      )}
      <Navbar />
      
      <main className="flex-1 pt-16 xs:pt-20 pb-8 xs:pb-12">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          {/* Gallery */}
          {images.length > 0 && (
            <div className="mb-4 xs:mb-6 md:mb-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 xs:gap-4 rounded-xl xs:rounded-2xl overflow-hidden shadow-elegant">
                <div className="md:col-span-2 aspect-video md:aspect-[21/9] overflow-hidden group cursor-pointer bg-muted">
                  <img
                    src={getImageSrc(0)}
                    alt={property.title}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                    loading="eager"
                    onError={() => handleImageError(0)}
                  />
                </div>
                {images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-video overflow-hidden group cursor-pointer bg-muted">
                    <img
                      src={getImageSrc(index + 1)}
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                      loading="lazy"
                      onError={() => handleImageError(index + 1)}
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
                    <ShareButtons
                      title={property.title}
                      description={`Découvrez ce bien: ${property.title} - ${property.price.toLocaleString('fr-FR')} FCFA à ${property.city}`}
                      imageUrl={images[0]}
                    />
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

                  {isOwner ? (
                    // Show contact info to property owner
                    <>
                      {property.contact_phone && (
                        <div className="p-3 xs:p-4 rounded-xl bg-secondary/5 mb-3">
                          <div className="text-xs text-muted-foreground mb-1">Téléphone</div>
                          <div className="text-sm font-semibold text-foreground">{property.contact_phone}</div>
                        </div>
                      )}
                      {property.contact_whatsapp && (
                        <div className="p-3 xs:p-4 rounded-xl bg-secondary/5 mb-3">
                          <div className="text-xs text-muted-foreground mb-1">WhatsApp</div>
                          <div className="text-sm font-semibold text-foreground">{property.contact_whatsapp}</div>
                        </div>
                      )}
                      {property.contact_email && (
                        <div className="p-3 xs:p-4 rounded-xl bg-secondary/5 mb-3">
                          <div className="text-xs text-muted-foreground mb-1">Email</div>
                          <div className="text-sm font-semibold text-foreground">{property.contact_email}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Show contact request button to visitors
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold h-10 xs:h-12 text-sm xs:text-base"
                      onClick={() => setShowContactDialog(true)}
                    >
                      <Phone className="mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                      Demander les coordonnées
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
      
      <ContactRequestDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        propertyId={id || ""}
        propertyTitle={property?.title || ""}
      />

      {/* WhatsApp Chat intégré */}
      {property?.contact_whatsapp && !isOwner && (
        <WhatsAppChat
          phoneNumber={property.contact_whatsapp}
          propertyTitle={property.title}
          propertyId={property.id}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
