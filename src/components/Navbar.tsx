import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, User, Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/");
    setIsOpen(false);
  };

  const navLinks = user
    ? [
        { to: "/", label: "Accueil", icon: Home },
        { to: "/dashboard", label: "Dashboard", icon: PlusCircle },
      ]
    : [
        { to: "/", label: "Accueil", icon: Home },
        { to: "/auth", label: "Connexion", icon: User },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect shadow-soft">
      <div className="container mx-auto px-2 xs:px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 xs:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 xs:space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-smooth"></div>
              <Home className="h-6 w-6 xs:h-7 xs:w-7 md:h-8 md:w-8 text-secondary relative z-10" />
            </div>
            <span className="text-sm xs:text-base md:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              <span className="hidden sm:inline">Immo Link Sénégal</span>
              <span className="sm:hidden">Immo Link</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="ghost" className="transition-base hover:text-secondary text-xs lg:text-sm">
                  <link.icon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden lg:inline">{link.label}</span>
                  <span className="lg:hidden">{link.label.split(' ')[0]}</span>
                </Button>
              </Link>
            ))}
            {user ? (
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="transition-base hover:text-secondary text-xs lg:text-sm"
              >
                <LogOut className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Déconnexion</span>
                <span className="lg:hidden">Sortir</span>
              </Button>
            ) : (
              <Link to="/dashboard">
                <Button className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth text-xs lg:text-sm px-2 lg:px-4">
                  <PlusCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden xl:inline">Publier une annonce</span>
                  <span className="xl:hidden">Publier</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 xs:w-72">
              <div className="flex flex-col space-y-3 xs:space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start transition-base hover:text-secondary text-sm xs:text-base">
                      <link.icon className="h-4 w-4 mr-2" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {user ? (
                  <Button 
                    onClick={handleLogout}
                    variant="ghost" 
                    className="w-full justify-start transition-base hover:text-secondary text-sm xs:text-base"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                ) : (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-secondary hover:bg-secondary-glow text-white transition-smooth text-sm xs:text-base">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Publier une annonce
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
