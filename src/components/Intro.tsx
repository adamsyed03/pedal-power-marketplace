import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface IntroProps {
  setShowIntro: (show: boolean) => void;
}

// Video source based on environment
const VIDEO_URL = import.meta.env.PROD 
  ? 'https://media.githubusercontent.com/media/adamsyed03/pedal-power-marketplace/main/public/tara-nature.mp4'
  : '/tara-nature.mp4';

export const Intro: React.FC<IntroProps> = ({ setShowIntro }) => {
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useImageFallback, setUseImageFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);

    // Check if video is accessible
    fetch(VIDEO_URL, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          console.log('Video file not accessible, using fallback');
          setUseImageFallback(true);
        }
      })
      .catch(() => {
        console.log('Error checking video file, using fallback');
        setUseImageFallback(true);
      });

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

  // Function to handle video error
  const handleVideoError = () => {
    console.log('Video loading error, using fallback image');
    setUseImageFallback(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Video Background with Fallback */}
      {!useImageFallback && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ 
            willChange: 'transform',
            display: videoLoaded ? 'block' : 'none'
          }}
          onError={handleVideoError}
          onLoadedData={() => {
            console.log('Video loaded successfully');
            setVideoLoaded(true);
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Fallback background image (shown always until video loads or on error) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/Tara.jpg')", 
          display: (!videoLoaded || useImageFallback) ? 'block' : 'none'
        }}
      />

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
