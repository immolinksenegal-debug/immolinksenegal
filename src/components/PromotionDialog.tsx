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
import { Check, Sparkles } from "lucide-react";

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
  const MONEYFUSION_PAYMENT_LINK = "https://www.pay.moneyfusion.net/Immo_Link_S_n_gal/885340d22564634f/pay/";

  const handlePayment = () => {
    // Redirect to MoneyFusion payment page
    window.open(MONEYFUSION_PAYMENT_LINK, '_blank');
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

              <Button
                onClick={handlePayment}
                className="w-full bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold text-base py-6"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Payer avec MoneyFusion
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Après le paiement, contactez-nous avec votre reçu pour activer votre promotion
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionDialog;
