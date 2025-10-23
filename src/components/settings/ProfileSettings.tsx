import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Phone, Loader2 } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .max(20, "Le téléphone ne peut pas dépasser 20 caractères")
    .optional()
    .or(z.literal("")),
  bio: z.string()
    .trim()
    .max(500, "La bio ne peut pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || "");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setValue('full_name', data.full_name || '');
        setValue('phone', data.phone || '');
        setValue('bio', data.bio || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Impossible de charger votre profil");
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: data.full_name || null,
          phone: data.phone || null,
          bio: data.bio || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Impossible de mettre à jour votre profil");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card className="shadow-card border-border/50">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Informations personnelles</CardTitle>
        <CardDescription>
          Gérez vos informations de profil et de contact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="pl-10 bg-muted/50"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Votre email ne peut pas être modifié
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="full_name"
                placeholder="Entrez votre nom complet"
                {...register("full_name")}
                className="pl-10"
              />
            </div>
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+221 XX XXX XX XX"
                {...register("phone")}
                className="pl-10"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Parlez-nous de vous..."
              {...register("bio")}
              className="min-h-[100px] resize-none"
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Maximum 500 caractères
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary hover:bg-secondary-glow text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
