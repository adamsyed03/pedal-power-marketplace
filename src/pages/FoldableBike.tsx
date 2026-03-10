import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

const specs = [
  { en: "Top speed", sr: "Maksimalna brzina", value: "25km/h" },
  { en: "Range", sr: "Domet", value: "70km" },
  { en: "Power", sr: "Snaga", value: "250W" },
  { en: "Max load", sr: "Maks. nosivost", value: "110kg" },
  { en: "Charging time", sr: "Vreme punjenja", value: "5-6h" },
];

export default function FoldableBike() {
  const { language } = useLanguage();
  const isSerbian = language === "sr";

  const copy = {
    title: "Pogon Foldable",
    description: isSerbian
      ? "Kompaktni elektricni bicikl za gradsku voznju i svakodnevno kretanje."
      : "Compact electric bike for city riding and everyday movement.",
    specsTitle: isSerbian ? "Specifikacije" : "Specifications",
    priceLabel: isSerbian ? "Cena" : "Price",
    soldOut: isSerbian ? "Rasprodato" : "Sold Out",
    emailUs: isSerbian ? "Email upit" : "Email us",
    back: isSerbian ? "Nazad na pocetnu" : "Back to homepage",
  };

  return (
    <div className="min-h-screen pt-14 sm:pt-20 md:pt-24 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
          <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 sm:mb-3 text-center md:text-left">
                {copy.title}
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4 px-2 md:px-0">{copy.description}</p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 sm:mb-3">{copy.specsTitle}</h2>
              <div className="space-y-1">
                {specs.map((item) => (
                  <p key={item.en} className="text-sm sm:text-base md:text-lg text-neutral-700">
                    <strong>{isSerbian ? item.sr : item.en}:</strong> {item.value}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-center mt-4">
              <p className="text-2xl font-bold text-neutral-900">{copy.priceLabel}: 72,999 RSD</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
                <Button disabled className="bg-neutral-400 text-white py-4 px-8 text-lg font-semibold min-w-[220px] cursor-not-allowed">
                  {copy.soldOut}
                </Button>
                <a
                  href="mailto:pogonmobility@gmail.com?subject=Pogon%20Foldable%20Availability"
                  className="inline-flex items-center justify-center border border-neutral-900 text-neutral-900 hover:bg-neutral-100 py-4 px-8 text-lg font-semibold min-w-[220px] rounded-md"
                >
                  {copy.emailUs}
                </a>
              </div>
              <div>
                <Link to="/" className="text-sm text-neutral-700 hover:text-neutral-900 underline">
                  {copy.back}
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-3 order-1 md:order-2">
            <div className="bg-white rounded-xl p-2 sm:p-3 border border-neutral-200 relative overflow-hidden">
              <img
                src="/ebike111.png"
                alt="Pogon Foldable"
                className="w-full h-[240px] sm:h-[320px] md:h-[420px] object-contain"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
