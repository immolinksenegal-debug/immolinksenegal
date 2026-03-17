import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Users, Target, Award, Globe, Shield, Zap, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 xs:pt-28 md:pt-32 lg:pt-36 pb-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(25_85%_55%/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,hsl(145_55%_38%/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,hsl(42_90%_52%/0.06),transparent_40%)]" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">Qui sommes-nous ?</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">À propos de </span>
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Immo Link Sénégal
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              La plateforme immobilière moderne qui révolutionne le marché de l'immobilier au Sénégal
            </p>
          </div>

          {/* Mission */}
          <div className="mb-20 animate-fade-in">
            <div className="relative glass-effect rounded-3xl p-8 md:p-12 border border-primary/15 overflow-hidden group hover:border-primary/30 transition-all duration-500">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/15 transition-all duration-700" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/15 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-primary/50" />
                  <Globe className="h-8 w-8 text-primary drop-shadow-[0_0_10px_hsl(25_85%_55%/0.5)]" />
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">Notre Mission</h2>
                  <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-primary/50" />
                </div>
                <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
                  Faciliter l'accès à l'immobilier au Sénégal en offrant une plateforme moderne, 
                  transparente et accessible à tous. Nous connectons acheteurs, vendeurs et locataires 
                  pour des transactions immobilières simplifiées et sécurisées.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Nos <span className="text-secondary">Valeurs</span>
              </h2>
              <div className="h-1 w-20 mx-auto bg-gradient-to-r from-primary via-accent to-secondary rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Building2,
                  title: "Qualité",
                  description: "Des annonces vérifiées et de qualité pour une expérience optimale",
                  color: "primary",
                  glowColor: "25 85% 55%",
                },
                {
                  icon: Users,
                  title: "Proximité",
                  description: "Une équipe locale qui comprend les besoins du marché sénégalais",
                  color: "secondary",
                  glowColor: "145 55% 38%",
                },
                {
                  icon: Target,
                  title: "Innovation",
                  description: "Des outils modernes pour faciliter vos recherches immobilières",
                  color: "accent",
                  glowColor: "42 90% 52%",
                },
                {
                  icon: Shield,
                  title: "Confiance",
                  description: "Transparence et sécurité dans toutes nos transactions",
                  color: "primary",
                  glowColor: "25 85% 55%",
                }
              ].map((value, index) => (
                <div 
                  key={index} 
                  className="group relative glass-effect rounded-2xl p-6 hover-lift text-center border border-border/30 hover:border-primary/30 transition-all duration-500 overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card glow on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                    style={{ background: `radial-gradient(circle at 50% 0%, hsl(${value.glowColor} / 0.1), transparent 70%)` }}
                  />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${value.color}/10 mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className={`h-8 w-8 text-${value.color} drop-shadow-[0_0_8px_hsl(${value.glowColor}/0.4)]`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-20">
            <div className="glass-effect rounded-3xl p-8 md:p-12 border border-secondary/15 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
                Pourquoi <span className="text-accent">nous choisir</span> ?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Zap,
                    title: "Rapidité",
                    description: "Publiez et trouvez des biens en quelques clics grâce à notre interface intuitive et performante."
                  },
                  {
                    icon: Heart,
                    title: "Accompagnement",
                    description: "Notre équipe vous accompagne à chaque étape, de la recherche à la signature du contrat."
                  },
                  {
                    icon: Award,
                    title: "Excellence",
                    description: "Un service premium avec des outils avancés : estimation gratuite, contrats numériques et plus."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center group">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="relative glass-effect rounded-3xl p-8 md:p-12 border border-accent/15 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-accent" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
                Nos <span className="text-primary">Chiffres</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Biens disponibles", value: "500+", color: "primary" },
                  { label: "Villes couvertes", value: "15+", color: "secondary" },
                  { label: "Clients satisfaits", value: "1000+", color: "accent" },
                  { label: "Agences partenaires", value: "50+", color: "primary" }
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className={`text-4xl md:text-5xl font-bold text-${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
