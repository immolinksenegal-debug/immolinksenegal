import { Link } from "react-router-dom";
import { Home, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "À propos", to: "/" },
      { label: "Comment ça marche", to: "/" },
      { label: "Carrières", to: "/properties" },
      { label: "Blog", to: "/properties" },
    ],
    support: [
      { label: "Centre d'aide", to: "/properties" },
      { label: "Conditions d'utilisation", to: "/" },
      { label: "Politique de confidentialité", to: "/" },
      { label: "Contact", to: "/" },
    ],
    services: [
      { label: "Acheter", to: "/properties" },
      { label: "Vendre", to: "/dashboard" },
      { label: "Louer", to: "/properties" },
      { label: "Estimation gratuite", to: "/estimation-gratuite" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 xs:px-6 py-8 xs:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 xs:gap-8 mb-6 xs:mb-8">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-smooth"></div>
                <Home className="h-7 w-7 xs:h-8 xs:w-8 text-secondary relative z-10" />
              </div>
              <span className="text-lg xs:text-xl font-bold text-white">
                Immo Link Sénégal
              </span>
            </Link>
            <p className="text-sm xs:text-base text-primary-foreground/80 mb-4 xs:mb-6 max-w-sm leading-relaxed">
              La plateforme immobilière moderne qui connecte acheteurs, vendeurs et locataires 
              à travers tout le Sénégal.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 xs:space-y-3">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm xs:text-base text-primary-foreground/80">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+221 33 XXX XX XX</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm xs:text-base text-primary-foreground/80">
                <Mail className="h-4 w-4 text-secondary" />
                <span>contact@immolink.sn</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm xs:text-base text-primary-foreground/80">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Dakar, Sénégal</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 xs:mb-4 text-base xs:text-lg">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm xs:text-base text-primary-foreground/80 hover:text-secondary transition-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 xs:mb-4 text-base xs:text-lg">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm xs:text-base text-primary-foreground/80 hover:text-secondary transition-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 xs:mb-4 text-base xs:text-lg">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm xs:text-base text-primary-foreground/80 hover:text-secondary transition-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 xs:pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/70 text-xs xs:text-sm text-center md:text-left">
              © {currentYear} Immo Link Sénégal. Tous droits réservés.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center justify-center gap-3 xs:gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 xs:w-10 xs:h-10 rounded-full bg-primary-foreground/10 hover:bg-secondary flex items-center justify-center transition-smooth group"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4 xs:h-5 xs:w-5 text-primary-foreground group-hover:text-white transition-base" />
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
