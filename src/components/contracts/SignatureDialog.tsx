import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  signerType: 'owner' | 'tenant' | 'agency';
  signerName: string;
  signerEmail: string;
  onSignatureComplete: () => void;
}

export const SignatureDialog = ({
  open,
  onOpenChange,
  contractId,
  signerType,
  signerName: defaultSignerName,
  signerEmail: defaultSignerEmail,
  onSignatureComplete
}: SignatureDialogProps) => {
  const { toast } = useToast();
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [signing, setSigning] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [signerEmail, setSignerEmail] = useState(defaultSignerEmail);

  useEffect(() => {
    setSignerName(defaultSignerName);
    setSignerEmail(defaultSignerEmail);
  }, [defaultSignerName, defaultSignerEmail]);

  const clearSignature = () => {
    sigPadRef.current?.clear();
  };

  const handleSign = async () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      toast({
        title: "Erreur",
        description: "Veuillez signer avant de continuer",
        variant: "destructive",
      });
      return;
    }

    if (!signerName || !signerEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setSigning(true);

    try {
      // Get signature data as base64
      const signatureData = sigPadRef.current.toDataURL();

      // Save signature to database
      const { error } = await supabase
        .from('contract_signatures')
        .insert({
          contract_id: contractId,
          signer_type: signerType,
          signer_name: signerName,
          signer_email: signerEmail,
          signature_data: signatureData,
        });

      if (error) throw error;

      // Check if contract is fully signed
      const { data: signatures, error: sigError } = await supabase
        .from('contract_signatures')
        .select('signer_type')
        .eq('contract_id', contractId);

      if (sigError) throw sigError;

      // Get contract type
      const { data: contract } = await supabase
        .from('property_contracts')
        .select('contract_type')
        .eq('id', contractId)
        .single();

      const isMandat = contract?.contract_type === 'mandat_gestion';
      const signerTypes = signatures?.map(s => s.signer_type) || [];
      
      let signatureStatus = 'pending';
      if (isMandat) {
        // Mandat needs owner and agency
        if (signerTypes.includes('owner') && signerTypes.includes('agency')) {
          signatureStatus = 'fully_signed';
        } else if (signerTypes.length > 0) {
          signatureStatus = 'partially_signed';
        }
      } else {
        // Contrat de location needs owner, tenant, and agency
        if (signerTypes.includes('owner') && signerTypes.includes('tenant') && signerTypes.includes('agency')) {
          signatureStatus = 'fully_signed';
        } else if (signerTypes.length > 0) {
          signatureStatus = 'partially_signed';
        }
      }

      // Update contract signature status
      await supabase
        .from('property_contracts')
        .update({ signature_status: signatureStatus })
        .eq('id', contractId);

      toast({
        title: "Succès",
        description: "Signature enregistrée avec succès",
      });

      onSignatureComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving signature:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la signature",
        variant: "destructive",
      });
    } finally {
      setSigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Signature Électronique - {
              signerType === 'owner' ? 'Propriétaire' :
              signerType === 'tenant' ? 'Locataire' :
              'Agence'
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signerName">Nom Complet *</Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Votre nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signerEmail">Email *</Label>
              <Input
                id="signerEmail"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="votre.email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Signature *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={sigPadRef}
                canvasProps={{
                  className: 'w-full h-64 cursor-crosshair',
                }}
                backgroundColor="white"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Signez dans le cadre ci-dessus avec votre souris ou votre doigt
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clearSignature}
            disabled={signing}
          >
            Effacer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={signing}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSign}
            disabled={signing}
          >
            {signing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Signer le Contrat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
