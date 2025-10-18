import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, CheckCircle, Home, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const estimationSchema = z.object({
  property_type: z.string().min(1, "Le type de bien est requis"),
  location: z.string().min(3, "Le quartier doit contenir au moins 3 caractères"),
  city: z.string().min(2, "La ville est requise"),
  surface: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  condition: z.string().optional(),
  description: z.string().optional(),
  contact_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  contact_email: z.string().email("Email invalide"),
  contact_phone: z.string().min(8, "Le numéro de téléphone est invalide"),
});

type EstimationFormData = z.infer<typeof estimationSchema>;

const FreeEstimation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EstimationFormData>({
    resolver: zodResolver(estimationSchema),
  });

  const onSubmit = async (data: EstimationFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const insertData = {
        user_id: session?.user?.id || null,
        property_type: data.property_type,
        location: data.location,
        city: data.city,
        surface: data.surface ? parseFloat(data.surface) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        condition: data.condition || null,
        description: data.description || null,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        status: "pending",
      };

      const { error } = await supabase
        .from("estimation_requests")
        .insert(insertData);

      if (error) throw error;

      setIsSuccess(true);
      reset();
      toast({
        title: "✅ Demande envoyée !",
        description: "Nous vous contacterons sous 24-48h avec votre estimation.",
      });

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Estimation submission error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypes = [
    "Appartement",
    "Villa",
    "Maison",
    "Terrain",
    "Duplex",
    "Studio",
    "Bureau",
    "Commerce",
  ];

  const conditions = [
    "Neuf",
    "Excellent état",
    "Bon état",
    "À rénover",
    "En construction",
  ];

  const cities = [
    "DAKAR",
    "MBOUR",
    "THIES",
    "SAINT-LOUIS",
    "SALY",
    "SOMONE",
    "KAOLACK",
    "ZIGUINCHOR",
    "LOUGA",
    "TOUBA",
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="max-w-lg w-full text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Demande reçue !</CardTitle>
              <CardDescription className="text-base">
                Nous avons bien reçu votre demande d'estimation. Notre équipe d'experts vous contactera sous 24-48h avec une estimation détaillée de votre bien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
              <Calculator className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Estimation Gratuite</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Obtenez une estimation précise et gratuite de votre bien immobilier en moins de 24-48h
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full mb-3">
                  <Calculator className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">100% Gratuit</h3>
                <p className="text-sm text-muted-foreground">
                  Sans engagement et sans frais cachés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full mb-3">
                  <Home className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Experts Certifiés</h3>
                <p className="text-sm text-muted-foreground">
                  Évaluation par des professionnels du secteur
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full mb-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Réponse Rapide</h3>
                <p className="text-sm text-muted-foreground">
                  Estimation sous 24-48h maximum
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Remplissez le formulaire</CardTitle>
              <CardDescription>
                Plus vous nous donnez d'informations, plus notre estimation sera précise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Property Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Home className="w-5 h-5 text-secondary" />
                    Informations sur le bien
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property_type">Type de bien *</Label>
                      <Select onValueChange={(value) => setValue("property_type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.property_type && (
                        <p className="text-sm text-destructive">{errors.property_type.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Select onValueChange={(value) => setValue("city", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la ville" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.city && (
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Quartier / Localisation *</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Almadies, Ngor, Somone..."
                      {...register("location")}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="surface">Surface (m²)</Label>
                      <Input
                        id="surface"
                        type="number"
                        placeholder="Ex: 150"
                        {...register("surface")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Chambres</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="Ex: 3"
                        {...register("bedrooms")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Salles de bain</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="Ex: 2"
                        {...register("bathrooms")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">État du bien</Label>
                    <Select onValueChange={(value) => setValue("condition", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez l'état" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Ajoutez des détails supplémentaires : vue, proximités, rénovations récentes..."
                      rows={4}
                      {...register("description")}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-secondary" />
                    Vos coordonnées
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Nom complet *</Label>
                    <Input
                      id="contact_name"
                      placeholder="Ex: Jean Dupont"
                      {...register("contact_name")}
                    />
                    {errors.contact_name && (
                      <p className="text-sm text-destructive">{errors.contact_name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        placeholder="votre@email.com"
                        {...register("contact_email")}
                      />
                      {errors.contact_email && (
                        <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Téléphone *</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        placeholder="+221 77 XXX XX XX"
                        {...register("contact_phone")}
                      />
                      {errors.contact_phone && (
                        <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary-glow text-white py-6 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Calculator className="w-5 h-5 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Obtenir mon estimation gratuite
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  En soumettant ce formulaire, vous acceptez d'être contacté par nos experts
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreeEstimation;
