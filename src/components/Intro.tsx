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
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useImageFallback, setUseImageFallback] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      .catch((error) => {
        console.error('Error checking video file:', error);
        setUseImageFallback(true);
      });

    // Preload fallback image
    const img = new Image();
    img.src = IMAGE_URL;

    return () => clearTimeout(timer);
  }, []);

  const handleExplore = async () => {
    setIsLoading(true);

    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.src = IMAGE_URL;
    });

    if (wrapperRef.current) {
      wrapperRef.current.classList.add('opacity-0');
    }

    setTimeout(() => {
      setShowIntro(false);
    }, 800);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    setUseImageFallback(true);
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-sans transition-opacity duration-700 ease-in-out"
    >
      {/* Video Background */}
      {!useImageFallback && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{
            display: videoLoaded ? 'block' : 'none',
          }}
          onLoadedData={() => {
            console.log('Video loaded');
            setVideoLoaded(true);
          }}
          onError={handleVideoError}
        >
          <source src={VIDEO_URL} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Fallback Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${IMAGE_URL}')`,
          display: (!videoLoaded || useImageFallback) ? 'block' : 'none',
        }}
      />

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
