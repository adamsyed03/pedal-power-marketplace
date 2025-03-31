import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface IntroProps {
  setShowIntro: (show: boolean) => void;
}

export const Intro: React.FC<IntroProps> = ({ setShowIntro }) => {
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);

    // Preload the main page background image
    const img = new Image();
    img.src = '/Tara.jpg';

    return () => clearTimeout(timer);
  }, []);

  const handleExplore = async () => {
    setIsLoading(true);
    
    // Ensure main page image is loaded
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.src = '/Tara.jpg';
    });

    // Switch to main page immediately
    setShowIntro(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover scale-105"
        style={{ willChange: 'transform' }}
        onError={(e) => {
          console.error('Video loading error:', e);
          setVideoError('Error loading video');
        }}
        onLoadedData={() => {
          console.log('Video loaded successfully');
          setVideoError(null);
        }}
      >
        <source src="/tara-nature.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {videoError && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded">
          {videoError}
        </div>
      )}

      {/* Overlay with gradient */}
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