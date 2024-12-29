import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const featuredProducts = [
  {
    id: 1,
    title: "Urban Explorer X1",
    price: 2499,
    image: "/ebike111.png?w=600",
    description: "Sleek city commuter with 60-mile range and integrated smart features.",
    category: "Urban",
    path: "/bikes/urban-explorer"
  },
  {
    id: 2,
    title: "Mountain Master Pro",
    price: 3299,
    image: "/ebike111.png?w=600",
    description: "High-performance e-MTB with dual suspension and powerful drivetrain.",
    category: "Mountain",
    path: "/bikes/mountain-master"
  },
  {
    id: 3,
    title: "City Cruiser Elite",
    price: 1999,
    image: "/ebike111.png?w=600",
    description: "Comfortable urban e-bike with elegant design and smooth power delivery.",
    category: "City",
    path: "/bikes/city-cruiser"
  },
];

export const FeaturedProducts = () => {
  const navigate = useNavigate();

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First Row - Large Featured Product */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="grid md:grid-cols-2 items-center">
                <div className="h-[400px] relative">
                  <img
                    src={featuredProducts[0].image}
                    alt={featuredProducts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12">
                  <span className="text-sm uppercase tracking-wider text-gray-500">
                    {featuredProducts[0].category}
                  </span>
                  <h3 className="text-3xl font-bold mt-2 mb-4">{featuredProducts[0].title}</h3>
                  <p className="text-base text-gray-600 mb-6 line-clamp-2">{featuredProducts[0].description}</p>
                  <p className="text-2xl font-bold text-primary mb-8">
                    Starting from ${featuredProducts[0].price.toLocaleString()}
                  </p>
                  <Button 
                    onClick={() => navigate(featuredProducts[0].path)}
                    className="w-full md:w-auto"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row - Two Smaller Products */}
          {featuredProducts.slice(1).map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="h-[300px] relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
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
                  onClick={() => navigate(product.path)}
                  className="w-full"
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