import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Lock, Loader2, AlertCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(72, "Le mot de passe ne peut pas dépasser 72 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SecuritySettings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setShowSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      setShowSuccess(true);
      reset();
      toast.success("Mot de passe mis à jour avec succès !");
      
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error updating password:', error);
      }
      toast.error(error.message || "Impossible de mettre à jour le mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error logging out:', error);
      }
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-secondary" />
            Sécurité du compte
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {showSuccess && (
              <Alert className="bg-secondary/10 border-secondary">
                <AlertCircle className="h-4 w-4 text-secondary" />
                <AlertDescription className="text-secondary">
                  Votre mot de passe a été mis à jour avec succès !
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Entrez votre nouveau mot de passe"
                    {...register("newPassword")}
                    className="pl-10"
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmez votre nouveau mot de passe"
                    {...register("confirmPassword")}
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule et un chiffre.
                </AlertDescription>
              </Alert>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary-glow text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card border-destructive/20">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Zone de danger</CardTitle>
          <CardDescription>
            Actions irréversibles sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
