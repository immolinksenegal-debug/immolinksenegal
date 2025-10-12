import { Link } from "react-router-dom";
import { Home, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "À propos", to: "/" },
      { label: "Comment ça marche", to: "/" },
      { label: "Carrières", to: "/" },
      { label: "Blog", to: "/" },
    ],
    support: [
      { label: "Centre d'aide", to: "/" },
      { label: "Conditions d'utilisation", to: "/" },
      { label: "Politique de confidentialité", to: "/" },
      { label: "Contact", to: "/" },
    ],
    services: [
      { label: "Acheter", to: "/" },
      { label: "Vendre", to: "/" },
      { label: "Louer", to: "/" },
      { label: "Estimation gratuite", to: "/" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-smooth"></div>
                <Home className="h-8 w-8 text-secondary relative z-10" />
              </div>
              <span className="text-xl font-bold text-white">
                Immo Link Sénégal
              </span>
            </Link>
            <p className="text-primary-foreground/80 mb-6 max-w-sm leading-relaxed">
              La plateforme immobilière moderne qui connecte acheteurs, vendeurs et locataires 
              à travers tout le Sénégal.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+221 33 XXX XX XX</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4 text-secondary" />
                <span>contact@immolink.sn</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Dakar, Sénégal</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/80 hover:text-secondary transition-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/80 hover:text-secondary transition-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-primary-foreground/80 hover:text-secondary transition-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/70 text-sm">
              © {currentYear} Immo Link Sénégal. Tous droits réservés.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-secondary flex items-center justify-center transition-smooth group"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5 text-primary-foreground group-hover:text-white transition-base" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
