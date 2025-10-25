import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import AIEstimationChat from "@/components/AIEstimationChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <FeaturedProperties />
        <AboutSection />
      </main>
      <Footer />
      <AIEstimationChat />
    </div>
  );
};

export default Index;
