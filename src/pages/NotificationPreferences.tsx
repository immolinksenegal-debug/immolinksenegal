import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const NotificationPreferences = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        navigate("/auth?redirect=/preferences-notifications", { replace: true });
        return;
      }
      setIsChecking(false);
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="Préférences de notifications" description="Gérez vos préférences de notifications par email." noindex />
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Préférences d'emails
            </h1>
            <p className="text-muted-foreground mt-2">
              Activez ou désactivez les emails automatiques d'Immo Link Sénégal selon vos besoins.
            </p>
          </header>

          {isChecking ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            </div>
          ) : (
            <NotificationSettings />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotificationPreferences;
