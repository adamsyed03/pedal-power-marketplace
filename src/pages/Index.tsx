import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Benefits } from "@/components/Benefits";

export default function Index() {
  const location = useLocation();

  useEffect(() => {
    // Check if we should scroll to models section
    if (location.state && location.state.scrollToModels) {
      const modelsSection = document.getElementById('models');
      if (modelsSection) {
        modelsSection.scrollIntoView({ behavior: 'smooth' });
        // Clear the state so it doesn't scroll again on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <Benefits />
    </main>
  );
}