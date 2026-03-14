import React from "react";

export default function AboutUs() {
  return (
    <div className="flex min-h-screen items-center bg-neutral-50 pt-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-2xl bg-neutral-100 p-4 shadow-sm sm:p-8">
          <h1 className="mb-4 text-[20px] font-bold text-neutral-900 sm:mb-8 sm:text-3xl">O nama</h1>

          <div className="space-y-4 sm:space-y-6">
            <p className="text-[14px] font-bold leading-relaxed text-neutral-900 sm:text-base">
              Pogon je domaći brend električnih bicikala za ljude koji vole da se kroz grad kreću pametnije, brže i bez viška cimanja.
            </p>

            <p className="text-[14px] leading-relaxed text-neutral-900 sm:text-base">
              Ne pravimo bicikle samo da lepo izgledaju. Pravimo ih da rešavaju realne gradske probleme: gužvu, parking, tempo dana i trošak
              svakodnevnog kretanja.
            </p>

            <div className="space-y-2">
              <p className="text-[14px] leading-relaxed text-neutral-700 sm:text-base">
                Nastali smo iz istog urbanog haosa koji svi dobro poznajemo, uz jednostavnu ideju:
              </p>
              <p className="text-[14px] font-bold leading-relaxed text-neutral-900 sm:text-base">
                ako već moraš kroz grad svaki dan, zašto to ne bi radio lakše, čistije i sa više stila?
              </p>
            </div>

            <p className="text-[14px] font-bold leading-relaxed text-neutral-900 sm:text-base">
              Svaki Pogon model napravljen je da se uklopi u stvaran život. Za posao, obaveze, sastanke, trening ili brz odlazak preko grada.
              Bez komplikacije. Bez viška buke. Samo dobar proizvod koji radi.
            </p>

            <p className="pt-2 text-center text-[16px] font-bold text-neutral-900 sm:pt-4 sm:text-xl">Pogon. Grad, ali po tvom.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
