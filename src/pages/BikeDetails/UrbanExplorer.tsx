import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const images = [
  { id: 1, src: "/ebike111.png", alt: "Urban Explorer Front View" },
  { id: 2, src: "/ebike111.png", alt: "Urban Explorer Side View" },
  { id: 3, src: "/ebike111.png", alt: "Urban Explorer Folded" },
  { id: 4, src: "/ebike111.png", alt: "Urban Explorer Details" },
];

const specifications = [
  { label: "Brzina (maks.)", value: "25km/h" },
  { label: "Domet", value: "40km" },
  { label: "Snaga", value: "250W" },
  { label: "Nosivost (maks.)", value: "115kg" },
  { label: "Vreme punjenja", value: "5-6h" },
  { label: "Veličina točkova", value: "16 inch" },
  { label: "Tip konstrukcije", value: "Sklopiv" },
];

export default function UrbanExplorer() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const [mainImageLoaded, setMainImageLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Preload all images
    images.forEach((image) => {
      const img = new Image();
      img.src = image.src;
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [image.id]: true }));
      };
    });
  }, []);

  // Reset main image loaded state when selected image changes
  useEffect(() => {
    setMainImageLoaded(false);
  }, [selectedImage]);

  return (
    <div className="min-h-screen pt-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-3">Pogon X</h1>
              <p className="text-base text-neutral-600 mb-4">
                Pogon X je vrhunski električni bicikl dizajniran za gradsku vožnju, 
                savršen za one kojima su dosadile duge gužve i potrage za parkingom. Sa svojim 
                kompaktnim sklopivim dizajnom i naprednom tehnologijom, predstavlja idealno 
                rešenje za svakodnevno putovanje kroz grad.
              </p>
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Specifikacije</h2>
              <div className="grid gap-2">
                {specifications.map((spec) => (
                  <div key={spec.label} className="flex items-center border-b border-neutral-200 pb-1">
                    <span className="text-neutral-600 w-1/2 text-sm">{spec.label}</span>
                    <span className="text-neutral-900 font-medium text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price and CTA */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-neutral-900">58.500 RSD</p>
                <p className="text-xl text-neutral-500 line-through">63.999 RSD</p>
              </div>
              <Button 
                onClick={() => navigate('/contact')}
                className="w-full bg-neutral-900 text-neutral-50 hover:bg-neutral-800 py-4 text-base"
              >
                Kontaktirajte Nas
              </Button>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="bg-white rounded-xl p-3 border border-neutral-200 relative">
              {!mainImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="w-full h-[350px] rounded-lg" />
                </div>
              )}
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className={`w-full h-[350px] object-contain transition-opacity duration-300 ${
                  mainImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setMainImageLoaded(true)}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`bg-white rounded-lg p-2 border transition-all relative ${
                    selectedImage.id === image.id
                      ? 'border-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {!imagesLoaded[image.id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton className="w-full h-16 rounded-lg" />
                    </div>
                  )}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full h-16 object-contain transition-opacity duration-300 ${
                      imagesLoaded[image.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImagesLoaded(prev => ({ ...prev, [image.id]: true }))}
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