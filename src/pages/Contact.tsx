import React from "react";
import { Mail, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-14 sm:pt-16 md:pt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl py-8 sm:py-12 md:py-20">
          <h1 className="mb-4 text-center text-2xl font-bold text-[#1f2937] sm:mb-6 sm:text-3xl md:mb-8 md:text-4xl">Kontakt</h1>

          <p className="mb-8 px-2 text-center text-base text-[#1f2937] sm:mb-10 sm:text-lg md:mb-12">
            Piši nam ili pozovi ako želiš više informacija o Pogon modelima. Tu smo da pomognemo oko izbora, kupovine i svega što te zanima.
          </p>

          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <a
              href="mailto:pogonmobility@gmail.com"
              className="block rounded-xl bg-neutral-200 p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5 md:p-6"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 rounded-lg bg-black/5 p-2 sm:p-3">
                  <Mail className="h-5 w-5 text-neutral-900 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-xs text-neutral-900 sm:text-sm">Email</div>
                  <div className="break-all text-sm font-medium text-neutral-900 sm:text-base md:text-lg">pogonmobility@gmail.com</div>
                </div>
              </div>
            </a>

            <a
              href="tel:+381631505003"
              className="block rounded-xl bg-neutral-200 p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5 md:p-6"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 rounded-lg bg-black/5 p-2 sm:p-3">
                  <Phone className="h-5 w-5 text-neutral-900 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-xs text-neutral-900 sm:text-sm">Telefon</div>
                  <div className="text-sm font-medium text-neutral-900 sm:text-base md:text-lg">+381 63 1505003</div>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-8 px-2 text-center sm:mt-10 md:mt-12">
            <p className="text-xs text-[#1f2937] sm:text-sm">Dostupni smo radnim danima od 9 do 18h.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
