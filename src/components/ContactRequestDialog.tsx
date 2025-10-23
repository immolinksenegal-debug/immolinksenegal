import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, User, MessageSquare } from "lucide-react";

const contactRequestSchema = z.object({
  requesterName: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  requesterEmail: z.string()
    .trim()
    .email("Veuillez entrer une adresse email valide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  requesterPhone: z.string()
    .trim()
    .max(20, "Le téléphone ne peut pas dépasser 20 caractères")
    .optional()
    .or(z.literal("")),
  message: z.string()
    .trim()
    .max(1000, "Le message ne peut pas dépasser 1000 caractères")
    .optional()
    .or(z.literal("")),
});

type ContactRequestFormData = z.infer<typeof contactRequestSchema>;

interface ContactRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
}

export const ContactRequestDialog = ({ open, onOpenChange, propertyId, propertyTitle }: ContactRequestDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactRequestFormData>({
    resolver: zodResolver(contactRequestSchema),
  });

  const onSubmit = async (data: ContactRequestFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          property_id: propertyId,
          requester_name: data.requesterName,
          requester_email: data.requesterEmail,
          requester_phone: data.requesterPhone || null,
          message: data.message || null,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Votre demande de contact a été envoyée avec succès !");
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Error submitting contact request:', error);
      toast.error("Une erreur est survenue lors de l'envoi de votre demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Demander les coordonnées du propriétaire</DialogTitle>
          <DialogDescription>
            Pour {propertyTitle}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Votre nom *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Entrez votre nom"
                {...register("requesterName")}
                className="pl-10"
              />
            </div>
            {errors.requesterName && (
              <p className="text-sm text-destructive">{errors.requesterName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Votre email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                {...register("requesterEmail")}
                className="pl-10"
              />
            </div>
            {errors.requesterEmail && (
              <p className="text-sm text-destructive">{errors.requesterEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Votre téléphone (optionnel)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+221 XX XXX XX XX"
                {...register("requesterPhone")}
                className="pl-10"
              />
            </div>
            {errors.requesterPhone && (
              <p className="text-sm text-destructive">{errors.requesterPhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="message"
                placeholder="Dites-nous pourquoi vous êtes intéressé..."
                {...register("message")}
                className="pl-10 min-h-[100px]"
              />
            </div>
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
