import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useLanguage } from '../context/LanguageContext';

const featuredProducts = [
  {
    id: 1,
    title: "P-Starter",
    price: "4,999rsd/week",
    originalPrice: null,
    imagePath: "/ebike111.png",
    description: "Premium electric bike with smart features, perfect for city riding if you're tired of long traffic jams and parking searches",
    category: "Urban",
    path: "/bikes/p-starter"
  },
  {
    id: 2,
    title: "P-Fold",
    price: "4,999rsd/week",
    originalPrice: null,
    imagePath: "/ebike111.png",
    description: "Premium electric bike with smart features, perfect for city riding if you're tired of long traffic jams and parking searches",
    category: "Urban",
    path: "/bikes/p-fold"
  },
  {
    id: 3,
    title: "P-Comfort",
    price: "4,999rsd/week",
    originalPrice: null,
    imagePath: "/ebike111.png",
    description: "Premium electric bike with smart features, perfect for city riding if you're tired of long traffic jams and parking searches",
    category: "Urban",
    path: "/bikes/p-comfort"
  }
];

export const FeaturedProducts = () => {
  const { t } = useLanguage();
  
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
              {featuredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  to={product.path}
                  className="block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group border border-neutral-200 w-full max-w-sm"
                >
                  <div className="h-[160px] sm:h-[180px] relative">
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
                        {product.price}
                      </p>
                    </div>
                    <div 
                      className="w-full bg-neutral-900 text-neutral-50 hover:bg-neutral-800 py-3 sm:py-4 text-sm sm:text-base group-hover:bg-neutral-800 text-center rounded-md font-medium"
                    >
                      {t('products.learnMore')}
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};