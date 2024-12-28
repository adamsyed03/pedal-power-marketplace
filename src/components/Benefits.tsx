import { Battery, Bike, Zap } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Powerful Motor",
    description: "State-of-the-art electric motor for smooth acceleration",
  },
  {
    icon: Battery,
    title: "Long Range",
    description: "Up to 60 miles on a single charge for worry-free riding",
  },
  {
    icon: Bike,
    title: "Premium Design",
    description: "Sleek, modern aesthetics that turn heads",
  },
];

export const Benefits = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};