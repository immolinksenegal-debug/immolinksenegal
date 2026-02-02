import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import logo from "@/assets/logo-immo-link-main.png";
import ShareButtons from "@/components/ShareButtons";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    company: [
      { label: "À propos", to: "/a-propos" },
      { label: "Comment ça marche", to: "/comment-ca-marche" },
      { label: "Nos biens", to: "/properties" },
      { label: "Contact", to: "/contact" }
    ],
    support: [
      { label: "Centre d'aide", to: "/contact" },
      { label: "Conditions d'utilisation", to: "/conditions" },
      { label: "Politique de confidentialité", to: "/confidentialite" },
      { label: "Nous contacter", to: "/contact" }
    ],
    services: [
      { label: "Acheter", to: "/properties" },
      { label: "Vendre", to: "/dashboard" },
      { label: "Louer", to: "/properties" },
      { label: "Estimation gratuite", to: "/estimation-gratuite" }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" }
  ];

  return (
    <footer className="relative bg-background border-t border-border/30 w-full overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.08)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--secondary)/0.08)_0%,transparent_50%)]"></div>
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full px-4 xs:px-6 py-10 xs:py-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 xs:gap-10 mb-8 xs:mb-10">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <Link to="/" className="flex items-center mb-5 group">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="Immo Link Sénégal" 
                  className="h-24 w-24 xs:h-28 xs:w-28 md:h-32 md:w-32 object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-2xl" 
                />
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </Link>
            
            <p className="text-sm xs:text-base mb-5 xs:mb-6 max-w-sm leading-relaxed text-muted-foreground">
              La plateforme immobilière moderne qui connecte acheteurs, vendeurs et locataires 
              à travers tout le Sénégal.
            </p>
            
            {/* Contact Info with neon icons */}
            <div className="space-y-3 xs:space-y-4">
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm xs:text-base group cursor-default">
                <div className="w-8 h-8 rounded-lg glass-effect flex items-center justify-center group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all duration-300">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">+221 77 117 79 77</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm xs:text-base group cursor-default">
                <div className="w-8 h-8 rounded-lg glass-effect flex items-center justify-center group-hover:shadow-[0_0_15px_hsl(var(--secondary)/0.3)] transition-all duration-300">
                  <Mail className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">immolinksenegal@gmail.com</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm xs:text-base group cursor-default">
                <div className="w-8 h-8 rounded-lg glass-effect flex items-center justify-center group-hover:shadow-[0_0_15px_hsl(var(--accent)/0.3)] transition-all duration-300">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Dakar, Sénégal</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="font-semibold mb-4 xs:mb-5 text-base xs:text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Entreprise</span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-sm xs:text-base text-muted-foreground hover:text-primary transition-all duration-200 relative group inline-block"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="font-semibold mb-4 xs:mb-5 text-base xs:text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Support</span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-sm xs:text-base text-muted-foreground hover:text-secondary transition-all duration-200 relative group inline-block"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-secondary to-accent group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="font-semibold mb-4 xs:mb-5 text-base xs:text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Services</span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-sm xs:text-base text-muted-foreground hover:text-accent transition-all duration-200 relative group inline-block"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-gradient-to-r from-accent to-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 xs:pt-10 border-t border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <p className="text-muted-foreground text-xs xs:text-sm text-center md:text-left">
              © {currentYear}{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-medium">
                Immo Link Sénégal
              </span>
              . Tous droits réservés.
            </p>
            
            {/* Social Links & Share */}
            <div className="flex items-center justify-center gap-3 xs:gap-4">
              <ShareButtons 
                title="Immo Link Sénégal - Plateforme Immobilière"
                description="Découvrez la meilleure plateforme immobilière au Sénégal pour acheter, vendre et louer des biens immobiliers."
                url={window.location.origin}
              />
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                const colors = ['primary', 'secondary', 'accent', 'primary'];
                const color = colors[index % colors.length];
                
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 xs:w-11 xs:h-11 rounded-xl glass-effect border border-border/30 hover:border-${color}/50 flex items-center justify-center transition-all duration-300 group hover:shadow-[0_0_20px_hsl(var(--${color})/0.3)]`}
                    aria-label={social.label}
                  >
                    <Icon className={`h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground group-hover:text-${color} transition-colors duration-300`} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top border glow effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
    </footer>
  );
};

export default Footer;
