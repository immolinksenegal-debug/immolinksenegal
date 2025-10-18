import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, CheckCircle2, Clock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FreeEstimation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    propertyType: "",
    location: "",
    city: "",
    surface: "",
    bedrooms: "",
    bathrooms: "",
    condition: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const propertyTypes = ["Appartement", "Villa", "Maison", "Terrain", "Bureau", "Commerce"];
  const cities = ["Dakar", "Thiès", "Mbour", "Saint-Louis", "Ziguinchor", "Kaolack", "Autre"];
  const conditions = ["Excellent", "Bon", "Moyen", "À rénover"];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propertyType || !formData.location || !formData.city || 
        !formData.contactName || !formData.contactEmail || !formData.contactPhone) {
      toast({
        title: "Champs requis manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase.from("estimation_requests").insert([
        {
          user_id: session?.user?.id || null,
          property_type: formData.propertyType,
          location: formData.location,
          city: formData.city,
          surface: formData.surface ? parseFloat(formData.surface) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          condition: formData.condition || null,
          description: formData.description || null,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
        },
      ]);

      if (error) throw error;

      toast({
        title: "✅ Demande envoyée !",
        description: "Nous vous contacterons dans les 24-48h avec une estimation détaillée.",
      });

      // Reset form
      setFormData({
        propertyType: "",
        location: "",
        city: "",
        surface: "",
        bedrooms: "",
        bathrooms: "",
        condition: "",
        description: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      console.error("Error submitting estimation request:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary-glow to-primary py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                <Calculator className="h-10 w-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Estimation Gratuite de Votre Bien
              </h1>
              <p className="text-xl text-white/90">
                Obtenez une évaluation précise et professionnelle de votre propriété en quelques clics
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center border-secondary/20">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">100% Gratuit</h3>
                  <p className="text-sm text-muted-foreground">
                    Aucun frais, aucun engagement
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-secondary/20">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                    <Clock className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Rapide</h3>
                  <p className="text-sm text-muted-foreground">
                    Réponse sous 24-48h
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-secondary/20">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                    <Shield className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Professionnel</h3>
                  <p className="text-sm text-muted-foreground">
                    Évaluation par des experts
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto shadow-glow-secondary">
              <CardHeader>
                <CardTitle className="text-2xl">Détails de votre propriété</CardTitle>
                <CardDescription>
                  Remplissez ce formulaire pour recevoir votre estimation gratuite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type de bien */}
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Type de bien *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => handleChange("propertyType", value)}
                    >
                      <SelectTrigger id="propertyType">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ville */}
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => handleChange("city", value)}
                    >
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Sélectionnez une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Localisation */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Quartier / Localisation précise *</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Almadies, Liberté 6, etc."
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </div>

                  {/* Surface, Chambres, Salles de bain */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="surface">Surface (m²)</Label>
                      <Input
                        id="surface"
                        type="number"
                        placeholder="150"
                        value={formData.surface}
                        onChange={(e) => handleChange("surface", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Chambres</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="3"
                        value={formData.bedrooms}
                        onChange={(e) => handleChange("bedrooms", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Salles de bain</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="2"
                        value={formData.bathrooms}
                        onChange={(e) => handleChange("bathrooms", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* État du bien */}
                  <div className="space-y-2">
                    <Label htmlFor="condition">État du bien</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => handleChange("condition", value)}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Sélectionnez l'état" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((cond) => (
                          <SelectItem key={cond} value={cond}>
                            {cond}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description additionnelle (optionnel)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Ajoutez des détails supplémentaires sur votre bien..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                    />
                  </div>

                  {/* Coordonnées */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Vos coordonnées</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Nom complet *</Label>
                        <Input
                          id="contactName"
                          placeholder="Votre nom"
                          value={formData.contactName}
                          onChange={(e) => handleChange("contactName", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="votre@email.com"
                          value={formData.contactEmail}
                          onChange={(e) => handleChange("contactEmail", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Téléphone *</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          placeholder="+221 77 123 45 67"
                          value={formData.contactPhone}
                          onChange={(e) => handleChange("contactPhone", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-secondary hover:bg-secondary-glow text-white py-6 text-lg font-semibold shadow-glow-secondary transition-smooth"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="h-5 w-5 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-5 w-5 mr-2" />
                          Demander mon estimation gratuite
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      * Champs obligatoires
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FreeEstimation;
