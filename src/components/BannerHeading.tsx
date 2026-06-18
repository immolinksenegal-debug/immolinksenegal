import { ReactNode } from "react";

interface BannerHeadingProps {
  title: ReactNode;
  subtitle: string;
  preTitle?: ReactNode;
}

export default function BannerHeading({ title, subtitle, preTitle }: BannerHeadingProps) {
  return (
    <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center pt-16 sm:pt-20 group/banner">
      {preTitle && (
        <div className="animate-fade-in mb-2 sm:mb-3 md:mb-4" style={{ animationDelay: "0ms", animationFillMode: "both" }}>
          {preTitle}
        </div>
      )}
      <h1
        className="animate-fade-in text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 px-2 text-primary-foreground drop-shadow-2xl transition-all duration-500 ease-out hover:tracking-wider hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:scale-[1.02] cursor-default"
        style={{ animationDelay: preTitle ? "100ms" : "0ms", animationFillMode: "both" }}
      >
        {title}
      </h1>
      <p
        className="animate-fade-in text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/90 max-w-2xl mx-auto px-2 drop-shadow-lg transition-all duration-700 ease-out group-hover/banner:text-primary-foreground group-hover/banner:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover/banner:tracking-wide"
        style={{ animationDelay: preTitle ? "250ms" : "150ms", animationFillMode: "both" }}
      >
        {subtitle}
      </p>
    </div>
  );
}
