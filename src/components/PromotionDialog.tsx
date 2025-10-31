import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Sparkles, Loader2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
}

const PromotionDialog = ({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
}: PromotionDialogProps) => {
  const [isInitiating, setIsInitiating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const { toast } = useToast();

  const handlePayment = async (plan: 'monthly' | 'yearly') => {
    setIsInitiating(true);
    setSelectedPlan(plan);
    try {
      console.log('🚀 Initiating PayTech payment with plan:', plan);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }

      const response = await supabase.functions.invoke('initiate-paytech-payment', {
        body: { propertyId, plan },
      });

      console.log('📥 Response received:', response);

      if (response.error) {
        console.error('❌ Payment initiation failed:', response.error);
        throw new Error(response.error.message || "Erreur lors de l'initiation du paiement");
      }

      if (!response.data?.success || !response.data?.paymentUrl) {
        throw new Error("URL de paiement introuvable");
      }

      console.log('✅ Redirecting to PayTech...');
      // Redirect to PayTech payment page
      window.location.href = response.data.paymentUrl;

    } catch (error: any) {
      console.error("💥 Payment initiation error:", error);
      
      let errorMessage = "Impossible d'initier le paiement";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsInitiating(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary" />
            Promouvoir votre annonce
          </DialogTitle>
          <DialogDescription>
            Mettez en avant votre annonce "{propertyTitle}" et augmentez sa visibilité
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Plan Mensuel */}
          <Card className="border-secondary/20 shadow-glow-secondary relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-secondary" />
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Mensuel
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-1">
                  6 500 FCFA
                </h3>
                <p className="text-sm text-muted-foreground">
                  Promotion valide pendant 30 jours
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Badge Premium pendant 1 mois
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Démarquez-vous des autres annonces
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Affichage en vedette
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Votre annonce en première page
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Facture automatique
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF téléchargeable instantanément
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handlePayment('monthly')}
                disabled={isInitiating}
                className="w-full bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold text-base py-6"
              >
                {isInitiating && selectedPlan === 'monthly' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Choisir Mensuel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Plan Annuel */}
          <Card className="border-accent/30 shadow-glow-accent relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-xs font-bold uppercase rounded-bl-lg flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Meilleur choix
            </div>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <Crown className="h-8 w-8 text-accent" />
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-accent uppercase tracking-wide">
                    Annuel
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-1">
                  78 000 FCFA
                </h3>
                <p className="text-sm text-muted-foreground">
                  Promotion valide pendant 12 mois
                </p>
                <p className="text-xs text-accent font-semibold mt-1">
                  Économisez 10%
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Badge Premium pendant 1 an
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Visibilité maximale toute l'année
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Affichage prioritaire permanent
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Toujours en tête des résultats
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Facture annuelle + Renouvellement automatique
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sans interruption de service
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Support prioritaire
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assistance dédiée 7j/7
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handlePayment('yearly')}
                disabled={isInitiating}
                className="w-full bg-accent hover:bg-accent/90 text-white shadow-glow-accent transition-smooth rounded-xl font-semibold text-base py-6"
              >
                {isInitiating && selectedPlan === 'yearly' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Choisir Annuel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Paiement 100% sécurisé via PayTech • Facture PDF générée automatiquement
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionDialog;