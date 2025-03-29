import { Button } from "@/components/ui/button";

const benefits = [
  {
    title: "Zdravlje",
    description: "Zamislite da svakog dana udišete vazduh koji ozbiljno narušava vaše zdravlje — jer to se već dešava. Beograd je među najzagađenijim prestonicama Evrope, sa prosečnom godišnjom koncentracijom PM2.5 čestica od 23,3 µg/m³. Te čestice ulaze duboko u pluća i povećavaju rizik od astme, srčanih bolesti i čak prerane smrti. Pogon nudi rešenje: tihi, električni bicikl koji ne zagađuje i pomaže da zajedno pročistimo vazduh koji dišemo.",
    source: "IQAir, 2023",
    image: "/health.jpg.png"
  },
  {
    title: "Vreme",
    description: "U Beogradu svakog dana potrošimo skoro 40 minuta u prevozu — često u haosu, nervozi i zastoju. To je više od 10 dana godišnje izgubljenih u saobraćaju. Umesto da stojite u koloni, mogli biste se kretati lako, brzo i direktno kroz grad uz pomoć Pogona — e-bicikla koji vas vodi bez stresa, kad god i gde god poželite.",
    source: "Numbeo, 2023",
    image: "/time.jpg.jpg"
  },
  {
    title: "Ekonomske Prednosti",
    description: "Od hleba do goriva — sve poskupljuje. Inflacija u Srbiji je u 2023. godini dostigla dvocifrene vrednosti, pri čemu su cene osnovnih proizvoda i usluga skočile i do 20% u nekim sektorima. Troškovi prevoza postaju sve veći deo kućnog budžeta. Pogon je odgovor na svakodnevni pritisak na novčanik: jednom kupite, a vozite bez goriva, registracije, servisa ili parkinga.",
    source: "Republički zavod za statistiku, 2023",
    image: "/economy.jpg.png"
  }
];

export const Benefits = () => {
  return (
    <section className="py-16">
      {/* Main Title */}
      <div className="container mx-auto px-4 mb-16 text-center">
        <h2 className="text-[18px] sm:text-4xl font-bold mb-4">Zašto Izabrati Pogon</h2>
        <p className="text-[14px] sm:text-xl text-gray-600 max-w-3xl mx-auto">
          Doživite savršen spoj inovacije, održivosti i vrhunskog kvaliteta
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 gap-16">
        {benefits.map((benefit, index) => (
          <div
            key={benefit.title}
            className={`flex flex-col md:flex-row items-stretch ${
              index % 2 === 0 ? "" : "md:flex-row-reverse"
            }`}
          >
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-[500px] relative bg-gray-100 overflow-hidden">
              <img
                src={benefit.image}
                alt={benefit.title}
                className="w-full h-full object-contain scale-90"
              />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-white">
              <h3 className="text-[16px] sm:text-3xl font-bold mb-6">{benefit.title}</h3>
              <p className="text-[12px] sm:text-lg text-gray-600 mb-4">
                {benefit.description}
              </p>
              <p className="text-[10px] sm:text-sm text-gray-500 italic">
                Izvor: {benefit.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};