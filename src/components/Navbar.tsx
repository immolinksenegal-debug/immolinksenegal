import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, User, Menu, LogOut, Building2, Calculator, Newspaper, Shield, Share2 } from "lucide-react";
import logo from "@/assets/logo-immo-link-main.png";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ShareButtons from "@/components/ShareButtons";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    };

    // Écouter les changements d'authentification AVANT de vérifier la session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      
      // Gérer les erreurs de token
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });

    // PUIS vérifier la session existante
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Nettoyer la session invalide
        supabase.auth.signOut();
      } else {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        }
      }
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

  const baseNavLinks = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/properties", label: "Biens", icon: Building2 },
    { to: "/articles", label: "Actualités immobilières", icon: Newspaper },
    { to: "/estimation-gratuite", label: "Estimation gratuite", icon: Calculator },
  ];

  const navLinks = user
    ? [
        ...baseNavLinks,
        { to: "/dashboard", label: isAdmin ? "Dashboard admin" : "Dashboard", icon: PlusCircle },
        ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
      ]
    : [
        ...baseNavLinks,
        { to: "/auth", label: "Connexion", icon: User },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect shadow-soft">
      <div className="container mx-auto px-2 xs:px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 xs:h-18 md:h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 xs:space-x-2 group">
            <img 
              src={logo} 
              alt="Immo Link Sénégal" 
              className="h-14 w-14 xs:h-16 xs:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain transition-smooth group-hover:scale-105 drop-shadow-lg" 
            />
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
            <ShareButtons 
              title="Immo Link Sénégal - Plateforme Immobilière"
              description="Découvrez la meilleure plateforme immobilière au Sénégal pour acheter, vendre et louer des biens immobiliers."
              url={window.location.origin}
            />
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
                <div className="w-full">
                  <ShareButtons 
                    title="Immo Link Sénégal - Plateforme Immobilière"
                    description="Découvrez la meilleure plateforme immobilière au Sénégal pour acheter, vendre et louer des biens immobiliers."
                    url={window.location.origin}
                  />
                </div>
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
