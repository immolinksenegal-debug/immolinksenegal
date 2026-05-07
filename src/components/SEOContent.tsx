import { Building2, MapPin, TrendingUp, Shield, Sparkles, Home } from "lucide-react";

const SEOContent = () => {
  const locations = [
    {
      icon: MapPin,
      title: "Immobilier à Dakar",
      description: "Terrain à vendre Dakar, villa à vendre Dakar, appartement à vendre Dakar. Découvrez nos biens dans la capitale.",
      color: "primary" as const,
    },
    {
      icon: Building2,
      title: "Immobilier Petite Côte",
      description: "Villa à louer Saly, terrain à vendre Mbour, maison à vendre Somone. Investissement bord de mer.",
      color: "secondary" as const,
    },
    {
      icon: Home,
      title: "Immobilier à Thiès",
      description: "Maison à vendre Thiès, terrain viabilisé, appartement à louer. Parcelles avec titre foncier sécurisé.",
      color: "accent" as const,
    },
  ];

  const services = [
    {
      icon: Sparkles,
      title: "Estimation Immobilière Gratuite avec IA",
      description: "Obtenez une estimation immobilière gratuite de votre terrain, villa ou maison grâce à notre technologie IA.",
    },
    {
      icon: TrendingUp,
      title: "Investissement Immobilier au Sénégal",
      description: "Investir dans l'immobilier : terrains viabilisés, villa de luxe, immobilier haut standing, résidences sécurisées.",
    },
    {
      icon: Shield,
      title: "Annonces Immobilières Vérifiées",
      description: "Site immobilier moderne avec annonces vérifiées. Promotion premium, publication rapide, visibilité maximale.",
    },
    {
      icon: Building2,
      title: "Tous Types de Biens Immobiliers",
      description: "Terrain à vendre, villa à vendre, maison à louer, appartement à louer, parcelle à vendre, terrains bord de mer.",
    },
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-card/30 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-foreground">
            Immobilier au{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sénégal</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            <strong className="text-foreground">Immo Link Sénégal</strong> est votre plateforme immobilière intelligente pour acheter, 
            vendre ou louer des biens immobiliers partout au Sénégal.
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {locations.map((loc, idx) => {
            const Icon = loc.icon;
            return (
              <div key={idx} className="group p-6 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                <div className={`w-12 h-12 rounded-2xl bg-${loc.color}/10 border border-${loc.color}/20 flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${loc.color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg">{loc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{loc.description}</p>
              </div>
            );
          })}
        </div>

        {/* Services */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Nos <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">services</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl hover:bg-card/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Why choose us */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-3xl p-8 md:p-10 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-5">
              Pourquoi choisir Immo Link Sénégal ?
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Immo Link Sénégal</strong> est la première plateforme immobilière intelligente au Sénégal, 
                combinant technologie moderne et expertise locale.
              </p>
              <p>
                Que vous cherchiez un terrain à vendre à Dakar, une villa à louer à Saly, 
                une maison à vendre à Mbour, ou un appartement à Thiès, 
                notre site immobilier moderne vous connecte aux meilleures opportunités.
              </p>
              <p>
                Nos services incluent : estimation immobilière gratuite avec IA, 
                promotion immobilière avec annonces premium, 
                investissement immobilier africain, terrains viabilisés avec titre foncier.
              </p>
            </div>
          </div>

          {/* Popular searches */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Recherches populaires</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                "terrain à vendre Dakar", "villa à vendre Saly", "maison à louer Mbour",
                "appartement Thiès", "terrain viabilisé Sénégal", "immobilier Petite Côte",
                "terrain bord de mer", "villa de luxe Dakar", "maison à vendre Somone",
                "terrain Ngaparou", "parcelle à vendre", "terrain loti Dakar",
                "résidence sécurisée Saly", "appartement à louer Dakar", "villa piscine Saly",
                "terrain titre foncier", "immobilier haut standing", "agence immobilière Dakar",
                "estimation immobilière", "investissement immobilier", "projet immobilier Sénégal",
                "annonces immobilières", "site immo Sénégal", "acheter terrain Sénégal",
                "vendre maison Dakar", "louer villa Saly", "terrain constructible",
                "maison moderne Sénégal", "appartement neuf Dakar", "villa bord de mer"
              ].map((keyword, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 bg-primary/5 text-primary/80 rounded-full border border-primary/10 hover:bg-primary/10 hover:text-primary transition-all duration-200 cursor-default"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SEOContent;
