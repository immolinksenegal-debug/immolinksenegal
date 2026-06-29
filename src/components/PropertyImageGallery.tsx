import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
}

export const PropertyImageGallery = ({ images, title }: PropertyImageGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Swipe gesture state (mobile)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel !== 1 || e.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    isHorizontalSwipeRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Decide direction once movement is significant enough
    if (!isHorizontalSwipeRef.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
    }
    // Block vertical scroll bleed only when we own the gesture horizontally
    if (isHorizontalSwipeRef.current && e.cancelable) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || !isHorizontalSwipeRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dt = Date.now() - start.time;
    const SWIPE_THRESHOLD = 50;
    const FAST_SWIPE = dt < 300 && Math.abs(dx) > 30;
    if (Math.abs(dx) > SWIPE_THRESHOLD || FAST_SWIPE) {
      if (dx < 0) handleNext();
      else handlePrevious();
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    setZoomLevel(1);
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Gallery Grid */}
      <div className="mb-4 xs:mb-6 md:mb-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 xs:gap-4 rounded-xl xs:rounded-2xl overflow-hidden shadow-elegant">
          {/* Main Image */}
          <div 
            className="md:col-span-2 aspect-video md:aspect-[21/9] overflow-hidden group cursor-pointer relative property-image-shadow property-card-3d"
            onClick={() => openGallery(0)}
          >
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover transition-smooth group-hover:scale-110"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-smooth flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                <Maximize2 className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Thumbnail Grid */}
          {images.slice(1, 5).map((image, index) => (
            <div 
              key={index} 
              className="aspect-video overflow-hidden group cursor-pointer relative property-image-shadow property-card-3d"
              onClick={() => openGallery(index + 1)}
            >
              <img
                src={image}
                alt={`${title} ${index + 2}`}
                className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-smooth flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                  <Maximize2 className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              </div>
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-white text-2xl font-bold">
                    +{images.length - 5} photos
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Gallery Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-[95vw] w-full h-[100vh] sm:h-[95vh] p-0 bg-black/95 border-none rounded-none sm:rounded-lg">
          <div className="relative w-full h-full flex flex-col">
            {/* Header - solid gradient for guaranteed legibility */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-start justify-between gap-3 p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/90 via-black/60 to-transparent pb-8 sm:pb-10">
              <div className="text-white min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-lg truncate [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">{title}</h3>
                <p className="text-xs sm:text-sm text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  {currentIndex + 1} / {images.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 bg-black/40 backdrop-blur-sm"
                aria-label="Fermer la galerie"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>

            {/* Main Image - reserve space for header (top) and thumb strip (bottom) */}
            <div
              className="flex-1 flex items-center justify-center px-2 sm:px-4 pt-16 sm:pt-20 pb-28 sm:pb-32 overflow-hidden select-none"
              style={{ touchAction: zoomLevel === 1 ? "pan-y" : "auto" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="relative transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={images[currentIndex]}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  className="max-w-full max-h-[60vh] sm:max-h-[75vh] object-contain"
                />
              </div>
            </div>

            {/* Navigation Controls - smaller on mobile, never overlap header */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-between px-2 sm:px-4 pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="pointer-events-auto text-white hover:bg-white/20 rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-black/40 backdrop-blur-sm"
                disabled={images.length <= 1}
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="pointer-events-auto text-white hover:bg-white/20 rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-black/40 backdrop-blur-sm"
                disabled={images.length <= 1}
                aria-label="Image suivante"
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
            </div>

            {/* Zoom Controls - positioned safely above the thumbnail strip */}
            <div className="absolute bottom-28 sm:bottom-32 right-2 sm:right-4 flex flex-col gap-2 z-40">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="text-white hover:bg-white/20 rounded-full bg-black/40 backdrop-blur-sm h-9 w-9 sm:h-10 sm:w-10"
                aria-label="Zoom avant"
              >
                <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="text-white hover:bg-white/20 rounded-full bg-black/40 backdrop-blur-sm h-9 w-9 sm:h-10 sm:w-10"
                aria-label="Zoom arrière"
              >
                <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Centered Counter - visible during swipes */}
            <div className="absolute top-[82%] left-1/2 -translate-x-1/2 z-50">
              <div className="bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm sm:text-base font-bold shadow-xl border border-white">
                {currentIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip - compact on mobile, safe-area padding */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-6 sm:pt-10">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-start sm:justify-center">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoomLevel(1);
                    }}
                    className={cn(
                      "relative flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden transition-all",
                      currentIndex === index
                        ? "ring-2 ring-primary scale-105 sm:scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                    aria-label={`Afficher l'image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
