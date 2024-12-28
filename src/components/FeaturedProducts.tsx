import { ProductCard } from "./ProductCard";

const featuredProducts = [
  {
    id: 1,
    title: "Urban Explorer X1",
    price: 2499,
    image: "/placeholder.svg",
    description: "Perfect for city commuting with a range of 60 miles.",
  },
  {
    id: 2,
    title: "Mountain Master Pro",
    price: 3299,
    image: "/placeholder.svg",
    description: "Conquer any terrain with dual suspension and powerful motor.",
  },
  {
    id: 3,
    title: "City Cruiser Elite",
    price: 1999,
    image: "/placeholder.svg",
    description: "Elegant design meets comfort for daily urban rides.",
  },
];

export const FeaturedProducts = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Featured Models</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};