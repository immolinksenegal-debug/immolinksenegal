import { useEffect, useState } from "react";
import { getBannerBlur } from "@/lib/bannerBlur";
import { preloadBanner, prefetchBanners } from "@/lib/bannerPreload";

interface PageBannerProps {
  image: string;
  alt: string;
  title: React.ReactNode;
  subtitle?: string;
  eager?: boolean;
  /** Point focal de l'image (recadrage intelligent). Ex: "50% 35%" */
  focal?: string;
  /** Point focal spécifique mobile (par défaut identique au focal). */
  focalMobile?: string;
}

/**
 * Bannière d'en-tête uniforme (hauteur, overlay et typographie identiques sur toutes les pages).
 * Optimisée mobile : recadrage focal, chargement progressif (blur-up), préchargement et cache.
 */
const PageBanner = ({
  image,
  alt,
  title,
  subtitle,
  eager = false,
  focal = "50% 45%",
  focalMobile,
}: PageBannerProps) => {
  const blur = getBannerBlur(image);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (eager) preloadBanner(image);
    prefetchBanners();
  }, [eager, image]);

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-muted">
      {blur && (
        <img
          src={blur}
          alt=""
          aria-hidden="true"
          className={`page-banner-img page-banner-blur absolute inset-0 w-full h-full object-cover ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
          style={
            {
              "--banner-focal": focal,
              "--banner-focal-mobile": focalMobile ?? focal,
            } as React.CSSProperties
          }
        />
      )}
      <img
        src={image}
        alt={alt}
        width={1920}
        height={720}
        sizes="100vw"
        className={`page-banner-img relative w-full h-full object-cover transition-opacity duration-700 ${
          loaded || !blur ? "opacity-100" : "opacity-0"
        }`}
        style={
          {
            "--banner-focal": focal,
            "--banner-focal-mobile": focalMobile ?? focal,
          } as React.CSSProperties
        }
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        ref={(el) => {
          if (el?.complete) setLoaded(true);
        }}
      />
      <div className="absolute inset-0 bg-primary/40">
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center pt-16 sm:pt-20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 px-2 text-primary-foreground drop-shadow-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/90 max-w-2xl mx-auto px-2 drop-shadow-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBanner;
