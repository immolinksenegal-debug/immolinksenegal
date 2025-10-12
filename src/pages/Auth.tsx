import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'authentification
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Immo Link Sénégal !",
      });
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'inscription
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(160,220,180,0.15),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(160,220,180,0.1),transparent_50%)]"></div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-secondary rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-smooth"></div>
            <Home className="h-10 w-10 text-secondary relative z-10" />
          </div>
          <span className="text-2xl font-bold text-white">
            Immo Link Sénégal
          </span>
        </Link>

        <div className="glass-effect rounded-2xl p-8 shadow-elevated">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-background/50">
              <TabsTrigger
                value="login"
                className="rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-white transition-smooth"
              >
                Inscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10 bg-white/90 border-white/30 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/90 border-white/30 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-white">
                    <input type="checkbox" className="mr-2 rounded" />
                    Se souvenir de moi
                  </label>
                  <a href="#" className="text-secondary hover:text-secondary-glow transition-base">
                    Mot de passe oublié ?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Nom complet
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Votre nom"
                      className="pl-10 bg-white/90 border-white/30 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10 bg-white/90 border-white/30 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/90 border-white/30 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="text-sm text-white/80">
                  En vous inscrivant, vous acceptez nos{" "}
                  <a href="#" className="text-secondary hover:text-secondary-glow transition-base">
                    conditions d'utilisation
                  </a>{" "}
                  et notre{" "}
                  <a href="#" className="text-secondary hover:text-secondary-glow transition-base">
                    politique de confidentialité
                  </a>
                  .
                </div>

                <Button
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth rounded-xl font-semibold h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription..." : "Créer un compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/80 hover:text-white transition-base text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
