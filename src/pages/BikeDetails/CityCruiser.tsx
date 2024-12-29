import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CityCruiser() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gray-100">
        <div className="absolute inset-0">
          <img
            src="/ebike111.png?w=1200"
            alt="City Cruiser Elite"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4">City Cruiser Elite</h1>
            <p className="text-xl opacity-90">
              Elegance meets efficiency for urban mobility
            </p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Technical Specifications</h2>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900">Range</h3>
                  <p className="text-gray-600">Up to 50 miles on a single charge</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900">Motor</h3>
                  <p className="text-gray-600">350W rear hub motor with smooth power delivery</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900">Battery</h3>
                  <p className="text-gray-600">36V 13Ah lithium-ion battery, integrated design</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900">Charging Time</h3>
                  <p className="text-gray-600">3-5 hours from empty to full</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900">Frame</h3>
                  <p className="text-gray-600">Dutch-style step-through aluminum frame</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Key Features</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Comfortable upright riding position</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Integrated front and rear lights</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">7-speed Shimano gears with chain guard</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Front suspension fork for smooth rides</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Experience Urban Elegance</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us to learn more about the City Cruiser Elite and schedule a test ride.
          </p>
          <Button 
            onClick={() => navigate('/contact')}
            className="bg-black text-white hover:bg-black/90 px-8 py-6 text-lg"
          >
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
} 