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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                  className="w-full bg-black text-white hover:bg-black/90"
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