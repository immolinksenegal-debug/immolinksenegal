import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";

const propertySchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères").max(100),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères").max(2000),
  type: z.string().min(1, "Veuillez sélectionner un type de bien"),
  price: z.string().min(1, "Le prix est requis"),
  location: z.string().min(3, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  surface: z.string().min(1, "La surface est requise"),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Email invalide").optional().or(z.literal("")),
  contact_whatsapp: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  onSuccess?: () => void;
}

const PropertyForm = ({ onSuccess }: PropertyFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: "Trop d'images",
        description: "Vous pouvez télécharger jusqu'à 5 images maximum",
        variant: "destructive",
      });
      return;
    }

    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour créer une annonce",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      const { error: insertError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          type: data.type,
          price: parseFloat(data.price),
          location: data.location,
          city: data.city,
          bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
          bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
          surface: parseFloat(data.surface),
          images: imageUrls,
          status: 'active',
          contact_phone: data.contact_phone || null,
          contact_email: data.contact_email || null,
          contact_whatsapp: data.contact_whatsapp || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Votre annonce a été créée avec succès",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'annonce",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Créer une nouvelle annonce</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Titre de l'annonce *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ex: Appartement moderne 3 pièces au Plateau"
              className="mt-1"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Décrivez votre bien en détail..."
              className="mt-1 min-h-[120px]"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="type">Type de bien *</Label>
              <Select onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Appartement">Appartement</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Maison">Maison</SelectItem>
                  <SelectItem value="Terrain">Terrain</SelectItem>
                  <SelectItem value="Bureau">Bureau</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                {...register("price")}
                placeholder="Ex: 45000000"
                className="mt-1"
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="location">Adresse *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Ex: Avenue Léopold Sédar Senghor"
                className="mt-1"
              />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="Ex: Dakar"
                className="mt-1"
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="bedrooms">Chambres</Label>
              <Input
                id="bedrooms"
                type="number"
                {...register("bedrooms")}
                placeholder="Ex: 3"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Salles de bain</Label>
              <Input
                id="bathrooms"
                type="number"
                {...register("bathrooms")}
                placeholder="Ex: 2"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="surface">Surface (m²) *</Label>
              <Input
                id="surface"
                type="number"
                {...register("surface")}
                placeholder="Ex: 120"
                className="mt-1"
              />
              {errors.surface && (
                <p className="text-sm text-destructive mt-1">{errors.surface.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📞 Informations de contact
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Renseignez vos coordonnées pour que les acheteurs puissent vous contacter
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="contact_phone">Téléphone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  {...register("contact_phone")}
                  placeholder="Ex: +221 77 123 45 67"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contact_whatsapp">WhatsApp</Label>
                <Input
                  id="contact_whatsapp"
                  type="tel"
                  {...register("contact_whatsapp")}
                  placeholder="Ex: +221 77 123 45 67"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register("contact_email")}
                  placeholder="Ex: email@example.com"
                  className="mt-1"
                />
                {errors.contact_email && (
                  <p className="text-sm text-destructive mt-1">{errors.contact_email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label>Photos (Maximum 5)</Label>
            <div className="mt-2">
              <label
                htmlFor="images"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Cliquez pour télécharger des images
                </span>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-secondary hover:bg-secondary-glow text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'annonce"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
