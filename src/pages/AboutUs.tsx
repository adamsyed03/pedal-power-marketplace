import React from "react";
import { Button } from "@/components/ui/button";

export default function AboutUs() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-screen bg-gray-100">
        <div className="container mx-auto px-4 h-full flex items-center pt-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">O Pogonu</h1>
            <p className="text-xl text-gray-600">
              Oblikujemo budućnost održive mobilnosti kroz inovacije i vrhunski dizajn.
            </p>
          </div>
        </div>
      </div>

      {/* Company Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Naša Priča</h2>
              <p className="text-lg text-gray-600 mb-6">
                Osnovani sa vizijom revolucionisanja gradske mobilnosti, Pogon je bio na čelu 
                inovacija e-bicikala. Naša posvećenost održivosti i vrhunskom kvalitetu pokreće 
                sve što radimo.
              </p>
              <p className="text-lg text-gray-600">
                Verujemo u stvaranje proizvoda koji ne samo da se ističu po performansama, već 
                i doprinose održivijoj budućnosti. Svaki bicikl je izrađen sa preciznošću, 
                uključujući najnoviju tehnologiju uz održavanje naše posvećenosti ekološkoj odgovornosti.
              </p>
            </div>
            <div className="bg-gray-200 h-[400px]">
              {/* Placeholder for company image */}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Naše Vrednosti</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Inovacija</h3>
              <p className="text-gray-600">
                Pomeramo granice mogućeg u tehnologiji i dizajnu e-bicikala.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Održivost</h3>
              <p className="text-gray-600">
                Posvećeni ekološkoj odgovornosti u svakom aspektu našeg poslovanja.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Kvalitet</h3>
              <p className="text-gray-600">
                Beskompromisna pažnja prema detaljima i vrhunska izrada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Kontaktirajte Nas</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Imate pitanja o Pogonu? Rado ćemo vas čuti i pomoći vam da pronađete 
            savršen e-bicikl za vaše potrebe.
          </p>
          <Button variant="default" className="bg-black text-white hover:bg-black/90">
            Kontaktirajte Nas
          </Button>
        </div>
      </section>
    </div>
  );
} 