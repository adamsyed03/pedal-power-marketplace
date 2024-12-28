import React from "react";
import { Button } from "../components/ui/button";
import { Mail, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto py-20">
          <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
          <p className="text-lg text-gray-600 text-center mb-12">
            Get in touch with us to learn more about Pogon e-bikes or discuss your specific needs.
          </p>

          <div className="space-y-8">
            {/* Email Card */}
            <a 
              href="mailto:ctinvestmentswork@gmail.com"
              className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email</div>
                  <div className="text-lg font-medium">ctinvestmentswork@gmail.com</div>
                </div>
              </div>
            </a>

            {/* Phone Card */}
            <a 
              href="tel:+447403113911"
              className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Phone</div>
                  <div className="text-lg font-medium">+44 7403 113911</div>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-12 text-center text-gray-600">
            <p className="text-sm">
              Our team is available Monday through Friday, 9:00 AM to 6:00 PM GMT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 