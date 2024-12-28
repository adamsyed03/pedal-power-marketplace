import { Benefits } from "@/components/Benefits";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Hero } from "@/components/Hero";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProducts />
      <Benefits />
    </div>
  );
};

export default Index;