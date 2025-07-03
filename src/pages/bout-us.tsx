import React, { useEffect, useState } from "react";
import { useLanguage } from '../context/LanguageContext';

// Use the AboutUsVid that's specifically for this page
const VIDEO_URL = "https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/AboutUsVid.mp4";

export default function AboutUs() {
  // Get the translation function
  const { t } = useLanguage();
  
  // Add loading state for the video
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isVideoError, setIsVideoError] = useState(false);

  // Fix the navigation bar position
  useEffect(() => {
    // Target the navigation bar
    const navBar = document.querySelector('nav') || 
                  document.querySelector('header') || 
                  document.querySelector('.navigation');
    
    if (navBar instanceof HTMLElement) {
      // Move the navigation bar to the very top
      navBar.style.position = 'fixed';
      navBar.style.top = '0';
      navBar.style.left = '0';
      navBar.style.right = '0';
      navBar.style.zIndex = '1000';
      
      // Remove any padding or margin that might be pushing it down
      navBar.style.marginTop = '0';
      navBar.style.paddingTop = '0';
    }
    
    // Remove any black edges at the bottom of the page
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Allow scrolling to see the POGON at the bottom
    document.body.style.overflow = 'auto';
    
    // Ensure the video covers the entire viewport
    const videoContainers = document.querySelectorAll('.video-container');
    videoContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.style.minHeight = '100vh';
        container.style.minWidth = '100vw';
      }
    });
  }, []);

  // Handle video loading events
  const handleVideoLoaded = () => {
    setIsVideoLoading(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setIsVideoError(true);
  };

  return (
    <div className="relative min-h-screen">
      {/* Video Background with loading state */}
      <div className="fixed inset-0 z-0 video-container bg-black">
        {/* Show loading indicator while video is loading */}
        {isVideoLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-xl">{t('loading')}</div>
          </div>
        )}
        
        {/* Show fallback if video fails to load */}
        {isVideoError && (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
        )}
        
        {/* Preload the video with metadata to start loading faster */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover scale-105 ${
            isVideoLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-500`}
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
        >
          <source src={VIDEO_URL} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay to make text more readable */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content - keeping the same position */}
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8 text-white mt-24">
          {/* Keeping the same margin */}
          <div className="max-w-3xl mx-auto bg-black/60 p-8 rounded-lg backdrop-blur-sm">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">{t('about.title')}</h1>
            
            <div className="space-y-6 text-lg">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <p>{t('about.p3')}</p>
              <p>{t('about.p4')}</p>
              <p className="font-bold text-xl">{t('about.p5')}</p>
            </div>
          </div>
          
          {/* Big POGON at the bottom */}
          <div className="mt-10 mb-12 text-center">
            <h1 className="text-[150px] md:text-[200px] font-bold text-white opacity-30 select-none tracking-widest">
              POGON
            </h1>
          </div>
        </main>
      </div>
    </div>
  );
}