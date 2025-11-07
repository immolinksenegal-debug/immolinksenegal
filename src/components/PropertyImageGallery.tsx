import { useState } from "react";
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
            className="md:col-span-2 aspect-video md:aspect-[21/9] overflow-hidden group cursor-pointer relative"
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
              className="aspect-video overflow-hidden group cursor-pointer relative"
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
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-white/70">
                  {currentIndex + 1} / {images.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <div 
                className="relative transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={images[currentIndex]}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="pointer-events-auto text-white hover:bg-white/20 rounded-full h-12 w-12 backdrop-blur-sm"
                disabled={images.length <= 1}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="pointer-events-auto text-white hover:bg-white/20 rounded-full h-12 w-12 backdrop-blur-sm"
                disabled={images.length <= 1}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-24 right-4 flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoomLevel(1);
                    }}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-16 xs:w-20 xs:h-20 rounded-lg overflow-hidden transition-all",
                      currentIndex === index
                        ? "ring-2 ring-primary scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
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
