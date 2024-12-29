import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/Tara.jpg";
    img.onload = () => setImageLoaded(true);
  }, []);

  const scrollToModels = () => {
    const modelsSection = document.getElementById('models');
    if (modelsSection) {
      modelsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/Tara.jpg"
          alt="Hero Background"
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Loading Placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 max-w-5xl text-white drop-shadow-lg">
          Experience the Future 
          <span className="block mt-2">of E-Mobility</span>
        </h1>
        <p className="text-xl md:text-3xl mb-12 max-w-3xl text-white/95 font-light drop-shadow">
          Premium electric bikes designed for urban adventures and sustainable commuting
        </p>
        <div className="flex justify-center">
          <Button 
            onClick={scrollToModels}
            className="bg-white/90 text-black hover:bg-white px-8 py-6 text-lg transition-all duration-300 shadow-lg"
          >
            Explore Models
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-8 h-8 text-white/80"
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