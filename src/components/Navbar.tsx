import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, User, Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/auth", label: "Connexion", icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-smooth"></div>
              <Home className="h-8 w-8 text-secondary relative z-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Immo Link Sénégal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="ghost" className="transition-base hover:text-secondary">
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <Link to="/dashboard">
              <Button className="bg-secondary hover:bg-secondary-glow text-white shadow-glow-secondary transition-smooth">
                <PlusCircle className="h-4 w-4 mr-2" />
                Publier une annonce
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start transition-base hover:text-secondary">
                      <link.icon className="h-4 w-4 mr-2" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-secondary hover:bg-secondary-glow text-white transition-smooth">
                    <PlusCircle className="h-4 w-4 mr-2" />
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
