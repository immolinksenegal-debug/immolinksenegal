import { useEffect, useState } from "react";
import { getBannerBlur } from "@/lib/bannerBlur";
import { preloadBanner, prefetchBanners } from "@/lib/bannerPreload";

interface PageBannerProps {
  image: string;
  /** Texte alternatif descriptif (SEO + lecteurs d'écran). */
  alt: string;
  title: React.ReactNode;
  subtitle?: string;
  eager?: boolean;
  /** Point focal par défaut (écrans paysage). Ex: "50% 35%" */
  focal?: string;
  /** Point focal mobile / portrait — garde les visages et points clés visibles. */
  focalMobile?: string;
  /** Contenu optionnel affiché au-dessus du titre (icône, badge). */
  topSlot?: React.ReactNode;
}

/**
 * Bannière d'en-tête uniforme : recadrage focal adaptatif (portrait/paysage),
 * chargement progressif (blur-up), préchargement, alt descriptif et H1 unique.
 */
const PageBanner = ({
  image,
  alt,
  title,
  subtitle,
  eager = false,
  focal = "50% 45%",
  focalMobile,
  topSlot,
}: PageBannerProps) => {
  const blur = getBannerBlur(image);
  const [loaded, setLoaded] = useState(false);

  // Fallback automatique : en portrait on remonte le cadrage pour conserver
  // les visages et sujets principaux (souvent dans le tiers supérieur).
  const portraitFocal = focalMobile ?? focal.replace(/(\d+)%\s*$/, (_m, y) =>
    `${Math.max(0, Math.min(100, Number(y) - 10))}%`
  );

  const focalVars = {
    "--banner-focal": focal,
    "--banner-focal-mobile": portraitFocal,
  } as React.CSSProperties;

  useEffect(() => {
    if (eager) preloadBanner(image);
    prefetchBanners();
  }, [eager, image]);

  return (
    <header className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-muted">
      {blur && (
        <img
          src={blur}
          alt=""
          aria-hidden="true"
          className={`page-banner-img page-banner-blur absolute inset-0 w-full h-full object-cover ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
          style={focalVars}
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
        style={focalVars}
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
          {topSlot}
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
    </header>
  );
};

export default PageBanner;
