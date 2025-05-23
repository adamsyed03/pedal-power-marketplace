import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const featuredProducts = [
  {
    id: 1,
    title: "Pogon X",
    price: 58499,
    originalPrice: 68499,  // Updated from 47411/59411
    imagePath: "/ebike111.png",
    description: "Premium električni bicikl sa pametnim funkcijama, savršen za gradsku vožnju ako su vam dosadile duge gužve i potrage za parkingom",
    category: "Gradski",
    path: "/bikes/pogon-x"
  }
];

export const FeaturedProducts = () => {
  return (
    <section className="pt-16 sm:pt-20 pb-16 bg-neutral-100" id="models">
      {/* Category Title */}
      <div className="container mx-auto px-4 mb-6 sm:mb-8">
        <h2 className="text-[18px] sm:text-3xl font-bold text-center text-neutral-900">Naš Model</h2>
        <p className="text-[14px] sm:text-lg text-neutral-600 text-center mt-2 max-w-2xl mx-auto">
          Doživite premium e-mobilnost po pristupačnoj ceni
        </p>
      </div>

      {/* Product Display */}
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-2xl mx-auto">
          {featuredProducts.map((product) => (
            <Link 
              key={product.id} 
              to={product.path}
              className="block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group border border-neutral-200"
            >
              <div className="h-[140px] sm:h-[180px] relative">
                <img
                  src={product.imagePath}
                  alt={product.title}
                  className="w-full h-full object-contain p-2 sm:p-4"
                  loading="lazy"
                />
              </div>
              <div className="p-3 sm:p-6 bg-neutral-50">
                <span className="text-[8px] sm:text-sm uppercase tracking-wider text-neutral-500">
                  {product.category}
                </span>
                <h3 className="text-[16px] sm:text-2xl font-bold mt-1 mb-1 sm:mb-2 text-neutral-900">{product.title}</h3>
                <p className="text-[12px] sm:text-base text-neutral-600 mb-2 sm:mb-4">{product.description}</p>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                  <p className="text-[14px] sm:text-xl font-bold text-neutral-900">
                    {product.price.toLocaleString()} RSD
                  </p>
                  <p className="text-[12px] sm:text-lg text-neutral-500 line-through">
                    {product.originalPrice.toLocaleString()} RSD
                  </p>
                </div>
                <div 
                  className="w-full bg-neutral-900 text-neutral-50 hover:bg-neutral-800 py-2 sm:py-4 text-[12px] sm:text-base group-hover:bg-neutral-800 text-center rounded-md"
                >
                  Saznaj Više
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};