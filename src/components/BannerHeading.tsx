import { ReactNode } from "react";

interface BannerHeadingProps {
  title: ReactNode;
  subtitle: string;
  preTitle?: ReactNode;
}

export default function BannerHeading({ title, subtitle, preTitle }: BannerHeadingProps) {
  // motion-safe:* disables animations/heavy hover effects when the user has
  // prefers-reduced-motion enabled — keeps the UI snappy on low-end devices.
  // Hover micro-interactions are gated on `md:` (pointer devices) so they
  // don't run on touch screens where they never trigger but still cost layout.
  return (
    <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center pt-16 sm:pt-20 group/banner">
      {preTitle && (
        <div
          className="motion-safe:animate-fade-in mb-2 sm:mb-3 md:mb-4"
          style={{ animationDelay: "0ms", animationFillMode: "both", willChange: "opacity, transform" }}
        >
          {preTitle}
        </div>
      )}
      <h1
        className="motion-safe:animate-fade-in text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 px-2 text-primary-foreground drop-shadow-2xl transition-transform duration-500 ease-out md:hover:scale-[1.02] cursor-default"
        style={{ animationDelay: preTitle ? "100ms" : "0ms", animationFillMode: "both", willChange: "opacity, transform" }}
      >
        {title}
      </h1>
      <p
        className="motion-safe:animate-fade-in text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/90 max-w-2xl mx-auto px-2 drop-shadow-lg transition-opacity duration-500 ease-out"
        style={{ animationDelay: preTitle ? "250ms" : "150ms", animationFillMode: "both", willChange: "opacity" }}
      >
        {subtitle}
      </p>
    </div>
  );
}
