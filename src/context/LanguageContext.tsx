import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'sr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  language: 'sr',
  setLanguage: () => {},
  t: (key) => key,
});

// Translations
const translations: Record<Language, Record<string, string>> = {
  sr: {
    // Navigation
    'nav.models': 'Modeli',
    'nav.about': 'O Nama',
    'nav.join': 'Pridružite se Mreži',
    'nav.contact': 'Kontakt',
    
    // About Us page
    'about.title': 'O Nama',
    'about.p1': 'Pogon nije samo brend. To je pokret koji okuplja ljude sa zajedničkom strašću za vrhunskim kvalitetom, inovacijama i održivom mobilnošću.',
    'about.p2': 'Naša priča počinje iz jednostavne, ali snažne ideje: da stvaramo proizvode koji ne samo da ispunjavaju potrebe modernog života, već ih iznova definišu. Od prvog dana, naš cilj je bio jasan – pomeriti granice očekivanog i postaviti nove standarde u svetu električne mobilnosti.',
    'about.p3': 'Naš tim okuplja vrhunske stručnjake iz inženjeringa, dizajna i proizvodnje, vođene zajedničkom misijom – da oblikujemo budućnost putovanja. Sa svakim projektom težimo ka transparentnosti, vrhunskoj izradi i neprekidnom razvoju.',
    'about.p4': 'Verujemo da pravo inoviranje dolazi iz stalne težnje da budemo bolji nego juče – za naše korisnike, za zajednicu i za planetu.',
    'about.p5': 'Pridružite se Pogonu i budite deo pokreta koji pokreće promene.',
    'loading': 'Učitavanje videa...',
  },
  en: {
    // Navigation
    'nav.models': 'Models',
    'nav.about': 'About Us',
    'nav.join': 'Join the Network',
    'nav.contact': 'Contact',
    
    // About Us page
    'about.title': 'About Us',
    'about.p1': 'Pogon is not just a brand. It\'s a movement that brings together people with a shared passion for premium quality, innovation, and sustainable mobility.',
    'about.p2': 'Our story begins with a simple yet powerful idea: to create products that not only meet the needs of modern life but redefine them. From day one, our goal has been clear – to push the boundaries of what\'s expected and set new standards in the world of electric mobility.',
    'about.p3': 'Our team brings together top experts in engineering, design, and manufacturing, guided by a shared mission – to shape the future of travel. With each project, we strive for transparency, premium craftsmanship, and continuous development.',
    'about.p4': 'We believe that true innovation comes from a constant pursuit to be better than yesterday – for our users, for the community, and for the planet.',
    'about.p5': 'Join Pogon and be part of a movement that drives change.',
    'loading': 'Loading video...',
  }
};

// Provider component
export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('sr');
  
  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  const value = {
    language,
    setLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook for using the language context
export const useLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
}; 