import React from "react";

export default function AboutUs() {
  return (
    <div className="min-h-screen pt-20 bg-neutral-50 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-neutral-100 rounded-2xl p-4 sm:p-8 shadow-sm">
          <h1 className="text-[20px] sm:text-3xl font-bold mb-4 sm:mb-8 text-neutral-900">O Nama</h1>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Introduction */}
            <p className="text-[14px] sm:text-base font-bold text-neutral-900 leading-relaxed">
              Pogon je brend električnih bicikala nove generacije iz Srbije, namenjen ljudima koji cene svoje vreme, novac i slobodu kretanja.
            </p>

            {/* Main Description */}
            <p className="text-[14px] sm:text-base text-neutral-900 leading-relaxed">
              Ne prodajemo sprave za vežbanje — mi redefinišemo šta znači voziti bicikl danas. Za nas, to nije samo rekreacija, već najpametniji način da stigneš od tačke A do tačke B. U gradovima prepunim gužvi, stresa i rastućih troškova, Pogon nudi čisto, pristupačno i efikasno rešenje.
            </p>

            {/* Origin Story */}
            <div className="space-y-2">
              <p className="text-[14px] sm:text-base text-neutral-700 leading-relaxed">
                Osnovani smo od strane mladog tima koji je odrastao u istom urbanom haosu, i sve je krenulo od jednog jednostavnog pitanja:
              </p>
              <p className="text-[14px] sm:text-base font-bold text-neutral-900 leading-relaxed">
                Zašto gubiti vreme stojeći u mestu, kada možeš da ideš napred — brže, čistije i pametnije?
              </p>
            </div>

            {/* Product Philosophy */}
            <p className="text-[14px] sm:text-base font-bold text-neutral-900 leading-relaxed">
              Svaki Pogon e-bicikl je dizajniran da se lako uklopi u tvoj svakodnevni život — bilo da ideš na posao, obavljaš obaveze ili jednostavno želiš da stigneš bez znoja i gubljenja vremena. Napravljen za stvarni svet. Osmišljen da pojednostavi. Dizajniran da promeni način na koji razmišljaš o svakodnevnoj vožnji.
            </p>

            {/* Tagline */}
            <p className="text-[16px] sm:text-xl font-bold text-neutral-900 text-center pt-2 sm:pt-4">
              Pogon – pokreni se pametno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 