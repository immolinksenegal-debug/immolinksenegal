import { Building2, MapPin, TrendingUp, Shield, Sparkles, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
const SEOContent = () => {
  return <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Main SEO Content */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-500">
            Immobilier au Sénégal : Trouvez Votre Bien Idéal
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            <strong>Immo Link Sénégal</strong> est votre plateforme immobilière intelligente pour acheter, 
            vendre ou louer des biens immobiliers au Sénégal. Découvrez nos annonces de <strong>terrain à vendre à Dakar</strong>, 
            <strong> villa à vendre à Saly</strong>, <strong>maison à louer à Mbour</strong>, et <strong>appartement à Thiès</strong>.
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-border/50 hover:shadow-elegant transition-smooth">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Immobilier à Dakar</h3>
                  <p className="text-sm text-muted-foreground">
                    Terrain à vendre Dakar, villa à vendre Dakar, appartement à vendre Dakar. 
                    Découvrez nos biens immobiliers dans la capitale sénégalaise.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-elegant transition-smooth">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Immobilier Petite Côte</h3>
                  <p className="text-sm text-muted-foreground">
                    Villa à louer Saly, terrain à vendre Mbour, maison à vendre Somone, 
                    terrain à vendre Ngaparou. Investissement immobilier bord de mer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-elegant transition-smooth">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Home className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Immobilier à Thiès</h3>
                  <p className="text-sm text-muted-foreground">
                    Maison à vendre Thiès, terrain viabilisé Thiès, appartement à louer. 
                    Parcelles et terrains avec titre foncier sécurisé.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">
            Nos Services Immobiliers au Sénégal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Estimation Immobilière Gratuite avec IA
                </h3>
                <p className="text-sm text-muted-foreground">
                  Obtenez une estimation immobilière gratuite de votre terrain, villa ou maison au Sénégal 
                  grâce à notre service d'<strong>estimation immobilière intelligente</strong>. 
                  Plateforme immobilière digitale avec technologie IA.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Investissement Immobilier au Sénégal
                </h3>
                <p className="text-sm text-muted-foreground">
                  Investir dans l'immobilier au Sénégal : <strong>terrains viabilisés</strong>, 
                  <strong> villa de luxe</strong>, <strong>immobilier haut standing</strong>, 
                  résidences sécurisées, projets immobiliers, terrain titre foncier.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Annonces Immobilières Vérifiées
                </h3>
                <p className="text-sm text-muted-foreground">
                  Site immobilier moderne avec <strong>annonces immobilières sénégal</strong> vérifiées. 
                  Promotion d'annonces premium, publication rapide, visibilité maximale.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Tous Types de Biens Immobiliers
                </h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Terrain à vendre</strong>, <strong>villa à vendre</strong>, 
                  <strong> maison à louer</strong>, <strong>appartement à louer</strong>, 
                  terrain loti, parcelle à vendre, terrains bord de mer Sénégal.
                </p>
              </div>
            </div>
          </div>

          {/* Keywords Rich Section */}
          <div className="bg-card border border-border/50 rounded-lg p-6 md:p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Pourquoi choisir Immo Link Sénégal ?
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Immo Link Sénégal</strong> est la première <strong>plateforme immobilière intelligente</strong> au Sénégal, 
                combinant technologie moderne et expertise locale. Notre <strong>agence immobilière digitale</strong> facilite 
                l'achat, la vente et la location de biens immobiliers partout au Sénégal.
              </p>
              <p>
                Que vous cherchiez un <strong>terrain à vendre à Dakar</strong>, une <strong>villa à louer à Saly</strong>, 
                une <strong>maison à vendre à Mbour</strong>, ou un <strong>appartement à Thiès</strong>, 
                notre <strong>site immobilier moderne</strong> vous connecte aux meilleures opportunités.
              </p>
              <p>
                Nos services incluent : <strong>estimation immobilière gratuite</strong> avec IA, 
                <strong> promotion immobilière</strong> avec annonces premium PayTech, 
                <strong> investissement immobilier africain</strong>, terrains viabilisés avec titre foncier, 
                et bien plus. Découvrez comment <strong>investir dans l'immobilier au Sénégal</strong> facilement.
              </p>
              <p>
                Zones couvertes : Dakar, Saly, Mbour, Thiès, Somone, Ngaparou et toute la Petite Côte. 
                Spécialités : <strong>immobilier de luxe Sénégal</strong>, terrains bord de mer, 
                villas haut standing, résidences sécurisées, projets immobiliers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default SEOContent;