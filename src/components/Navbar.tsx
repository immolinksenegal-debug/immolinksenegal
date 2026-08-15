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
    { to: "/properties?transaction=vente", label: "Acheter", icon: Building2 },
    { to: "/properties?transaction=location", label: "Louer", icon: Home },
    { to: "/estimation-gratuite", label: "Vendre", icon: Calculator },
    { to: "/articles", label: "Actualités", icon: Newspaper },
  ];

  const navLinks = user
    ? [
        ...baseNavLinks,
        { to: "/dashboard", label: isAdmin ? "Dashboard admin" : "Dashboard", icon: PlusCircle },
        ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
      ]
    : [...baseNavLinks, { to: "/auth", label: "Connexion", icon: User }];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-soft"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logo}
              alt="Immo Link Sénégal"
              className="h-11 w-11 md:h-14 md:w-14 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className={`font-display text-lg md:text-xl font-extrabold tracking-tight ${
                scrolled ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              IMMO LINK
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium rounded-lg transition-colors ${
                    scrolled
                      ? "text-foreground/80 hover:text-primary hover:bg-muted"
                      : "text-primary-foreground/85 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            {user ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className={`text-sm font-medium rounded-lg ${
                  scrolled
                    ? "text-foreground/80 hover:text-destructive hover:bg-muted"
                    : "text-primary-foreground/85 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  className={`text-sm font-semibold rounded-lg ${
                    scrolled
                      ? "text-primary hover:bg-muted"
                      : "text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
                >
                  Créer un compte
                </Button>
              </Link>
            )}

            <Link to="/dashboard" className="ml-2">
              <Button className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-[0_10px_24px_-12px_hsl(var(--primary)/0.9)]">
                Publier une annonce
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={scrolled ? "text-foreground" : "text-primary-foreground"}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background border-l border-border">
              <div className="flex flex-col gap-2 mt-10">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-medium text-foreground/85 hover:text-primary hover:bg-muted rounded-lg"
                    >
                      <link.icon className="h-4 w-4 mr-3 text-secondary" />
                      {link.label}
                    </Button>
                  </Link>
                ))}

                <div className="h-px bg-border my-2" />

                {user ? (
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-base text-foreground/85 hover:text-destructive hover:bg-muted rounded-lg"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Déconnexion
                  </Button>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl border-primary/25 text-primary font-semibold">
                      Créer un compte
                    </Button>
                  </Link>
                )}

                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    <Zap className="h-4 w-4 mr-2" />
                    Publier une annonce
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
