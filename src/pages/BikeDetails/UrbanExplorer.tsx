import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "../../context/LanguageContext";

const images = [
  { id: 1, src: "/Excellent%201.png", alt: "P-Comfort main view" },
  { id: 2, src: "/Excellent%202.png", alt: "P-Comfort side view" },
  { id: 3, src: "/Excellent%203.png", alt: "P-Comfort folded view" },
  { id: 4, src: "/Excellent%204.png", alt: "P-Comfort detail view" },
];

const specifications = [
  { labelKey: "bike.pogonX.spec.speed", value: "25km/h" },
  { labelKey: "bike.pogonX.spec.range", value: "85km" },
  { labelKey: "bike.pogonX.spec.power", value: "250W" },
  { labelKey: "bike.pogonX.spec.capacity", value: "110kg" },
  { labelKey: "bike.pogonX.spec.chargeTime", value: "5-6h" },
];

export default function UrbanExplorer() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    images.forEach((image) => {
      const img = new Image();
      img.src = image.src;
      img.onload = () => {
        setImagesLoaded((prev) => ({ ...prev, [image.id]: true }));
      };
    });
    setSelectedImage(images[0]);
  }, []);

  useEffect(() => {
    setMainImageLoaded(false);
  }, [selectedImage]);

  const handleImageLoad = () => {
    if (!mainImageLoaded) {
      setMainImageLoaded(true);
    }
  };

  return (
    <div className="min-h-screen pt-14 sm:pt-20 md:pt-24 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
          <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 sm:mb-3 text-center md:text-left">
                {t("bike.pogonX.title")}
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4 px-2 md:px-0">
                {t("bike.pogonX.description")}
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">{t("bike.pogonX.specsTitle")}</h2>
              <div className="space-y-1">
                {specifications.map((spec) => (
                  <p key={spec.labelKey} className="text-sm sm:text-base md:text-lg text-neutral-700">
                    <strong>{t(spec.labelKey)}:</strong> {spec.value}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-center mt-4">
              <p className="text-2xl font-bold text-neutral-900">170,000 RSD</p>
              <div className="flex justify-center px-4 sm:px-0">
                <Button
                  onClick={() => navigate("/buy-waitlist")}
                  className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 py-4 px-8 text-lg font-semibold min-w-[220px]"
                >
                  {t("bike.pogonX.buy")}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 order-1 md:order-2">
            <div
              className="bg-white rounded-xl p-2 sm:p-3 border border-neutral-200 relative overflow-hidden cursor-pointer"
              onClick={() => setZoomDialogOpen(true)}
            >
              {!mainImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="w-full h-[200px] sm:h-[280px] md:h-[350px] rounded-lg" />
                </div>
              )}
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className={`w-full h-[200px] sm:h-[280px] md:h-[350px] object-contain transition-opacity duration-300 ${
                  mainImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={handleImageLoad}
              />
            </div>

            <Dialog open={zoomDialogOpen} onOpenChange={setZoomDialogOpen}>
              <DialogContent className="max-w-4xl w-full">
                <div className="w-full h-[70vh] bg-neutral-50 rounded-lg flex items-center justify-center">
                  <img
                    src={selectedImage.src}
                    alt="Zoomed view"
                    className="max-h-full max-w-full object-contain rounded-lg select-none"
                    draggable={false}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {images.slice(1).map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`bg-white rounded-lg p-1.5 sm:p-2 border transition-all relative ${
                    selectedImage.id === image.id ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {!imagesLoaded[image.id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton className="w-full h-12 sm:h-16 rounded-lg" />
                    </div>
                  )}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full h-12 sm:h-16 object-contain transition-opacity duration-300 ${
                      imagesLoaded[image.id] ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImagesLoaded((prev) => ({ ...prev, [image.id]: true }))}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
