import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface IntroProps {
  setShowIntro: (show: boolean) => void;
}

// Cloudflare R2 URLs
const VIDEO_URL = 'https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara-nature.mp4';
const IMAGE_URL = 'https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara.jpg';

export const Intro: React.FC<IntroProps> = ({ setShowIntro }) => {
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useImageFallback, setUseImageFallback] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1000); // Show button faster

    // Check if video is accessible
    fetch(VIDEO_URL, { method: 'HEAD' })
      .then(res => {
        if (!res.ok) {
          setUseImageFallback(true);
        }
      })
      .catch(() => setUseImageFallback(true));

    return () => clearTimeout(timer);
  }, []);

  const handleExplore = () => {
    setIsLoading(true);

    if (wrapperRef.current) {
      wrapperRef.current.classList.add('fade-out-soft');
    }

    setTimeout(() => {
      setShowIntro(false);
    }, 300); // shorter fade
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-sans bg-black transition-opacity duration-300 ease-in-out"
    >
      {/* Video Background */}
      {!useImageFallback ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
          onError={() => {
            console.error("Video failed to load");
            setUseImageFallback(true);
          }}
          poster={IMAGE_URL}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${IMAGE_URL}')` }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-[24px] sm:text-5xl lg:text-6xl font-bold text-white text-center leading-tight font-sans">
          Budućnost transporta je stigla
        </h1>
        <div className={`mt-8 sm:mt-12 flex justify-center transition-transform duration-300 ${showButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <Button 
            onClick={handleExplore}
            disabled={isLoading}
            className="bg-white/80 backdrop-blur-sm text-black hover:bg-white/90 px-8 py-6 text-[16px] sm:text-xl transition-all duration-300 hover:scale-105 font-sans disabled:opacity-80"
          >
            {isLoading ? 'Učitavanje...' : 'Istraži'}
          </Button>
        </div>
      </div>
    </div>
  );
};
