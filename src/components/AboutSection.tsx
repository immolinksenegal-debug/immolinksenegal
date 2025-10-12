import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Transactions sécurisées",
      description: "Vos données et transactions sont protégées avec les meilleurs standards de sécurité",
    },
    {
      icon: TrendingUp,
      title: "Croissance garantie",
      description: "Investissez dans l'immobilier sénégalais avec confiance et expertise",
    },
    {
      icon: Users,
      title: "Communauté active",
      description: "Rejoignez des milliers d'utilisateurs satisfaits à travers tout le Sénégal",
    },
    {
      icon: Sparkles,
      title: "Expérience moderne",
      description: "Interface intuitive et fonctionnalités innovantes pour une recherche simplifiée",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              À propos d'{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Immo Link Sénégal
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              La plateforme immobilière nouvelle génération qui révolutionne la façon dont 
              les Sénégalais trouvent, achètent et vendent leurs biens immobiliers. 
              Une fusion parfaite entre technologie moderne et connaissance locale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 rounded-2xl gradient-card shadow-card hover-lift border border-border/50 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-secondary rounded-xl blur-sm opacity-30 group-hover:opacity-60 transition-smooth"></div>
                      <div className="relative w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <Icon className="h-7 w-7 text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-secondary transition-base">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center glass-effect rounded-2xl p-8 md:p-12 shadow-elevated">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Prêt à publier votre bien ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Rejoignez des centaines de propriétaires qui ont déjà fait confiance à notre plateforme 
              pour vendre ou louer leurs biens rapidement et efficacement.
            </p>
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold text-lg px-8"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Publier une annonce maintenant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
