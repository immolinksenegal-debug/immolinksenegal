import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, CreditCard, MessageSquare, Calculator, Loader2, CalendarClock } from "lucide-react";
import PackOrdersHistory from "@/components/PackOrdersHistory";
import { MessagesList } from "@/components/dashboard/MessagesList";
import EstimationsList from "@/components/premium/EstimationsList";
import { supabase } from "@/integrations/supabase/client";

type ActivePack = {
  pack_id: string;
  billing: string;
  expires_at: string | null;
};

const PACK_LABELS: Record<string, string> = {
  boost: "Boost",
  premium: "Premium",
  agence: "Agence",
};

const PremiumSpace = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activePack, setActivePack] = useState<ActivePack | null>(null);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        navigate("/auth?redirect=/premium", { replace: true });
        return;
      }

      const { data } = await supabase
        .from("pack_subscriptions")
        .select("pack_id, billing, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("expires_at", { ascending: false })
        .limit(1);

      if (!active) return;
      setActivePack((data?.[0] as ActivePack) ?? null);
      setLoading(false);
    };

    init();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Espace Premium | Immo Link Sénégal"
        description="Suivez vos packs, vos demandes de contact et vos estimations immobilières dans votre espace premium."
        noindex
      />
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Espace Premium</h1>
              {activePack && (
                <Badge className="bg-primary text-primary-foreground">
                  Pack {PACK_LABELS[activePack.pack_id] ?? activePack.pack_id} ·{" "}
                  {activePack.billing === "yearly" ? "Annuel" : "Mensuel"}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-2">
              Retrouvez vos packs, vos demandes de contact et vos estimations au même endroit.
            </p>
          </header>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            </div>
          ) : !activePack ? (
            <Card className="shadow-card border-border/50">
              <CardContent className="py-12 text-center space-y-4">
                <Crown className="h-14 w-14 text-primary/50 mx-auto" />
                <h2 className="text-xl font-semibold text-foreground">
                  Aucun pack actif pour le moment
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  L'espace premium est réservé aux abonnés. Activez un pack pour suivre vos demandes
                  et vos estimations en un seul endroit.
                </p>
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <Link to="/#packs">
                    <Button className="rounded-xl font-semibold">Découvrir les packs</Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" className="rounded-xl font-semibold">
                      Retour au tableau de bord
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {activePack.expires_at && (
                <Card className="shadow-card border-border/50 mb-6">
                  <CardContent className="py-4 flex items-center gap-3">
                    <CalendarClock className="h-5 w-5 text-secondary" />
                    <p className="text-sm text-muted-foreground">
                      Votre abonnement est valide jusqu'au{" "}
                      <span className="font-semibold text-foreground">
                        {new Date(activePack.expires_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="packs" className="w-full">
                <TabsList className="grid grid-cols-3 w-full max-w-xl mb-6">
                  <TabsTrigger value="packs" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden xs:inline">Packs</span>
                  </TabsTrigger>
                  <TabsTrigger value="demandes" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden xs:inline">Demandes</span>
                  </TabsTrigger>
                  <TabsTrigger value="estimations" className="gap-2">
                    <Calculator className="h-4 w-4" />
                    <span className="hidden xs:inline">Estimations</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="packs">
                  <PackOrdersHistory />
                </TabsContent>
                <TabsContent value="demandes">
                  <MessagesList />
                </TabsContent>
                <TabsContent value="estimations">
                  <EstimationsList />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PremiumSpace;
