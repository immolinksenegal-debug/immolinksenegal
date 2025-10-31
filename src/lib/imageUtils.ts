/**
 * Optimise les URLs d'images Supabase Storage avec des transformations
 * pour améliorer les performances et réduire la bande passante
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transforme une URL d'image Supabase Storage pour l'optimiser
 * @param url - URL originale de l'image
 * @param options - Options de transformation
 * @returns URL transformée avec paramètres d'optimisation
 */
export const optimizeSupabaseImage = (
  url: string | null,
  options: ImageTransformOptions = {}
): string => {
  // Si pas d'URL ou URL invalide, retourner un placeholder
  if (!url || !url.includes('supabase.co/storage')) {
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
  }

  // Options par défaut pour optimisation
  const defaultOptions: ImageTransformOptions = {
    quality: 80,
    format: 'webp',
    resize: 'cover',
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Construire les paramètres de transformation
  const params = new URLSearchParams();
  
  if (finalOptions.width) params.append('width', finalOptions.width.toString());
  if (finalOptions.height) params.append('height', finalOptions.height.toString());
  if (finalOptions.quality) params.append('quality', finalOptions.quality.toString());
  if (finalOptions.format) params.append('format', finalOptions.format);
  if (finalOptions.resize) params.append('resize', finalOptions.resize);

  // Ajouter les paramètres à l'URL
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

/**
 * Préconfigurations pour différents usages
 */
export const imagePresets = {
  // Carte de propriété - thumbnail
  propertyCard: (url: string | null) => optimizeSupabaseImage(url, {
    width: 600,
    height: 400,
    quality: 75,
  }),

  // Galerie principale - grande image
  propertyHero: (url: string | null) => optimizeSupabaseImage(url, {
    width: 1920,
    height: 1080,
    quality: 85,
  }),

  // Galerie secondaire - miniatures
  propertyThumbnail: (url: string | null) => optimizeSupabaseImage(url, {
    width: 400,
    height: 300,
    quality: 75,
  }),

  // Article featured image
  articleFeatured: (url: string | null) => optimizeSupabaseImage(url, {
    width: 1200,
    height: 630,
    quality: 80,
  }),

  // Article thumbnail
  articleThumbnail: (url: string | null) => optimizeSupabaseImage(url, {
    width: 400,
    height: 300,
    quality: 75,
  }),

  // Avatar/Logo
  avatar: (url: string | null) => optimizeSupabaseImage(url, {
    width: 200,
    height: 200,
    quality: 80,
  }),
};
