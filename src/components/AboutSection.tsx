import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Users, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Transactions sécurisées",
      description: "Vos données et transactions sont protégées avec les meilleurs standards de sécurité",
      color: "primary" as const,
    },
    {
      icon: TrendingUp,
      title: "Croissance garantie",
      description: "Investissez dans l'immobilier sénégalais avec confiance et expertise",
      color: "secondary" as const,
    },
    {
      icon: Users,
      title: "Communauté active",
      description: "Rejoignez des milliers d'utilisateurs satisfaits à travers tout le Sénégal",
      color: "accent" as const,
    },
    {
      icon: Sparkles,
      title: "Expérience moderne",
      description: "Interface intuitive et fonctionnalités innovantes pour une recherche simplifiée",
      color: "primary" as const,
    },
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Pourquoi choisir{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Immo Link
              </span>
              {" "}?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              La plateforme immobilière nouvelle génération qui révolutionne la façon dont 
              les Sénégalais trouvent, achètent et vendent leurs biens immobiliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-14">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden p-6 md:p-8 rounded-3xl bg-card border border-border hover:border-transparent transition-all duration-500 hover:-translate-y-1 shadow-card hover:shadow-elevated"
                >
                  {/* Gradient halo */}
                  <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-${feature.color}/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  {/* Top gradient line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${feature.color} via-accent to-${feature.color} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500`} />

                  <div className="relative flex items-start gap-5">
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color} to-${feature.color}/70 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <Icon className={`h-8 w-8 text-${feature.color}-foreground`} />
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border border-border text-[11px] font-bold flex items-center justify-center text-foreground shadow-soft">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
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


          {/* CTA Card */}
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
            <div className="relative z-10 text-center p-10 md:p-16">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Prêt à publier votre bien ?
              </h3>
              <p className="text-white/80 mb-8 max-w-lg mx-auto text-lg">
                Rejoignez des centaines de propriétaires qui ont déjà fait confiance à notre plateforme.
              </p>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-2xl font-bold text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Publier une annonce
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
