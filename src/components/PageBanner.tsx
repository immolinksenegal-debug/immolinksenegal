interface PageBannerProps {
  image: string;
  alt: string;
  title: React.ReactNode;
  subtitle?: string;
  eager?: boolean;
}

/**
 * Bannière d'en-tête uniforme (hauteur, overlay et typographie identiques sur toutes les pages).
 */
const PageBanner = ({ image, alt, title, subtitle, eager = false }: PageBannerProps) => (
  <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-muted">
    <img
      src={image}
      alt={alt}
      width={1920}
      height={720}
      className="w-full h-full object-cover"
      loading={eager ? "eager" : "lazy"}
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

export default PageBanner;
