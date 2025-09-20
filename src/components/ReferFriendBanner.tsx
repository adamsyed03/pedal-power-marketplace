import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function ReferFriendBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLearnMore = () => {
    navigate('/join-network');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gray-200 py-3 px-4 relative z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side with icon and text */}
        <div className="flex items-center">
          {/* Megaphone Icon */}
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <svg 
              className="w-5 h-5 text-black" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </div>
          
          {/* Text */}
          <span className="text-black font-medium text-sm md:text-base">
            {t('referBanner.text')}
          </span>
        </div>

        {/* Right side with button and close */}
        <div className="flex items-center space-x-3">
          {/* Learn More Button */}
          <button
            onClick={handleLearnMore}
            className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {t('referBanner.learnMore')}
          </button>
          
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1"
            aria-label="Close banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
