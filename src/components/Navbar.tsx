import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, User, Menu, LogOut, Building2, Calculator, Newspaper, Shield, Zap } from "lucide-react";
import logo from "@/assets/logo-immo-link-main.png";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-background/80 backdrop-blur-xl shadow-[0_4px_30px_hsl(var(--primary)/0.15)] border-b border-primary/20' 
        : 'bg-background/40 backdrop-blur-md border-b border-primary/10'
    }`}>
      {/* Neon top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
      
      <div className="container mx-auto px-2 xs:px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 xs:h-18 md:h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 xs:space-x-2 group relative">
            <div className="absolute -inset-2 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src={logo} 
              alt="Immo Link Sénégal" 
              className="h-14 w-14 xs:h-16 xs:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]" 
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button 
                  variant="ghost" 
                  className="relative text-xs lg:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 group"
                >
                  <link.icon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2 transition-all duration-300 group-hover:drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                  <span className="hidden lg:inline">{link.label}</span>
                  <span className="lg:hidden">{link.label.split(' ')[0]}</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-primary to-secondary group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </Button>
              </Link>
            ))}
            {user ? (
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="text-xs lg:text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
              >
                <LogOut className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Déconnexion</span>
                <span className="lg:hidden">Sortir</span>
              </Button>
            ) : (
              <Link to="/dashboard">
                <Button className="relative overflow-hidden bg-gradient-to-r from-secondary to-primary text-primary-foreground font-semibold text-xs lg:text-sm px-3 lg:px-5 shadow-[0_0_20px_hsl(var(--secondary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--secondary)/0.5)] transition-all duration-500 border border-secondary/30">
                  <Zap className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden xl:inline">Publier une annonce</span>
                  <span className="xl:hidden">Publier</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <Menu className="h-6 w-6 drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 xs:w-72 bg-background/95 backdrop-blur-xl border-l border-primary/20">
              {/* Neon accent in mobile drawer */}
              <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-primary via-secondary to-transparent opacity-60" />
              
              <div className="flex flex-col space-y-2 xs:space-y-3 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 text-sm xs:text-base group"
                    >
                      <link.icon className="h-4 w-4 mr-3 transition-all duration-300 group-hover:drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                
                <div className="h-[1px] bg-gradient-to-r from-primary/30 via-secondary/20 to-transparent my-2" />
                
                {user ? (
                  <Button 
                    onClick={handleLogout}
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 text-sm xs:text-base"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Déconnexion
                  </Button>
                ) : (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-secondary to-primary text-primary-foreground font-semibold shadow-[0_0_20px_hsl(var(--secondary)/0.3)] transition-all duration-500 text-sm xs:text-base border border-secondary/30">
                      <Zap className="h-4 w-4 mr-2" />
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
