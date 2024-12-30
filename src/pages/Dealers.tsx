import React from "react";
import { Button } from "../components/ui/button";

export default function Dealers() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-gray-100">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">Find a Dealer</h1>
            <p className="text-xl text-gray-600">
              Locate your nearest Pogon dealer and experience our e-bikes in person.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Dealer Search</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your city"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
                    <option>5 km</option>
                    <option>10 km</option>
                    <option>25 km</option>
                    <option>50 km</option>
                  </select>
                </div>
                <Button className="w-full bg-black text-white hover:bg-black/90">
                  Search Dealers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gray-200 h-[400px] rounded-lg">
            {/* Map will be integrated here */}
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-600">Map integration coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Become a Dealer</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Interested in becoming a Pogon dealer? We're always looking for passionate partners 
            to join our network.
          </p>
          <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
} 