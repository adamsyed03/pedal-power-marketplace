import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const featuredProducts = [
  {
    id: 1,
    title: "Pogon X",
    price: 58500,
    originalPrice: 63999,
    imagePath: "/ebike111.png",
    description: "Premium električni bicikl sa pametnim funkcijama, savršen za gradsku vožnju ako su vam dosadile duge gužve i potrage za parkingom",
    category: "Gradski",
    path: "/bikes/urban-explorer"
  }
];

export const FeaturedProducts = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-20 pb-16 bg-neutral-100" id="models">
      {/* Category Title */}
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-3xl font-bold text-center text-neutral-900">Naš Model</h2>
        <p className="text-lg text-neutral-600 text-center mt-2 max-w-2xl mx-auto">
          Doživite premium e-mobilnost po pristupačnoj ceni
        </p>
      </div>

      {/* Product Display */}
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {featuredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group border border-neutral-200"
              onClick={() => navigate(product.path)}
            >
              <div className="h-[180px] relative">
                <img
                  src={product.imagePath}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                  loading="lazy"
                />
              </div>
              <div className="p-4 sm:p-6 bg-neutral-50">
                <span className="text-xs sm:text-sm uppercase tracking-wider text-neutral-500">
                  {product.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-2 text-neutral-900">{product.title}</h3>
                <p className="text-sm sm:text-base text-neutral-600 mb-4">{product.description}</p>
                <div className="flex items-center gap-2 sm:gap-3 mb-4">
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {product.price.toLocaleString()} RSD
                  </p>
                  <p className="text-base sm:text-lg text-neutral-500 line-through">
                    {product.originalPrice.toLocaleString()} RSD
                  </p>
                </div>
                <Button 
                  className="w-full bg-neutral-900 text-neutral-50 hover:bg-neutral-800 py-3 sm:py-4 text-sm sm:text-base group-hover:bg-neutral-800"
                >
                  Saznaj Više
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};