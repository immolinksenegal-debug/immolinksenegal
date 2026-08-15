import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import LocationsSection from "@/components/LocationsSection";
import OwnerSection from "@/components/OwnerSection";
import BuyerRenterSection from "@/components/BuyerRenterSection";
import AgenciesSection from "@/components/AgenciesSection";
import SEOContent from "@/components/SEOContent";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Immobilier Sénégal - Terrain, Villa, Maison à Vendre & Louer"
        description="Plateforme immobilière N°1 au Sénégal. Trouvez terrain à vendre Dakar, villa à vendre Saly, maison à louer Mbour. Estimation gratuite avec IA. Annonces vérifiées."
        type="website"
      />
      <Navbar />
      <main>
        <Hero />
        <CategoriesSection />
        <FeaturedProperties />
        <LocationsSection />
        <OwnerSection />
        <BuyerRenterSection />
        <AgenciesSection />
        <SEOContent />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
