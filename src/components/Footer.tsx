import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo-immo-link-new.png";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerLinks = {
    company: [{
      label: "À propos",
      to: "/a-propos"
    }, {
      label: "Comment ça marche",
      to: "/comment-ca-marche"
    }, {
      label: "Nos biens",
      to: "/properties"
    }, {
      label: "Contact",
      to: "/contact"
    }],
    support: [{
      label: "Centre d'aide",
      to: "/contact"
    }, {
      label: "Conditions d'utilisation",
      to: "/conditions"
    }, {
      label: "Politique de confidentialité",
      to: "/confidentialite"
    }, {
      label: "Nous contacter",
      to: "/contact"
    }],
    services: [{
      label: "Acheter",
      to: "/properties"
    }, {
      label: "Vendre",
      to: "/dashboard"
    }, {
      label: "Louer",
      to: "/properties"
    }, {
      label: "Estimation gratuite",
      to: "/estimation-gratuite"
    }]
  };
  const socialLinks = [{
    icon: Facebook,
    href: "https://facebook.com",
    label: "Facebook"
  }, {
    icon: Twitter,
    href: "https://twitter.com",
    label: "Twitter"
  }, {
    icon: Instagram,
    href: "https://instagram.com",
    label: "Instagram"
  }, {
    icon: Linkedin,
    href: "https://linkedin.com",
    label: "LinkedIn"
  }];
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 xs:px-6 py-8 xs:py-12 bg-orange-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 xs:gap-8 mb-6 xs:mb-8">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <Link to="/" className="flex items-center mb-4 group">
              <img src={logo} alt="Immo Link Sénégal" className="h-24 w-24 xs:h-28 xs:w-28 md:h-32 md:w-32 object-contain transition-smooth group-hover:scale-110 drop-shadow-2xl" />
            </Link>
            <p className="text-sm xs:text-base mb-4 xs:mb-6 max-w-sm leading-relaxed text-purple-50">
              La plateforme immobilière moderne qui connecte acheteurs, vendeurs et locataires 
              à travers tout le Sénégal.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 xs:space-y-3">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm xs:text-base text-primary-foreground/80">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+221 77 117 79 77</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm xs:text-base text-primary-foreground/80">
                <Mail className="h-4 w-4 text-secondary" />
                <span>immolinksenegal@gmail.com</span>
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
              {footerLinks.company.map(link => <li key={link.label}>
                  <Link to={link.to} className="text-sm xs:text-base text-primary-foreground/80 hover:text-secondary transition-base">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 xs:mb-4 text-base xs:text-lg">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map(link => <li key={link.label}>
                  <Link to={link.to} className="text-sm xs:text-base text-primary-foreground/80 hover:text-secondary transition-base">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 xs:mb-4 text-base xs:text-lg">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map(link => <li key={link.label}>
                  <Link to={link.to} className="text-sm xs:text-base text-primary-foreground/80 hover:text-secondary transition-base">
                    {link.label}
                  </Link>
                </li>)}
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
              {socialLinks.map(social => {
              const Icon = social.icon;
              return <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 xs:w-10 xs:h-10 rounded-full bg-primary-foreground/10 hover:bg-secondary flex items-center justify-center transition-smooth group" aria-label={social.label}>
                    <Icon className="h-4 w-4 xs:h-5 xs:w-5 text-primary-foreground group-hover:text-white transition-base" />
                  </a>;
            })}
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;