import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHead = ({
  title,
  description,
  keywords,
  image = "https://storage.googleapis.com/gpt-engineer-file-uploads/3HQRKoPwLbS6o4UNtPowFjhoqbM2/social-images/social-1761134461735-immo link sénégal.png",
  url,
  type = 'website',
  structuredData,
  author,
  publishedTime,
  modifiedTime,
}: SEOHeadProps) => {
  const location = useLocation();
  const currentUrl = url || `https://immolinksenegal.com${location.pathname}`;
  const fullTitle = `${title} | Immo Link Sénégal`;

  useEffect(() => {
    // Mettre à jour le titre
    document.title = fullTitle;

    // Fonction pour mettre à jour ou créer une balise meta
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    // Meta tags basiques
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    
    // Open Graph
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);

    // Twitter Card
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Article meta tags
    if (type === 'article' && author) {
      updateMetaTag('article:author', author, true);
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[data-type="structured-data"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-type', 'structured-data');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Retirer le structured data lors du démontage pour éviter les doublons
      const script = document.querySelector('script[data-type="structured-data"]');
      if (script) {
        script.remove();
      }
    };
  }, [fullTitle, description, keywords, image, currentUrl, type, structuredData, author, publishedTime, modifiedTime]);

  return null;
};

export default SEOHead;
