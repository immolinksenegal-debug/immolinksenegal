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
        title="Immobilier Dakar Saly Mbour - Terrain Villa Maison à Vendre"
        description="Plateforme immobilière intelligente au Sénégal. Terrain à vendre Dakar, villa Saly, maison Mbour, appartement Thiès. Estimation IA gratuite, investissement immobilier haut standing."
        keywords="immobilier sénégal, terrain à vendre dakar, villa saly, maison mbour, appartement thiès, investissement immobilier, estimation gratuite"
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
