import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useLanguage } from '../context/LanguageContext';

const featuredProducts = [
  {
    id: 1,
    title: "P-Starter",
    price: "4,499rsd/week",
    originalPrice: null,
    imagePath: "/Excellent%201.png",
    description: "Premium electric bike with smart features, perfect for city riding if you're tired of long traffic jams and parking searches",
    category: "Urban",
    path: "/bikes/p-starter"
  },
  {
    id: 2,
    title: "P-Fold",
    price: "4,499rsd/week",
    originalPrice: null,
    imagePath: "/Excellent%201.png",
    description: "Premium electric bike with smart features, perfect for city riding if you're tired of long traffic jams and parking searches",
    category: "Urban",
    path: "/bikes/p-fold"
  },
  {
    id: 3,
    title: "Glide",
    price: "4,499rsd/week",
    originalPrice: null,
    imagePath: "/Excellent%201.png",
    description: "Premium electric bike with smart features, perfect for city riding if you're tired of long traffic jams and parking searches",
    category: "Urban",
    path: "/bikes/pogon-x"
  }
];

export const FeaturedProducts = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
        <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 bg-neutral-100" id="models">
      {/* Category Title */}
          <div className="container mx-auto px-6 sm:px-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-center text-neutral-900 leading-tight">{t('products.title')}</h2>
            <p className="text-base sm:text-lg text-neutral-600 text-center mt-3 max-w-2xl mx-auto leading-relaxed">
              {t('products.subtitle')}
        </p>
      </div>

      {/* Product Display */}
          <div className="container mx-auto px-4 sm:px-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 max-w-6xl mx-auto">
              {featuredProducts.map((product, index) => {
                const isBlurred = index !== featuredProducts.length - 1;
                const isDelivery = location.pathname === '/delivery';
                const isLifestyle = location.pathname === '/lifestyle';
                
                // Make card clickable to navigate to product page with source info
                const handleCardClick = () => {
                  if (!isBlurred) {
                    navigate(product.path, { 
                      state: { 
                        from: isDelivery ? 'delivery' : isLifestyle ? 'lifestyle' : null 
                      } 
                    });
                  }
                };

                return (
                <div
              key={product.id} 
                  onClick={handleCardClick}
                  className={`block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                    isBlurred
                      ? 'filter blur-sm opacity-40 cursor-default pointer-events-none select-none'
                      : 'group cursor-pointer'
                  } border border-neutral-200 w-full max-w-sm`}
            >
                  <div className="h-[208px] sm:h-[234px] relative">
                <img
                  src={product.imagePath}
                  alt={product.title}
                      className="w-full h-full object-contain p-3 sm:p-4"
                  loading="lazy"
                />
              </div>
                  <div className="p-4 sm:p-6 bg-neutral-50">
                    <span className="text-xs sm:text-sm uppercase tracking-wider text-neutral-500">
                      {t('products.category')}
                </span>
                    <h3 className="text-lg sm:text-2xl font-bold mt-2 mb-2 text-neutral-900">{product.title}</h3>
                    <p className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4 leading-relaxed">{t('products.description')}</p>
                     <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                       <p className="text-base sm:text-xl font-bold text-neutral-900">
                         {location.pathname === '/lifestyle' && !isBlurred
                           ? '179,999 RSD'
                           : location.pathname === '/delivery' && !isBlurred
                           ? '4,499 RSD/week'
                           : product.price}
                  </p>
                </div>
                <div 
                      className={`w-full bg-neutral-900 text-neutral-50 py-3 sm:py-4 text-sm sm:text-base text-center rounded-md font-medium ${
                        isBlurred ? 'opacity-60' : 'hover:bg-neutral-800 group-hover:bg-neutral-800'
                      }`}
                >
                      {t('products.learnMore')}
                    </div>
                  </div>
                </div>
              )})}
        </div>
      </div>
    </section>
  );
};