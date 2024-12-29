import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  const scrollToModels = () => {
    const modelsSection = document.getElementById('models');
    if (modelsSection) {
      modelsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen bg-gray-50">
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-gray-900 max-w-[90vw] mx-auto">
          Experience the Future of E-Mobility
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl text-gray-600 font-light">
          Premium electric bikes designed for urban adventures and sustainable commuting
        </p>
        <div className="flex justify-center">
          <Button 
            onClick={scrollToModels}
            className="bg-black text-white hover:bg-black/90 px-8 py-6 text-lg transition-all duration-300 shadow-lg"
          >
            Explore Models
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-8 h-8 text-gray-400"
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