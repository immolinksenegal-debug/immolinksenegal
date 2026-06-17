import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logoAuth from "@/assets/logo-immo-link-main.png";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email invalide" }),
  password: z.string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .max(72)
    .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule" })
    .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule" })
    .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" }),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, { message: "Le nom doit contenir au moins 2 caractères" }).max(100),
  email: z.string().trim().email({ message: "Email invalide" }),
  password: z.string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .max(72)
    .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule" })
    .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule" })
    .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" }),
});

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    // Écouter les changements d'authentification AVANT de vérifier la session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });

    // PUIS vérifier la session existante
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        if (import.meta.env.DEV) {
          console.error('Session error:', error);
        }
        // Nettoyer la session invalide
        await supabase.auth.signOut();
      } else if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validation
      const validatedData = loginSchema.parse(loginData);
      
      // Connexion avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: "Email ou mot de passe incorrect",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: error.message,
          });
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Immo Link Sénégal !",
        });
        // La redirection sera gérée par onAuthStateChange
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la connexion",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validation
      const validatedData = signupSchema.parse(signupData);
      
      // Inscription avec Supabase
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: validatedData.name,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: "Cet email est déjà utilisé",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: error.message,
          });
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès !",
        });
        // La redirection sera gérée par onAuthStateChange
      } else {
        toast({
          title: "Vérifiez votre email",
          description: "Un email de confirmation a été envoyé à votre adresse",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de l'inscription",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
      {/* Decorative brand tints */}
      <div className="absolute inset-0 bg-mesh opacity-90 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--accent)/0.12),transparent_55%)] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-6 group">
          <img
            src={logoAuth}
            alt="Immo Link Sénégal"
            className="h-28 w-auto object-contain transition-smooth group-hover:scale-105 drop-shadow-xl"
          />
        </Link>

        {/* Brand gradient bar */}
        <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-accent to-secondary" />

        <div className="glass-card p-8 shadow-elevated">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-smooth"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary-glow data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md transition-smooth"
              >
                Inscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10 bg-background border-border h-12 rounded-xl text-foreground focus:border-primary focus:ring-primary/30"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-background border-border h-12 rounded-xl text-foreground focus:border-primary focus:ring-primary/30"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-muted-foreground">
                    <input type="checkbox" className="mr-2 rounded accent-primary" />
                    Se souvenir de moi
                  </label>
                  <a href="#" className="text-secondary hover:text-secondary-glow font-medium transition-base">
                    Mot de passe oublié ?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.5)] transition-smooth rounded-xl font-semibold h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Nom complet
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Votre nom"
                      className="pl-10 bg-background border-border h-12 rounded-xl text-foreground focus:border-secondary focus:ring-secondary/30"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10 bg-background border-border h-12 rounded-xl text-foreground focus:border-secondary focus:ring-secondary/30"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground font-medium">
                    Mot de passe
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Min. 8 caractères avec majuscule, minuscule et chiffre
                  </p>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-background border-border h-12 rounded-xl text-foreground focus:border-secondary focus:ring-secondary/30"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  En vous inscrivant, vous acceptez nos{" "}
                  <a href="#" className="text-primary hover:text-primary-glow font-medium transition-base">
                    conditions d'utilisation
                  </a>{" "}
                  et notre{" "}
                  <a href="#" className="text-primary hover:text-primary-glow font-medium transition-base">
                    politique de confidentialité
                  </a>
                  .
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-secondary to-secondary-glow hover:opacity-90 text-secondary-foreground shadow-[0_8px_24px_-8px_hsl(var(--secondary)/0.5)] transition-smooth rounded-xl font-semibold h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription..." : "Créer un compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-base text-sm font-medium">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>

  );
};

export default Auth;
