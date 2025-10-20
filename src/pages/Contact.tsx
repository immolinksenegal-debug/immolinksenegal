import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
    }, 1000);
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
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Nom complet</label>
                  <Input placeholder="Votre nom" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Email</label>
                  <Input type="email" placeholder="votre@email.com" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Téléphone</label>
                  <Input type="tel" placeholder="+221 XX XXX XX XX" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Sujet</label>
                  <Input placeholder="Objet de votre message" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Message</label>
                  <Textarea 
                    placeholder="Décrivez votre demande..." 
                    rows={5}
                    required
                  />
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
