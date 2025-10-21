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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, Loader2 } from "lucide-react";
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
  const MONEYFUSION_PAYMENT_LINK = "https://www.pay.moneyfusion.net/Immo_Link_S_n_gal/0f3a818c2b97afea/pay/";
  const [paymentToken, setPaymentToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const { toast } = useToast();

  const handlePayment = () => {
    // Show token input immediately - user will open payment in another tab
    setShowTokenInput(true);
  };

  const handleVerifyPayment = async () => {
    if (!paymentToken.trim()) {
      toast({
        title: "Token requis",
        description: "Veuillez entrer votre token de paiement",
        variant: "destructive",
      });
      return;
    }

    // Validation du format du token (au moins 8 caractères alphanumériques)
    const tokenPattern = /^[a-zA-Z0-9]{8,}$/;
    if (!tokenPattern.test(paymentToken.trim())) {
      toast({
        title: "Format de token invalide",
        description: "Le token doit contenir au moins 8 caractères alphanumériques",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      console.log('🔐 Getting user session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }

      console.log('📤 Sending payment verification request...');
      const response = await supabase.functions.invoke('verify-moneyfusion-payment', {
        body: { token: paymentToken.trim(), propertyId },
      });

      console.log('📥 Response received:', response);

      if (response.error) {
        console.error('❌ Verification failed:', response.error);
        throw new Error(response.error.message || "Erreur lors de la vérification du paiement");
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || "La vérification du paiement a échoué");
      }

      console.log('✅ Payment verified successfully');

      toast({
        title: "✅ Paiement confirmé !",
        description: response.data.message || "Votre annonce est maintenant premium",
        duration: 5000,
      });

      // Close dialog and reset
      setPaymentToken("");
      setShowTokenInput(false);
      onOpenChange(false);
      
      // Reload page to show updated premium status
      setTimeout(() => {
        console.log('🔄 Reloading page to show premium status...');
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error("💥 Verification error:", error);
      
      let errorMessage = "Impossible de vérifier le paiement";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur de vérification",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary" />
            Promouvoir votre annonce
          </DialogTitle>
          <DialogDescription>
            Mettez en avant votre annonce "{propertyTitle}" sur la page d'accueil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="border-secondary/20 shadow-glow-secondary">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  6 500 FCFA
                  <span className="text-lg font-normal text-muted-foreground"> / mois</span>
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
                      Affichage prioritaire sur la page d'accueil
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Votre annonce sera visible en premier
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Badge Premium distinctif
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Attirez l'attention avec un badge spécial
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Visibilité maximale pendant 30 jours
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Plus de vues, plus de chances de vendre
                    </p>
                  </div>
                </div>
              </div>

              {!showTokenInput ? (
                <>
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold text-base py-6"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Continuer vers le paiement
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Vous recevrez un token après le paiement
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Payment Link */}
                  <div className="p-4 bg-secondary/5 border-2 border-secondary/20 rounded-lg">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Étape 1 : Effectuer le paiement
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Cliquez sur le bouton ci-dessous pour accéder à la page de paiement MoneyFusion
                    </p>
                    <Button
                      asChild
                      className="w-full bg-secondary hover:bg-secondary-glow text-white"
                    >
                      <a 
                        href={MONEYFUSION_PAYMENT_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ouvrir MoneyFusion
                      </a>
                    </Button>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Étape 2 : Entrer votre token
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Après le paiement, vous recevrez un <span className="font-semibold">token de transaction</span>. 
                      Entrez-le ci-dessous pour activer votre promotion.
                    </p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-token">Token de paiement</Label>
                      <Input
                        id="payment-token"
                        placeholder="Ex: 0d1d8bc9b6d2819c"
                        value={paymentToken}
                        onChange={(e) => setPaymentToken(e.target.value)}
                        disabled={isVerifying}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowTokenInput(false);
                        setPaymentToken("");
                      }}
                      disabled={isVerifying}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      onClick={handleVerifyPayment}
                      disabled={isVerifying || !paymentToken.trim()}
                      className="flex-1 bg-secondary hover:bg-secondary-glow text-white"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Confirmer le paiement
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionDialog;
