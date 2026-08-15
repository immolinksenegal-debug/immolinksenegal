import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  breadcrumbs?: { name: string; path: string }[];
}

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  noindex = false,
  breadcrumbs
}: SEOHeadProps) => {
  const siteUrl = 'https://immolinksenegal.com';
  // Canonical: always self-referencing and free of query strings / hashes
  const canonicalUrl =
    url ||
    (typeof window !== 'undefined'
      ? `${siteUrl}${window.location.pathname.replace(/\/+$/, '') || '/'}`
      : siteUrl);
  const fullUrl = canonicalUrl;
  const fullImage = image?.startsWith('http') ? image : image ? `${siteUrl}${image}` : `${siteUrl}/hero-immobilier-senegal.jpg`;
  
  // Truncate description to 160 characters for optimal SEO
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;


  // Rich keywords for SEO
  const keywords = [
    "immobilier Sénégal",
    "terrain à vendre Dakar",
    "villa à vendre Saly",
    "maison à louer Mbour",
    "appartement Thiès",
    "agence immobilière Sénégal",
    "plateforme immobilière",
    "estimation immobilière gratuite",
    "investissement immobilier Sénégal",
    "terrain viabilisé",
    "titre foncier",
    "immobilier Dakar",
    "villa à louer Saly",
    "terrain à vendre Mbour",
    "maison à vendre Somone",
    "terrain Ngaparou",
    "immobilier Petite Côte",
    "terrain bord de mer Sénégal",
    "villa de luxe Sénégal",
    "immobilier haut standing",
    "résidence sécurisée",
    "projet immobilier Sénégal",
    "annonces immobilières Sénégal",
    "site immobilier moderne",
    "agence immobilière digitale",
    "promotion immobilière",
    "terrain loti",
    "parcelle à vendre",
    "immo Sénégal",
    "acheter terrain Dakar",
    "vendre maison Sénégal",
    "louer appartement Dakar",
    "investir immobilier Afrique"
  ].join(", ");

  // JSON-LD structured data for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Immo Link Sénégal",
    "description": truncatedDescription,
    "url": siteUrl,
    "logo": `${siteUrl}/logo-immo-link-main.png`,
    "image": fullImage,
    "priceRange": "$$",
    "telephone": "+221 XX XXX XX XX",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SN",
      "addressLocality": "Dakar"
    },
    "areaServed": [
      { "@type": "City", "name": "Dakar" },
      { "@type": "City", "name": "Saly" },
      { "@type": "City", "name": "Mbour" },
      { "@type": "City", "name": "Thiès" },
      { "@type": "City", "name": "Somone" },
      { "@type": "City", "name": "Ngaparou" }
    ],
    "serviceType": [
      "Vente de terrains",
      "Vente de villas",
      "Location de maisons",
      "Location d'appartements",
      "Estimation immobilière",
      "Conseil en investissement immobilier"
    ]
  };

  const breadcrumbData = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.name,
      "item": `${siteUrl}${b.path}`
    }))
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title} | Immo Link Sénégal</title>
      <meta name="title" content={`${title} | Immo Link Sénégal`} />
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Immo Link Sénégal" />
      <meta
        name="robots"
        content={noindex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
      />

      <meta name="language" content="French" />
      <meta name="geo.region" content="SN" />
      <meta name="geo.placename" content="Dakar, Sénégal" />
      <meta name="geo.position" content="14.6937;-17.4441" />
      <meta name="ICBM" content="14.6937, -17.4441" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:secure_url" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Immo Link Sénégal" />
      <meta property="og:locale" content="fr_SN" />

      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* LinkedIn */}
      <meta property="og:image:alt" content={title} />
      
      {/* WhatsApp */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#005C00" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />
    </Helmet>
  );
};

export default SEOHead;
