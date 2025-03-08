import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  const scrollToModels = () => {
    const modelsSection = document.getElementById('models');
    if (modelsSection) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = modelsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/Tara.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-neutral-900/60" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white max-w-[90vw] mx-auto">
          Doživite Budućnost E-Mobilnosti
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl text-neutral-100 font-light">
          Premium električni bicikli dizajnirani za gradske avanture i održivi transport
        </p>
        <div className="flex justify-center">
          <Button 
            onClick={scrollToModels}
            className="bg-neutral-100 text-neutral-900 hover:bg-white px-8 py-6 text-lg transition-all duration-300 shadow-lg"
          >
            Istraži Modele
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-8 h-8 text-white"
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