import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, User, Menu, LogOut, Building2, Calculator, Newspaper, Shield, Zap, X, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const axisLocked = useRef<"h" | "v" | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    axisLocked.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (!axisLocked.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axisLocked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (axisLocked.current !== "h") return;
    if (!dragging) setDragging(true);
    // résistance élastique vers la gauche
    setDragX(dx > 0 ? dx : dx / 6);
  };

  const handleTouchEnd = () => {
    const start = touchStart.current;
    touchStart.current = null;
    if (axisLocked.current !== "h") {
      setDragging(false);
      setDragX(0);
      return;
    }
    const elapsed = start ? Date.now() - start.t : 1;
    const velocity = dragX / Math.max(elapsed, 1);
    setDragging(false);
    if (dragX > 90 || velocity > 0.5) {
      setDragX(0);
      setIsOpen(false);
    } else {
      setDragX(0);
    }
  };

  // Fermeture via le bouton retour du téléphone/navigateur
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ mobileMenu: true }, "");
    const onPop = () => setIsOpen(false);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (window.history.state?.mobileMenu) window.history.back();
    };
  }, [isOpen]);

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ferme automatiquement le menu mobile à chaque changement de page
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  const isLinkActive = (to: string) => {
    const [path, query] = to.split("?");
    if (location.pathname !== path) return false;
    if (!query) return true;
    const target = new URLSearchParams(query);
    const current = new URLSearchParams(location.search);
    for (const [key, value] of target.entries()) {
      if (current.get(key) !== value) return false;
    }
    return true;
  };

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

  // Seule la page d'accueil a un hero sombre : ailleurs, barre toujours opaque
  const isHome = location.pathname === "/";
  const solid = scrolled || !isHome;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-soft"
          : "bg-transparent border-b border-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo-immolink-senegal.png"
              alt="Immo Link Sénégal"
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.to);
              return (
                <Link key={link.to} to={link.to} aria-current={active ? "page" : undefined}>
                  <Button
                    variant="ghost"
                    className={`text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? "text-primary bg-muted font-semibold"
                        : "text-foreground/80 hover:text-primary hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}

            {user ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-sm font-medium rounded-lg text-foreground/80 hover:text-destructive hover:bg-muted"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  className="text-sm font-semibold rounded-lg text-primary hover:bg-muted"
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
                aria-label="Ouvrir le menu"
                className={`h-11 w-11 transition-transform duration-300 active:scale-90 text-foreground ${isOpen ? "rotate-90" : "rotate-0"}`}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              style={{
                transform: dragX !== 0 ? `translate3d(${dragX}px,0,0)` : undefined,
                transition: dragging ? "none" : "transform 400ms cubic-bezier(0.22,1,0.36,1)",
              }}
              className="w-full sm:max-w-sm p-0 bg-muted/40 backdrop-blur-2xl border-l border-border flex flex-col [&>button]:hidden touch-pan-y will-change-transform"
            >
              {/* Poignée de swipe iOS */}
              <div className="absolute left-0 inset-y-0 w-6 flex items-center justify-center pointer-events-none">
                <span className="h-10 w-1 rounded-full bg-foreground/15" />
              </div>

              {/* Barre de navigation type iOS */}
              <div
                className="flex items-center justify-between gap-2 px-4 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl shrink-0"
                style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(3.5rem + env(safe-area-inset-top))" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={logo.url} alt="Immo Link Sénégal" className="h-9 w-auto object-contain shrink-0" />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer le menu"
                  className="h-9 w-9 shrink-0 rounded-full bg-foreground/8 text-foreground/70 flex items-center justify-center transition-transform active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Liste groupée façon Réglages iOS */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Navigation
                </p>
                <div className="rounded-2xl bg-background shadow-[0_1px_2px_hsl(var(--foreground)/0.06)] overflow-hidden divide-y divide-border/60">
                  {navLinks.map((link, index) => {
                    const active = isLinkActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className="flex items-center gap-3 px-3 h-[52px] transition-colors active:bg-muted animate-fade-in"
                        style={{ animationDelay: `${100 + index * 40}ms` }}
                      >
                        <span
                          className={`h-8 w-8 rounded-[9px] flex items-center justify-center shrink-0 ${
                            active ? "bg-primary text-primary-foreground" : "bg-primary/12 text-primary"
                          }`}
                        >
                          <link.icon className="h-[18px] w-[18px]" />
                        </span>
                        <span
                          className={`flex-1 text-[17px] ${
                            active ? "font-semibold text-primary" : "font-medium text-foreground"
                          }`}
                        >
                          {link.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div
                className="shrink-0 px-4 pt-3 flex flex-col gap-2.5 bg-background/80 backdrop-blur-xl border-t border-border/60 animate-fade-in [animation-delay:220ms]"
                style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
              >
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="group w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[17px] transition-all duration-300 active:scale-[0.98]">
                    <Zap className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    Publier une annonce
                  </Button>
                </Link>

                {user ? (
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full h-12 rounded-2xl text-[17px] text-destructive hover:text-destructive hover:bg-destructive/10 font-medium transition-all duration-300 active:scale-[0.98]"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Déconnexion
                  </Button>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-primary/25 text-primary font-semibold text-[17px] transition-all duration-300 active:scale-[0.98]">
                      Créer un compte
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
