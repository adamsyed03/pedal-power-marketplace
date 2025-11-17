import React, { useEffect } from "react";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Delivery() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      // Small delay to ensure the page has rendered
      const timer = setTimeout(() => {
        const availableModel = document.getElementById('available-model');
        if (availableModel) {
          const headerOffset = 80; // Account for fixed header
          const elementPosition = availableModel.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  return (
    <main className="pt-6 pb-12 bg-neutral-50">
      <FeaturedProducts />
    </main>
  );
}


