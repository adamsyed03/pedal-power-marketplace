import React from "react";
import { Button } from "../components/ui/button";
import { Mail, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto py-20">
          {/* Main Title with inline styling for debugging */}
          <h1 style={{ color: "#1f2937" }} className="text-4xl font-bold text-center mb-8">
            Kontaktirajte Nas
          </h1>
          
          {/* Description Text with inline styling for debugging */}
          <p style={{ color: "#1f2937" }} className="text-lg text-center mb-12">
            Javite nam se da saznate više o Pogon e-biciklima ili da razgovaramo o vašim specifičnim potrebama.
          </p>

          <div className="space-y-8">
            {/* Email Card with lighter gray background */}
            <a 
              href="mailto:adamksyed03@gmail.com"
              className="block bg-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-neutral-900" />
                </div>
                <div>
                  <div style={{ color: "#4B5563" }} className="text-sm mb-1 text-neutral-900">Email</div> {/* Light gray color */}
                  <div className="text-lg font-medium text-neutral-900">adamksyed03@gmail.com</div> {/* Dark color */}
                </div>
              </div>
            </a>

            {/* Phone Card with lighter gray background */}
            <a 
              href="tel:+38169692345"
              className="block bg-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-neutral-900" />
                </div>
                <div>
                  <div style={{ color: "#4B5563" }} className="text-sm mb-1 text-neutral-900">Telefon</div> {/* Light gray color */}
                  <div className="text-lg font-medium text-neutral-900">+381 69692345</div> {/* Dark color */}
                </div>
              </div>
            </a>
          </div>

          <div className="mt-12 text-center">
            {/* Additional Info Text with inline styling for debugging */}
            <p style={{ color: "#1f2937" }} className="text-sm">
              Naš tim je dostupan od ponedeljka do petka, 9:00 do 18:00 GMT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
