
import React from "react";
import { Button } from "../components/ui/button";
import { DealerSearch } from "../components/DealerSearch";

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

      {/* Dealer Search Component */}
      <DealerSearch />

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
