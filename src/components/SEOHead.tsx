import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime
}: SEOHeadProps) => {
  const siteUrl = 'https://immolinksenegal.com';
  const fullUrl = url || window.location.href;
  const fullImage = image?.startsWith('http') ? image : image ? `${siteUrl}${image}` : `${siteUrl}/hero-immobilier-senegal.jpg`;
  
  // Truncate description to 160 characters for optimal SEO
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title} | Immo Link Sénégal</title>
      <meta name="title" content={`${title} | Immo Link Sénégal`} />
      <meta name="description" content={truncatedDescription} />

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
    </Helmet>
  );
};

export default SEOHead;
