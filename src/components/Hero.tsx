import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.src = '/Tara.jpg';
  }, []);

  const scrollToModels = () => {
    const modelsSection = document.getElementById('models');
    if (modelsSection) {
      const headerOffset = 20;
      const elementPosition = modelsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
        style={{
          backgroundImage: `url('/Tara.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-neutral-900/60" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-[18px] sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white whitespace-nowrap">
          Pridruži se Revoluciji E-mobilnosti
        </h1>
        <p className="text-[14px] sm:text-xl lg:text-2xl mb-6 sm:mb-10 text-neutral-100 font-light">
          Premium električni bicikli dizajnirani za čistiji, jeftiniji i pametniji prevoz
        </p>
        <Button 
          onClick={scrollToModels}
          className="bg-neutral-100 text-neutral-900 hover:bg-white px-4 sm:px-10 py-2 sm:py-6 text-[14px] sm:text-lg transition-all duration-300 shadow-lg"
        >
          Istraži Model
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </div>
  );
};