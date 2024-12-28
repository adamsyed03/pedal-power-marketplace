import { Button } from "@/components/ui/button";

const benefits = [
  {
    title: "Future Mobility",
    description: "Shaping tomorrow's mobility with premium e-bikes, leasing and sharing offers. Together, we take responsibility for a future worth living.",
    image: "/placeholder.svg",
    link: "Learn More",
  },
  {
    title: "Sustainable Innovation",
    description: "Our commitment to sustainability goes beyond eco-friendly transportation. We use recycled materials and renewable energy in our production.",
    image: "/placeholder.svg",
    link: "Our Impact",
  },
  {
    title: "Connected Experience",
    description: "Smart features and digital integration for a better riding experience. Track your rides, manage your bike, and stay connected.",
    image: "/placeholder.svg",
    link: "Discover Technology",
  },
];

export const Benefits = () => {
  return (
    <section className="py-16">
      {/* Main Title */}
      <div className="container mx-auto px-4 mb-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Why Choose Pogon</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the perfect blend of innovation, sustainability, and premium quality
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 gap-16">
        {benefits.map((benefit, index) => (
          <div
            key={benefit.title}
            className={`flex flex-col md:flex-row items-stretch ${
              index % 2 === 0 ? "" : "md:flex-row-reverse"
            }`}
          >
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-[500px] relative bg-gray-100">
              <img
                src={benefit.image}
                alt={benefit.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-white">
              <h3 className="text-3xl font-bold mb-6">{benefit.title}</h3>
              <p className="text-lg text-gray-600 mb-8">
                {benefit.description}
              </p>
              <div>
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  {benefit.link}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};