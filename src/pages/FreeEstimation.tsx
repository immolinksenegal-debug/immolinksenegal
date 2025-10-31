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
import { Calculator, CheckCircle, Home, MessageSquare, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import bannerEstimation from "@/assets/banner-fiscalite-senegal.jpg";
import jsPDF from "jspdf";

const estimationSchema = z.object({
  property_type: z.string().min(1, "Le type de bien est requis"),
  location: z.string()
    .trim()
    .min(3, "Le quartier doit contenir au moins 3 caractères")
    .max(200, "Le quartier ne peut pas dépasser 200 caractères"),
  city: z.string().min(2, "La ville est requise"),
  surface: z.string()
    .optional()
    .refine((val) => !val || (parseFloat(val) > 0 && parseFloat(val) <= 100000), {
      message: "La surface doit être entre 1 et 100000 m²"
    }),
  bedrooms: z.string()
    .optional()
    .refine((val) => !val || (parseInt(val) >= 0 && parseInt(val) <= 50), {
      message: "Le nombre de chambres doit être entre 0 et 50"
    }),
  bathrooms: z.string()
    .optional()
    .refine((val) => !val || (parseInt(val) >= 0 && parseInt(val) <= 50), {
      message: "Le nombre de salles de bain doit être entre 0 et 50"
    }),
  condition: z.string().optional(),
  description: z.string()
    .trim()
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .optional()
    .or(z.literal("")),
  contact_name: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  contact_email: z.string()
    .trim()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  contact_phone: z.string()
    .trim()
    .min(8, "Le numéro de téléphone est invalide")
    .max(20, "Le téléphone ne peut pas dépasser 20 caractères"),
});

type EstimationFormData = z.infer<typeof estimationSchema>;

const FreeEstimation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<EstimationFormData | null>(null);
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

  const generatePDF = async (data: EstimationFormData) => {
    setIsGeneratingPdf(true);
    try {
      // Appeler la fonction edge pour obtenir l'estimation IA
      const { data: pdfData, error } = await supabase.functions.invoke('generate-estimation-pdf', {
        body: data
      });

      if (error) throw error;

      if (pdfData?.success && pdfData?.estimation) {
        // Créer le PDF avec jsPDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;
        let yPosition = 20;

        // En-tête avec couleurs Immo Link
        doc.setFillColor(11, 47, 100); // Bleu foncé #0b2f64
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IMMO LINK SÉNÉGAL', margin, 25);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Rapport d\'Estimation Immobilière', margin, 35);
        
        doc.setFontSize(10);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 43);

        // Réinitialiser la couleur du texte
        doc.setTextColor(0, 0, 0);
        yPosition = 65;

        // Section Informations Client
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 74, 43); // Marron #6b4a2b
        doc.text('INFORMATIONS CLIENT', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Nom: ${data.contact_name}`, margin, yPosition);
        yPosition += 7;
        doc.text(`Email: ${data.contact_email}`, margin, yPosition);
        yPosition += 7;
        doc.text(`Téléphone: ${data.contact_phone}`, margin, yPosition);
        yPosition += 15;

        // Section Caractéristiques du Bien
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 74, 43);
        doc.text('CARACTÉRISTIQUES DU BIEN', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const propertyInfo = [
          `Type: ${data.property_type}`,
          `Ville: ${data.city}`,
          `Localisation: ${data.location}`,
          data.surface ? `Surface: ${data.surface} m²` : null,
          data.bedrooms ? `Chambres: ${data.bedrooms}` : null,
          data.bathrooms ? `Salles de bain: ${data.bathrooms}` : null,
          data.condition ? `État: ${data.condition}` : null,
        ].filter(Boolean);

        propertyInfo.forEach((info) => {
          doc.text(info!, margin, yPosition);
          yPosition += 7;
        });

        if (data.description) {
          yPosition += 3;
          doc.setFont('helvetica', 'bold');
          doc.text('Description:', margin, yPosition);
          yPosition += 7;
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(data.description, maxWidth);
          descLines.slice(0, 5).forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += 6;
          });
        }

        yPosition += 10;

        // Section Estimation IA
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 74, 43);
        doc.text('ESTIMATION INTELLIGENTE', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        // Découper l'estimation IA en lignes
        const aiLines = doc.splitTextToSize(pdfData.estimation, maxWidth);
        aiLines.forEach((line: string) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });

        // Pied de page sur la dernière page
        const lastPageNum = doc.internal.pages.length - 1;
        doc.setPage(lastPageNum);
        
        doc.setFillColor(240, 240, 240);
        doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text('Contact: contact@immolinksenegal.com | Tél: +221 XX XXX XX XX', margin, pageHeight - 18);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('www.immolinksenegal.com', margin, pageHeight - 10);

        // Télécharger le PDF
        const fileName = `Estimation_${data.property_type}_${data.city}_${Date.now()}.pdf`;
        doc.save(fileName);

        toast({
          title: "✅ PDF téléchargé avec succès !",
          description: "Votre rapport d'estimation professionnelle a été généré.",
        });
      }
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le rapport",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const onSubmit = async (data: EstimationFormData) => {
    setIsSubmitting(true);
    setLastSubmittedData(data);

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
      
      // Générer automatiquement le PDF après soumission
      await generatePDF(data);

      toast({
        title: "✅ Demande envoyée !",
        description: "Votre rapport PDF a été généré automatiquement.",
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
        <main className="flex-1 flex items-center justify-center py-8 md:py-12 px-4">
          <Card className="max-w-lg w-full text-center">
            <CardHeader className="space-y-3 md:space-y-4 pb-4 md:pb-6">
              <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2 md:mb-4">
                <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
              </div>
              <CardTitle className="text-xl md:text-2xl px-2">Demande reçue !</CardTitle>
              <CardDescription className="text-sm md:text-base px-2">
                Nous avons bien reçu votre demande d'estimation. Notre équipe d'experts vous contactera sous 24-48h avec une estimation détaillée de votre bien.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
              {lastSubmittedData && (
                <Button 
                  onClick={() => generatePDF(lastSubmittedData)} 
                  className="w-full bg-secondary hover:bg-secondary-glow h-11 md:h-12 text-sm md:text-base"
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <>
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                      <span className="text-sm md:text-base">Génération du PDF en cours...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      <span className="text-sm md:text-base">Télécharger à nouveau le PDF</span>
                    </>
                  )}
                </Button>
              )}
              <Button 
                onClick={() => navigate("/")} 
                variant="outline" 
                className="w-full h-11 md:h-12 text-sm md:text-base"
              >
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
      
      <main className="flex-1">
        {/* Hero Banner Image */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
          <img 
            src={bannerEstimation} 
            alt="Estimation immobilière gratuite au Sénégal" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-background/95">
            <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm rounded-full mb-3 md:mb-4">
                <Calculator className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2 text-white drop-shadow-lg">
                Estimation Gratuite
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto px-2 drop-shadow-md">
                Obtenez une estimation précise et gratuite de votre bien immobilier en moins de 24-48h
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 px-4">
            <Card className="h-full">
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-secondary/10 rounded-full mb-2 md:mb-3">
                  <Calculator className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">100% Gratuit</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Sans engagement et sans frais cachés
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-secondary/10 rounded-full mb-2 md:mb-3">
                  <Home className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Experts Certifiés</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Évaluation par des professionnels du secteur
                </p>
              </CardContent>
            </Card>

            <Card className="h-full sm:col-span-2 md:col-span-1">
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-secondary/10 rounded-full mb-2 md:mb-3">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Réponse Rapide</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Estimation sous 24-48h maximum
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="mx-4 md:mx-0">
            <CardHeader className="space-y-2 pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">Remplissez le formulaire</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Plus vous nous donnez d'informations, plus notre estimation sera précise
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                {/* Property Information */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <Home className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                    Informations sur le bien
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="property_type" className="text-sm md:text-base">Type de bien *</Label>
                      <Select onValueChange={(value) => setValue("property_type", value)}>
                        <SelectTrigger className="h-10 md:h-11">
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
                        <p className="text-xs md:text-sm text-destructive break-words">{errors.property_type.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="city" className="text-sm md:text-base">Ville *</Label>
                      <Select onValueChange={(value) => setValue("city", value)}>
                        <SelectTrigger className="h-10 md:h-11">
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
                        <p className="text-xs md:text-sm text-destructive break-words">{errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="location" className="text-sm md:text-base">Quartier / Localisation *</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Almadies, Ngor, Somone..."
                      className="h-10 md:h-11"
                      {...register("location")}
                    />
                    {errors.location && (
                      <p className="text-xs md:text-sm text-destructive break-words">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="surface" className="text-sm md:text-base">Surface (m²)</Label>
                      <Input
                        id="surface"
                        type="number"
                        placeholder="Ex: 150"
                        className="h-10 md:h-11"
                        {...register("surface")}
                      />
                      {errors.surface && (
                        <p className="text-xs md:text-sm text-destructive break-words">{errors.surface.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="bedrooms" className="text-sm md:text-base">Chambres</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="Ex: 3"
                        className="h-10 md:h-11"
                        {...register("bedrooms")}
                      />
                      {errors.bedrooms && (
                        <p className="text-xs md:text-sm text-destructive break-words">{errors.bedrooms.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 md:space-y-2 sm:col-span-2 md:col-span-1">
                      <Label htmlFor="bathrooms" className="text-sm md:text-base">Salles de bain</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="Ex: 2"
                        className="h-10 md:h-11"
                        {...register("bathrooms")}
                      />
                      {errors.bathrooms && (
                        <p className="text-xs md:text-sm text-destructive break-words">{errors.bathrooms.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="condition" className="text-sm md:text-base">État du bien</Label>
                    <Select onValueChange={(value) => setValue("condition", value)}>
                      <SelectTrigger className="h-10 md:h-11">
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

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="description" className="text-sm md:text-base">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Ajoutez des détails supplémentaires : vue, proximités, rénovations récentes..."
                      rows={3}
                      className="min-h-[80px] md:min-h-[100px] resize-y"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-xs md:text-sm text-destructive break-words">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 md:space-y-4 pt-2 md:pt-4 border-t">
                  <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                    Vos coordonnées
                  </h3>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="contact_name" className="text-sm md:text-base">Nom complet *</Label>
                    <Input
                      id="contact_name"
                      placeholder="Ex: Jean Dupont"
                      className="h-10 md:h-11"
                      {...register("contact_name")}
                    />
                    {errors.contact_name && (
                      <p className="text-xs md:text-sm text-destructive break-words">{errors.contact_name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="contact_email" className="text-sm md:text-base">Email *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        placeholder="votre@email.com"
                        className="h-10 md:h-11"
                        {...register("contact_email")}
                      />
                      {errors.contact_email && (
                        <p className="text-xs md:text-sm text-destructive break-words">{errors.contact_email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="contact_phone" className="text-sm md:text-base">Téléphone *</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        placeholder="+221 77 XXX XX XX"
                        className="h-10 md:h-11"
                        {...register("contact_phone")}
                      />
                      {errors.contact_phone && (
                        <p className="text-xs md:text-sm text-destructive break-words">{errors.contact_phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent via-secondary to-accent hover:shadow-glow-accent text-white py-4 md:py-6 text-base md:text-lg font-semibold"
                  disabled={isSubmitting || isGeneratingPdf}
                >
                  {isSubmitting || isGeneratingPdf ? (
                    <>
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                      <span className="text-sm md:text-base">
                        {isGeneratingPdf ? 'Analyse IA en cours...' : 'Envoi en cours...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      <span className="text-sm md:text-base">
                        Obtenir mon estimation gratuite + PDF
                      </span>
                    </>
                  )}
                </Button>

                <div className="text-center space-y-1.5 md:space-y-2 px-2">
                  <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-secondary font-medium">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Rapport PDF généré automatiquement par IA</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    En soumettant ce formulaire, vous acceptez d'être contacté par nos experts
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreeEstimation;
