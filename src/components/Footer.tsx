import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo-immolink-senegal.png.asset.json";
import ShareButtons from "@/components/ShareButtons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: "IMMO LINK",
      links: [
        { label: "À propos", to: "/a-propos" },
        { label: "Contact", to: "/contact" },
        { label: "Comment ça marche", to: "/comment-ca-marche" },
      ],
    },
    {
      title: "Immobilier",
      links: [
        { label: "Acheter", to: "/properties?transaction=vente" },
        { label: "Louer", to: "/properties?transaction=location" },
        { label: "Vendre", to: "/dashboard" },
        { label: "Publier une annonce", to: "/dashboard" },
      ],
    },
    {
      title: "Professionnels",
      links: [
        { label: "Agences", to: "/contact" },
        { label: "Promoteurs", to: "/contact" },
        { label: "Estimation gratuite", to: "/estimation-gratuite" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Centre d'aide", to: "/contact" },
        { label: "FAQ", to: "/comment-ca-marche" },
        { label: "Conditions d'utilisation", to: "/conditions" },
        { label: "Confidentialité", to: "/confidentialite" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="relative bg-primary text-primary-foreground w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--secondary)/0.22)_0%,transparent_55%)] pointer-events-none" />

      <div className="relative z-10 w-full px-4 sm:px-6 py-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <div className="bg-white rounded-xl p-2 shadow-soft">
                <img src={logo.url} alt="Immo Link Sénégal" className="h-12 w-auto object-contain" />
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/70 max-w-sm leading-relaxed mb-6">
              La marketplace immobilière qui connecte acheteurs, locataires, propriétaires et
              professionnels partout au Sénégal.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Phone className="h-4 w-4 text-accent" /> +221 77 117 79 77
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Mail className="h-4 w-4 text-accent" /> immolinksenegal@gmail.com
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <MapPin className="h-4 w-4 text-accent" /> Dakar, Sénégal
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-7 border-t border-primary-foreground/15 flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-xs sm:text-sm text-primary-foreground/60 text-center md:text-left">
            © {currentYear} IMMO LINK — Tous droits réservés.
          </p>

          <div className="flex items-center gap-3">
            <ShareButtons
              title="IMMO LINK - Plateforme Immobilière"
              description="Achetez, louez, vendez ou publiez votre bien immobilier au Sénégal."
              url={window.location.origin}
            />
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
