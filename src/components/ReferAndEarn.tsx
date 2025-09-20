import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const ReferAndEarn = () => {
  const { t } = useLanguage();

  return (
    <section id="refer-earn" className="py-12 sm:py-16 bg-neutral-900 text-white">
      <div className="container mx-auto px-6 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Image */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] bg-neutral-800 rounded-lg overflow-hidden order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H17c-.8 0-1.54.37-2.01.99L12.5 12H10v10h10z"/>
                  </svg>
                </div>
                <p className="text-neutral-300 text-base sm:text-lg">Riders with Pogon bikes</p>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {t('referEarn.title')}
            </h2>
            
            <div className="space-y-4">
              <p className="text-lg sm:text-xl text-neutral-300 leading-relaxed">
                {t('referEarn.subtitle')}
              </p>
              
              <p className="text-base sm:text-lg text-neutral-400">
                {t('referEarn.description')}
              </p>
              
              <p className="text-sm text-neutral-500 italic">
                {t('referEarn.disclaimer')}
              </p>
            </div>

            {/* CTA Button */}
            <button className="bg-yellow-400 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-yellow-300 transition-colors shadow-lg w-full sm:w-auto">
              {t('referEarn.cta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
