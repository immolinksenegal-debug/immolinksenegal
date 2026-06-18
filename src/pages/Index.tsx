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
        title="Terrains, villas & maisons au Sénégal"
        description="Plateforme immobilière au Sénégal. Terrains, villas et maisons à vendre ou louer à Dakar, Saly, Mbour, Thiès. Estimation gratuite par IA."
        type="website"
        url="https://immolinksenegal.lovable.app/"
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
