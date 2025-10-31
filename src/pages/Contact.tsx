import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string()
    .trim()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z.string()
    .trim()
    .min(8, "Le numéro de téléphone est invalide")
    .max(20, "Le téléphone ne peut pas dépasser 20 caractères")
    .optional()
    .or(z.literal("")),
  subject: z.string()
    .trim()
    .min(3, "Le sujet doit contenir au moins 3 caractères")
    .max(200, "Le sujet ne peut pas dépasser 200 caractères"),
  message: z.string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase
        .from("contact_messages")
        .insert({
          user_id: session?.user?.id || null,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "✅ Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });

      reset();
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer votre message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Contactez-<span className="text-secondary">nous</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Une question ? Une suggestion ? Notre équipe est là pour vous aider
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="glass-effect rounded-xl p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Nos Coordonnées</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Téléphone</h3>
                      <p className="text-muted-foreground">+221 77 117 79 77</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Email</h3>
                      <p className="text-muted-foreground">immolinksenegal@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Adresse</h3>
                      <p className="text-muted-foreground">Dakar, Sénégal</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Heures d'ouverture</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p><span className="font-semibold text-primary">Lundi - Vendredi:</span> 8h00 - 18h00</p>
                  <p><span className="font-semibold text-primary">Samedi:</span> 9h00 - 14h00</p>
                  <p><span className="font-semibold text-primary">Dimanche:</span> Fermé</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-effect rounded-xl p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Nom complet *</label>
                  <Input 
                    placeholder="Votre nom" 
                    {...register("full_name")}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Email *</label>
                  <Input 
                    type="email" 
                    placeholder="votre@email.com" 
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Téléphone</label>
                  <Input 
                    type="tel" 
                    placeholder="+221 XX XXX XX XX" 
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Sujet *</label>
                  <Input 
                    placeholder="Objet de votre message" 
                    {...register("subject")}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Message *</label>
                  <Textarea 
                    placeholder="Décrivez votre demande..." 
                    rows={5}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary-glow text-white"
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
