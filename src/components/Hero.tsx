import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="relative min-h-[80vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 z-0" />
      <div className="container mx-auto px-4 z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Future of Urban Mobility
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Experience the perfect blend of style, technology, and sustainability
              with our premium e-bikes.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Explore Collection
            </Button>
          </div>
          <div className="relative animate-float">
            <img
              src="/placeholder.svg"
              alt="Premium E-Bike"
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};