import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, FileText, CheckCircle, Home } from "lucide-react";
const HowItWorks = () => {
  const steps = [{
    icon: Search,
    title: "Recherchez",
    description: "Utilisez nos filtres avancés pour trouver le bien immobilier qui correspond à vos critères : type, localisation, prix, surface..."
  }, {
    icon: FileText,
    title: "Consultez",
    description: "Parcourez les annonces détaillées avec photos, descriptions complètes et informations de contact des propriétaires"
  }, {
    icon: CheckCircle,
    title: "Contactez",
    description: "Entrez en contact direct avec les propriétaires via téléphone, email ou WhatsApp pour organiser une visite"
  }, {
    icon: Home,
    title: "Finalisez",
    description: "Une fois votre bien trouvé, finalisez la transaction en toute sécurité avec l'accompagnement de nos partenaires"
  }];
  const sellerSteps = [{
    number: "1",
    title: "Créez votre compte",
    description: "Inscrivez-vous gratuitement en quelques clics"
  }, {
    number: "2",
    title: "Publiez votre annonce",
    description: "Ajoutez photos, description et détails de votre bien"
  }, {
    number: "3",
    title: "Gérez vos demandes",
    description: "Recevez et gérez les contacts des acheteurs intéressés"
  }, {
    number: "4",
    title: "Boostez votre visibilité",
    description: "Optez pour une annonce premium pour plus de visibilité"
  }];
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 py-[30px]">
              Comment ça <span className="text-secondary">marche</span> ?
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment Immo Link Sénégal simplifie vos transactions immobilières
            </p>
          </div>

          {/* For Buyers */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">
              Pour les <span className="text-secondary">Acheteurs</span> et <span className="text-secondary">Locataires</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => <div key={index} className="glass-effect rounded-xl p-6 hover-lift text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
                    <step.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>)}
            </div>
          </section>

          {/* For Sellers */}
          <section>
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">
              Pour les <span className="text-secondary">Vendeurs</span> et <span className="text-secondary">Propriétaires</span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {sellerSteps.map((step, index) => <div key={index} className="glass-effect rounded-xl p-6 flex items-start gap-6 hover-lift">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center text-xl font-bold">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>)}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>;
};
export default HowItWorks;