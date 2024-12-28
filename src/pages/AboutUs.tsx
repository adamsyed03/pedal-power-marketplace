import React from "react";
import { Button } from "../components/ui/button";

export default function AboutUs() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-screen bg-gray-100">
        <div className="container mx-auto px-4 h-full flex items-center pt-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">About Pogon</h1>
            <p className="text-xl text-gray-600">
              Shaping the future of sustainable mobility through innovation and design excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Company Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded with a vision to revolutionize urban mobility, Pogon has been at the forefront 
                of e-bike innovation. Our commitment to sustainability and premium quality drives 
                everything we do.
              </p>
              <p className="text-lg text-gray-600">
                We believe in creating products that not only excel in performance but also contribute 
                to a more sustainable future. Each bike is crafted with precision, incorporating the 
                latest technology while maintaining our commitment to environmental responsibility.
              </p>
            </div>
            <div className="bg-gray-200 h-[400px]">
              {/* Placeholder for company image */}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Innovation</h3>
              <p className="text-gray-600">
                Pushing the boundaries of what's possible in e-bike technology and design.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Sustainability</h3>
              <p className="text-gray-600">
                Committed to environmental responsibility in every aspect of our business.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Quality</h3>
              <p className="text-gray-600">
                Uncompromising attention to detail and premium craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Have questions about Pogon? We'd love to hear from you and help you discover 
            the perfect e-bike for your needs.
          </p>
          <Button variant="default" className="bg-black text-white hover:bg-black/90">
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
} 