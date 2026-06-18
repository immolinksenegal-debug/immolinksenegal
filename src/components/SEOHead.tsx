import { Helmet } from 'react-helmet-async';

type SchemaType = 'website' | 'article' | 'realestate';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  /** Open Graph type. 'article' uses the Article OG type; 'realestate' falls back to 'website'. */
  type?: 'website' | 'article' | 'realestate';
  publishedTime?: string;
  modifiedTime?: string;
  /** Which JSON-LD schema to emit. Defaults to a sitewide RealEstateAgent (website type). */
  schemaType?: SchemaType;
  /** Schema-specific extras (price/currency for realestate, author for article, etc.) */
  schema?: {
    price?: number | string;
    priceCurrency?: string;
    author?: string;
    location?: { city?: string; region?: string; country?: string };
  };
}

const SITE_URL = 'https://immolinksenegal.lovable.app';

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  schemaType,
  schema,
}: SEOHeadProps) => {
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const fullImage = image?.startsWith('http')
    ? image
    : image
      ? `${SITE_URL}${image}`
      : `${SITE_URL}/hero-immobilier-senegal.jpg`;

  const truncatedDescription = description.length > 160
    ? description.substring(0, 157) + '...'
    : description;

  // OG type — Schema.org "realestate" isn't a valid og:type, fall back to website
  const ogType = type === 'article' ? 'article' : 'website';

  // Default JSON-LD: sitewide RealEstateAgent (used on listing / informational pages)
  const inferredSchema: SchemaType = schemaType
    ?? (type === 'article' ? 'article' : 'website');

  let structuredData: Record<string, unknown>;
  if (inferredSchema === 'article') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: truncatedDescription,
      image: fullImage,
      url: fullUrl,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: { '@type': 'Organization', name: schema?.author || 'Immo Link Sénégal' },
      publisher: {
        '@type': 'Organization',
        name: 'Immo Link Sénégal',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': fullUrl },
    };
  } else if (inferredSchema === 'realestate') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description: truncatedDescription,
      image: fullImage,
      url: fullUrl,
      ...(schema?.price && {
        offers: {
          '@type': 'Offer',
          price: String(schema.price),
          priceCurrency: schema.priceCurrency || 'XOF',
          availability: 'https://schema.org/InStock',
          url: fullUrl,
        },
      }),
      ...(schema?.location && {
        areaServed: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: schema.location.city,
            addressRegion: schema.location.region,
            addressCountry: schema.location.country || 'SN',
          },
        },
      }),
    };
  } else {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: 'Immo Link Sénégal',
      description: truncatedDescription,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`,
      image: fullImage,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'SN',
        addressLocality: 'Dakar',
      },
    };
  }

  return (
    <Helmet>
      <title>{title} | Immo Link Sénégal</title>
      <meta name="description" content={truncatedDescription} />
      <meta name="author" content="Immo Link Sénégal" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="language" content="French" />
      <meta name="geo.region" content="SN" />
      <meta name="geo.placename" content="Dakar, Sénégal" />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Immo Link Sénégal" />
      <meta property="og:locale" content="fr_SN" />

      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={fullImage} />

      <link rel="canonical" href={fullUrl} />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <meta name="theme-color" content="#005C00" />
    </Helmet>
  );
};

export default SEOHead;
