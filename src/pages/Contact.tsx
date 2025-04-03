import React from "react";
import { Button } from "../components/ui/button";
import { Mail, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto py-20">
          {/* Main Title - Set to text-neutral-900 */}
          <h1 className="text-4xl font-bold text-center mb-8 text-neutral-900">Kontaktirajte Nas</h1>
          
          {/* Description Text - Set to text-neutral-900 */}
          <p className="text-lg text-neutral-900 text-center mb-12">
            Javite nam se da saznate više o Pogon e-biciklima ili da razgovaramo o vašim specifičnim potrebama.
          </p>

          <div className="space-y-8">
            {/* Email Card with Updated Text Color */}
            <a 
              href="mailto:ctinvestmentswork@gmail.com"
              className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-neutral-900" />
                </div>
                <div>
                  <div className="text-sm text-neutral-900 mb-1">Email</div> {/* Updated to text-neutral-900 */}
                  <div className="text-lg font-medium text-neutral-900">ctinvestmentswork@gmail.com</div> {/* Updated to text-neutral-900 */}
                </div>
              </div>
            </a>

            {/* Phone Card with Updated Text Color */}
            <a 
              href="tel:+38169692345"
              className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-black/5 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-neutral-900" />
                </div>
                <div>
                  <div className="text-sm text-neutral-900 mb-1">Telefon</div> {/* Updated to text-neutral-900 */}
                  <div className="text-lg font-medium text-neutral-900">+381 69692345</div> {/* Updated to text-neutral-900 */}
                </div>
              </div>
            </a>
          </div>

          <div className="mt-12 text-center">
            {/* Additional Info Text - Set to text-neutral-900 */}
            <p className="text-sm text-neutral-900">
              Naš tim je dostupan od ponedeljka do petka, 9:00 do 18:00 GMT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
