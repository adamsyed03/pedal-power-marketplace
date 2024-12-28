import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";

const featuredProducts = [
  {
    id: 1,
    title: "Urban Explorer X1",
    price: 2499,
    image: "/ebike111.png",
    description: "Perfect for city commuting with a range of 60 miles.",
    category: "Urban",
  },
  {
    id: 2,
    title: "Mountain Master Pro",
    price: 3299,
    image: "/ebike111.png",
    description: "Conquer any terrain with dual suspension and powerful motor.",
    category: "Mountain",
  },
  {
    id: 3,
    title: "City Cruiser Elite",
    price: 1999,
    image: "/ebike111.png",
    description: "Elegant design meets comfort for daily urban rides.",
    category: "City",
  },
];

export const FeaturedProducts = () => {
  return (
    <section className="py-16" id="models">
      {/* Category Title */}
      <div className="container mx-auto px-4 mb-16">
        <h2 className="text-4xl font-bold text-center">Models</h2>
        <p className="text-xl text-gray-600 text-center mt-4 max-w-2xl mx-auto">
          Discover the perfect e-bike for your lifestyle
        </p>
      </div>

      {/* Product Categories */}
      {featuredProducts.map((product, index) => (
        <div
          key={product.id}
          className={`flex flex-col md:flex-row items-center ${
            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
          } mb-16`}
        >
          {/* Image Section */}
          <div className="w-full md:w-1/2 h-[600px] relative">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="w-full md:w-1/2 p-8 md:p-16 bg-gray-50">
            <span className="text-sm uppercase tracking-wider text-gray-500">
              {product.category}
            </span>
            <h3 className="text-3xl font-bold mt-2 mb-4">{product.title}</h3>
            <p className="text-lg text-gray-600 mb-6">{product.description}</p>
            <p className="text-2xl font-bold text-primary mb-8">
              Starting from ${product.price.toLocaleString()}
            </p>
            <div className="flex gap-4">
              <Button variant="default">Learn More</Button>
              <Button variant="outline">Configure Now</Button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};