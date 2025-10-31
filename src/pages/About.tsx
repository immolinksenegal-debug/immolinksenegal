import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Users, Target, Award } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="À Propos - Immo Link Sénégal | Plateforme Immobilière Moderne"
        description="Découvrez Immo Link Sénégal, la plateforme immobilière moderne qui révolutionne le marché de l'immobilier au Sénégal. Qualité, innovation et transparence."
        keywords="à propos immo link, agence immobilière moderne sénégal, plateforme immobilière dakar, mission immo link"
        type="website"
      />
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              À propos de <span className="text-secondary">Immo Link Sénégal</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              La plateforme immobilière moderne qui révolutionne le marché de l'immobilier au Sénégal
            </p>
          </div>

          {/* Mission */}
          <div className="mb-16">
            <div className="glass-effect rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">Notre Mission</h2>
              <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
                Faciliter l'accès à l'immobilier au Sénégal en offrant une plateforme moderne, 
                transparente et accessible à tous. Nous connectons acheteurs, vendeurs et locataires 
                pour des transactions immobilières simplifiées et sécurisées.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: Building2,
                title: "Qualité",
                description: "Des annonces vérifiées et de qualité pour une expérience optimale"
              },
              {
                icon: Users,
                title: "Proximité",
                description: "Une équipe locale qui comprend les besoins du marché sénégalais"
              },
              {
                icon: Target,
                title: "Innovation",
                description: "Des outils modernes pour faciliter vos recherches immobilières"
              },
              {
                icon: Award,
                title: "Confiance",
                description: "Transparence et sécurité dans toutes nos transactions"
              }
            ].map((value, index) => (
              <div key={index} className="glass-effect rounded-xl p-6 hover-lift text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                  <value.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="glass-effect rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">Nos Chiffres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Biens disponibles", value: "500+" },
                { label: "Villes couvertes", value: "15+" },
                { label: "Clients satisfaits", value: "1000+" },
                { label: "Agences partenaires", value: "50+" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
