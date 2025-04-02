import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface IntroProps {
  setShowIntro: (show: boolean) => void;
}

// Direct Cloudflare R2 URLs
const VIDEO_URL = 'https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara-nature.mp4';
const IMAGE_URL = 'https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara.jpg';

export const Intro: React.FC<IntroProps> = ({ setShowIntro }) => {
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleExplore = async () => {
    setIsLoading(true);

    if (wrapperRef.current) {
      wrapperRef.current.classList.add('opacity-0', 'transition-opacity', 'duration-500', 'ease-in');
    }

    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-sans bg-transparent backdrop-blur-md transition-opacity duration-500"
    >
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105"
        poster={IMAGE_URL}
        onError={() => console.error("Video failed to load")}
      >
        <source src={VIDEO_URL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-[24px] sm:text-5xl lg:text-6xl font-bold text-white leading-tight font-sans">
          Budućnost transporta je stigla
        </h1>
        <div className={`mt-8 sm:mt-12 flex justify-center transition-all duration-300 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button
            onClick={handleExplore}
            disabled={isLoading}
            className="border border-white text-white bg-transparent hover:bg-white/10 px-8 py-6 text-[16px] sm:text-xl transition-all duration-300 hover:scale-105 font-sans disabled:opacity-80"
          >
            {isLoading ? 'Učitavanje...' : 'Istraži'}
          </Button>
        </div>
      </div>
    </div>
  );
};
