import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const featuredProducts = [
  {
    id: 1,
    title: "Urban Explorer X1",
    price: 2499,
    imagePath: "ebike111.png",
    description: "Sleek city commuter with 60-mile range and integrated smart features.",
    category: "Urban",
    path: "/bikes/urban-explorer"
  },
  {
    id: 2,
    title: "Mountain Master Pro",
    price: 3299,
    imagePath: "ebike111.png",
    description: "High-performance e-MTB with dual suspension and powerful drivetrain.",
    category: "Mountain",
    path: "/bikes/mountain-master"
  },
  {
    id: 3,
    title: "City Cruiser Elite",
    price: 1999,
    imagePath: "ebike111.png",
    description: "Comfortable urban e-bike with elegant design and smooth power delivery.",
    category: "City",
    path: "/bikes/city-cruiser"
  },
];

export const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadImages = async () => {
      try {
        const imageUrl = 'https://zbzyvwuszullvlbatogb.supabase.co/storage/v1/object/public/product-images/ebike111.png';
        console.log('Using direct URL:', imageUrl);
        
        const urls: { [key: string]: string } = {};
        for (const product of featuredProducts) {
          urls[product.imagePath] = imageUrl;
        }
        
        setImageUrls(urls);
      } catch (error) {
        console.error('Error loading product images:', error);
      }
    };

    loadImages();
  }, []);

  return (
    <section className="py-16 bg-white" id="models">
      {/* Category Title */}
      <div className="container mx-auto px-4 mb-16">
        <h2 className="text-4xl font-bold text-center">Our Models</h2>
        <p className="text-lg text-gray-600 text-center mt-4 max-w-2xl mx-auto">
          Discover the perfect e-bike for your lifestyle
        </p>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              onClick={() => navigate(product.path)}
            >
              <div className="h-[300px] relative">
                {imageUrls[product.imagePath] && (
                  <img
                    src={imageUrls[product.imagePath]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-8">
                <span className="text-sm uppercase tracking-wider text-gray-500">
                  {product.category}
                </span>
                <h3 className="text-2xl font-bold mt-2 mb-4">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-6 line-clamp-2">{product.description}</p>
                <p className="text-xl font-bold text-primary mb-8">
                  Starting from ${product.price.toLocaleString()}
                </p>
                <Button 
                  className="w-full bg-black text-white hover:bg-black/90 group-hover:bg-black/80"
                >
                  Learn More
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};