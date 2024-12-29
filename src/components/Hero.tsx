import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export const Hero = () => {
  const navigate = useNavigate();
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');

  useEffect(() => {
    const loadBackgroundImage = async () => {
      try {
        const imageUrl = 'https://zbzyvwuszullvlbatogb.supabase.co/storage/v1/object/public/product-images/Tara.jpg';
        console.log('Using direct URL:', imageUrl);
        setBackgroundUrl(imageUrl);
      } catch (error) {
        console.error('Error loading background:', error);
      }
    };

    loadBackgroundImage();
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
      <div 
        className="absolute inset-0 bg-gray-200 transition-opacity duration-500"
        style={{
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: backgroundUrl ? 1 : 0,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white max-w-[90vw] mx-auto">
          Experience the Future of E-Mobility
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl text-white/95 font-light">
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