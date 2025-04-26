import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Use a debug flag to show extra information
const DEBUG = true;
// Temporarily use the tara-nature video that we know works
const VIDEO_URL = "https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara-nature.mp4";
// const VIDEO_URL = "https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/AboutUsVid.mp4";

export default function AboutUs() {
  useEffect(() => {
    console.log("About.tsx page loaded");
    
    // Add a visible marker on the page
    const marker = document.createElement('div');
    marker.style.position = 'fixed';
    marker.style.top = '0';
    marker.style.right = '0';
    marker.style.padding = '10px';
    marker.style.background = 'red';
    marker.style.color = 'white';
    marker.style.zIndex = '9999';
    marker.textContent = 'LOADED FROM: about.tsx';
    document.body.appendChild(marker);
  }, []);
  
  return (
    <div className="relative min-h-screen">
      {/* Red background to identify this file */}
      <div className="fixed inset-0 z-0 bg-red-600">
        {/* Red overlay */}
        <div className="absolute inset-0 bg-red-500/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-4 py-16 text-white">
          <div className="max-w-3xl mx-auto bg-black/60 p-8 rounded-lg backdrop-blur-sm">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">O Nama</h1>
            
            <div className="space-y-6 text-lg">
              <p>
                Pogon je više od brenda - to je pokret koji spaja ljude sa zajedničkom vizijom. 
                Naša priča počinje sa strašću prema kvalitetu i inovacijama.
              </p>
              
              <p>
                Od samog početka, naš cilj je bio da stvorimo proizvode koji ne samo da 
                zadovoljavaju potrebe naših korisnika, već i prevazilaze njihova očekivanja.
              </p>
              
              <p>
                Naš tim čine stručnjaci iz različitih oblasti, ujedinjeni u misiji da 
                transformišemo tržište i postavimo nove standarde kvaliteta.
              </p>
              
              <p>
                Verujemo u transparentnost, integritet i kontinuirano usavršavanje. 
                Svaki dan radimo na tome da budemo bolji nego juče.
              </p>
              
              <p>
                Pridružite se našoj rastućoj porodici i postanite deo pokreta koji 
                menja industriju iz korena.
              </p>
            </div>
            
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">Naše Vrednosti</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2">Kvalitet</h3>
                  <p>Beskompromisna posvećenost kvalitetu u svakom aspektu našeg poslovanja.</p>
                </div>
                
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2">Inovacija</h3>
                  <p>Konstantno tražimo nove načine da unapredimo naše proizvode i usluge.</p>
                </div>
                
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2">Zajednica</h3>
                  <p>Gradimo snažnu zajednicu zasnovanu na međusobnom poštovanju i podršci.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Big POGON at the bottom */}
          <div className="mt-20 mb-12 text-center">
            <h1 className="text-[150px] md:text-[200px] font-bold text-white opacity-30 select-none tracking-widest">
              POGON
            </h1>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
} 