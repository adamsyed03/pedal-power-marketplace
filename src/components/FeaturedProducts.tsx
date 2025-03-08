import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const featuredProducts = [
  {
    id: 1,
    title: "Urban Explorer X1",
    price: 450,
    imagePath: "/ebike111.png",
    description: "Premium električni bicikl sa pametnim funkcijama, savršen za gradsku vožnju i vikend avanture. Opremljen snažnim motorom i dugotrajnom baterijom.",
    category: "Gradski",
    path: "/bikes/urban-explorer"
  }
];

export const FeaturedProducts = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-24 pb-8 bg-neutral-100" id="models">
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
              <div className="h-[200px] relative">
                <img
                  src={product.imagePath}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="p-6 bg-neutral-50">
                <span className="text-sm uppercase tracking-wider text-neutral-500">
                  {product.category}
                </span>
                <h3 className="text-2xl font-bold mt-1 mb-2 text-neutral-900">{product.title}</h3>
                <p className="text-base text-neutral-600 mb-4">{product.description}</p>
                <p className="text-xl font-bold text-neutral-900 mb-4">
                  €{product.price.toLocaleString()}
                </p>
                <Button 
                  className="w-full bg-neutral-900 text-neutral-50 hover:bg-neutral-800 py-4 text-base group-hover:bg-neutral-800"
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