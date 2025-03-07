import { Button } from "@/components/ui/button";

const benefits = [
  {
    title: "Mobilnost Budućnosti",
    description: "Oblikujemo mobilnost sutrašnjice sa premium e-biciklima, lizingom i ponudama za deljenje. Zajedno preuzimamo odgovornost za budućnost vrednu življenja.",
    image: "/placeholder.svg",
    link: "Saznaj Više",
  },
  {
    title: "Održiva Inovacija",
    description: "Naša posvećenost održivosti prevazilazi ekološki transport. Koristimo reciklirane materijale i obnovljivu energiju u našoj proizvodnji.",
    image: "/placeholder.svg",
    link: "Naš Uticaj",
  },
  {
    title: "Povezano Iskustvo",
    description: "Pametne funkcije i digitalna integracija za bolje iskustvo vožnje. Pratite svoje vožnje, upravljajte svojim biciklom i ostanite povezani.",
    image: "/placeholder.svg",
    link: "Otkrijte Tehnologiju",
  },
];

export const Benefits = () => {
  return (
    <section className="py-16">
      {/* Main Title */}
      <div className="container mx-auto px-4 mb-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Zašto Izabrati Pogon</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            <div className="w-full md:w-1/2 h-[500px] relative bg-gray-100">
              <img
                src={benefit.image}
                alt={benefit.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-white">
              <h3 className="text-3xl font-bold mb-6">{benefit.title}</h3>
              <p className="text-lg text-gray-600 mb-8">
                {benefit.description}
              </p>
              <div>
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  {benefit.link}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};