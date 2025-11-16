import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.src = '/Tara.jpg';
  }, []);

  const goToLifestyle = () => {
    navigate("/lifestyle");
  };

  const goToDelivery = () => {
    navigate("/delivery");
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
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-4 flex flex-col items-center text-center">
        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-6 text-white leading-tight px-2">
          {t('hero.title')}
        </h1>
        <p className="text-base sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-neutral-100 font-light max-w-4xl px-4 leading-relaxed">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button
            onClick={goToLifestyle}
            className="bg-white/5 text-white border border-white/30 hover:bg-white/10 hover:border-white/60 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 shadow-lg rounded-full font-semibold backdrop-blur-md w-full sm:w-auto"
          >
            {t('hero.lifestyle')}
          </Button>
          <Button
            onClick={goToDelivery}
            className="bg-white/0 text-white border border-white/40 hover:bg-white/10 hover:border-white/70 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 shadow-lg rounded-full font-semibold backdrop-blur-md w-full sm:w-auto"
          >
            {t('hero.delivery')}
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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