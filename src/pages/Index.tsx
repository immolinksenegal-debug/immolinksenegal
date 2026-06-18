import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import AboutSection from "@/components/AboutSection";
import SEOContent from "@/components/SEOContent";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Immobilier Sénégal - Terrain, Villa, Maison à Vendre & Louer"
        description="Plateforme immobilière N°1 au Sénégal. Trouvez terrain à vendre Dakar, villa à vendre Saly, maison à louer Mbour. Estimation gratuite avec IA. Annonces vérifiées."
        type="website"
      />
      <Navbar />
      <main>
        <Hero />
        <FeaturedProperties />
        <SEOContent />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
