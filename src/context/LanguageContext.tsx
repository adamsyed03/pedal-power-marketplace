import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'sr' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.models': 'Models',
    'nav.about': 'About Us',
    'nav.join': 'Join Network',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.title': 'Join the E-Mobility Revolution',
    'hero.subtitle': 'Premium electric bikes designed for cleaner, cheaper and smarter transportation',
    'hero.button': 'Explore Models',
    
    // Featured Products
    'products.title': 'Our Models',
    'products.subtitle': 'Experience premium e-mobility at an affordable price',
    'products.learnMore': 'Learn More',
    'products.category': 'Urban',
    'products.description': 'Premium electric bike with smart features, perfect for city riding if you\'re tired of long traffic jams and parking searches',
    
    // Benefits
    'benefits.title': 'Why Choose Pogon',
    'benefits.subtitle': 'Experience the perfect blend of innovation, sustainability, and premium quality',
    'benefits.health.title': 'Health',
    'benefits.health.description': 'Imagine breathing air every day that seriously compromises your health — because that\'s already happening. Belgrade is among the most polluted capitals in Europe, with an average annual PM2.5 particle concentration of 23.3 µg/m³. These particles penetrate deep into the lungs and increase the risk of asthma, heart disease, and even premature death. Pogon offers a solution: a quiet, electric bike that doesn\'t pollute and helps us together clean the air we breathe.',
    'benefits.time.title': 'Time',
    'benefits.time.description': 'In Belgrade, we spend nearly 40 minutes in transport every day — often in chaos, nervousness, and traffic jams. That\'s more than 10 days a year lost in traffic. Instead of standing in queues, you could move easily, quickly, and directly through the city with the help of Pogon — an e-bike that takes you stress-free, whenever and wherever you want.',
    'benefits.economy.title': 'Economic Benefits',
    'benefits.economy.description': 'From bread to fuel — everything is getting more expensive. Inflation in Serbia reached double-digit values in 2023, with prices of basic products and services jumping up to 20% in some sectors. Transport costs are becoming an increasingly larger part of the household budget. Pogon is the answer to daily wallet pressure: buy once, and ride without fuel, registration, service, or parking.',
    'benefits.source': 'Source:',
    
        // Refer Friend Banner
        'referBanner.text': 'Refer a friend to the Pogon Boost Plan and get a FREE WEEK each!',
        'referBanner.learnMore': 'Learn More',
        
        // Refer and Earn Section
        'referEarn.title': 'Refer and Earn',
        'referEarn.subtitle': 'Refer a friend who signs up for our Boost Plan and you\'ll both receive a FREE WEEK of riding!',
        'referEarn.description': 'The free week applies to e-bikes and e-mopeds.',
        'referEarn.disclaimer': 'Terms and conditions apply.',
        'referEarn.cta': 'REFER A FRIEND',
  },
  sr: {
    // Navigation
    'nav.models': 'Modeli',
    'nav.about': 'O Nama',
    'nav.join': 'Pridružite se Mreži',
    'nav.contact': 'Kontakt',
    
    // Hero
    'hero.title': 'Pridruži se Revoluciji E-mobilnosti',
    'hero.subtitle': 'Premium električni bicikli dizajnirani za čistiji, jeftiniji i pametniji prevoz',
    'hero.button': 'Istraži Model',
    
    // Featured Products
    'products.title': 'Naši modeli',
    'products.subtitle': 'Doživite premium e-mobilnost po pristupačnoj ceni',
    'products.learnMore': 'Saznaj Više',
    'products.category': 'Gradski',
    'products.description': 'Premium električni bicikl sa pametnim funkcijama, savršen za gradsku vožnju ako su vam dosadile duge gužve i potrage za parkingom',
    
    // Benefits
    'benefits.title': 'Zašto Izabrati Pogon',
    'benefits.subtitle': 'Doživite savršen spoj inovacije, održivosti i vrhunskog kvaliteta',
    'benefits.health.title': 'Zdravlje',
    'benefits.health.description': 'Zamislite da svakog dana udišete vazduh koji ozbiljno narušava vaše zdravlje — jer to se već dešava. Beograd je među najzagađenijim prestonicama Evrope, sa prosečnom godišnjom koncentracijom PM2.5 čestica od 23,3 µg/m³. Te čestice ulaze duboko u pluća i povećavaju rizik od astme, srčanih bolesti i čak prerane smrti. Pogon nudi rešenje: tihi, električni bicikl koji ne zagađuje i pomaže da zajedno pročistimo vazduh koji dišemo.',
    'benefits.time.title': 'Vreme',
    'benefits.time.description': 'U Beogradu svakog dana potrošimo skoro 40 minuta u prevozu — često u haosu, nervozi i zastoju. To je više od 10 dana godišnje izgubljenih u saobraćaju. Umesto da stojite u koloni, mogli biste se kretati lako, brzo i direktno kroz grad uz pomoć Pogona — e-bicikla koji vas vodi bez stresa, kad god i gde god poželite.',
    'benefits.economy.title': 'Ekonomske Prednosti',
    'benefits.economy.description': 'Od hleba do goriva — sve poskupljuje. Inflacija u Srbiji je u 2023. godini dostigla dvocifrene vrednosti, pri čemu su cene osnovnih proizvoda i usluga skočile i do 20% u nekim sektorima. Troškovi prevoza postaju sve veći deo kućnog budžeta. Pogon je odgovor na svakodnevni pritisak na novčanik: jednom kupite, a vozite bez goriva, registracije, servisa ili parkinga.',
    'benefits.source': 'Izvor:',
    
        // Refer Friend Banner
        'referBanner.text': 'Preporučite prijatelja za Pogon Boost Plan i dobijte BESPLATNU NEDELJU svaki!',
        'referBanner.learnMore': 'Saznaj Više',
        
        // Refer and Earn Section
        'referEarn.title': 'Preporuči i Zaradi',
        'referEarn.subtitle': 'Preporučite prijatelja koji se prijavi za naš Boost Plan i oboje ćete dobiti BESPLATNU NEDELJU vožnje!',
        'referEarn.description': 'Besplatna nedelja važi za e-bicikle i e-skutere.',
        'referEarn.disclaimer': 'Važe uslovi i odredbe.',
        'referEarn.cta': 'PREPORUČI PRIJATELJA',
  },
  ru: {
    // Navigation
    'nav.models': 'Модели',
    'nav.about': 'О Нас',
    'nav.join': 'Присоединиться к Сети',
    'nav.contact': 'Контакты',
    
    // Hero
    'hero.title': 'Присоединяйтесь к Революции Электро-мобильности',
    'hero.subtitle': 'Премиум электровелосипеды, разработанные для более чистого, дешевого и умного транспорта',
    'hero.button': 'Изучить Модели',
    
    // Featured Products
    'products.title': 'Наши Модели',
    'products.subtitle': 'Ощутите премиум электро-мобильность по доступной цене',
    'products.learnMore': 'Узнать Больше',
    'products.category': 'Городской',
    'products.description': 'Премиум электровелосипед с умными функциями, идеально подходит для городской езды, если вам надоели длинные пробки и поиск парковки',
    
    // Benefits
    'benefits.title': 'Почему Выбрать Pogon',
    'benefits.subtitle': 'Ощутите идеальное сочетание инноваций, устойчивости и премиум качества',
    'benefits.health.title': 'Здоровье',
    'benefits.health.description': 'Представьте, что каждый день вы дышите воздухом, который серьезно вредит вашему здоровью — потому что это уже происходит. Белград входит в число самых загрязненных столиц Европы со средней годовой концентрацией частиц PM2.5 23,3 мкг/м³. Эти частицы проникают глубоко в легкие и увеличивают риск астмы, сердечных заболеваний и даже преждевременной смерти. Pogon предлагает решение: тихий, электрический велосипед, который не загрязняет и помогает нам вместе очистить воздух, которым мы дышим.',
    'benefits.time.title': 'Время',
    'benefits.time.description': 'В Белграде мы тратим почти 40 минут в день на транспорт — часто в хаосе, нервозности и пробках. Это более 10 дней в году, потерянных в дороге. Вместо того чтобы стоять в очередях, вы могли бы передвигаться легко, быстро и напрямую по городу с помощью Pogon — электровелосипеда, который везет вас без стресса, когда и куда вы хотите.',
    'benefits.economy.title': 'Экономические Преимущества',
    'benefits.economy.description': 'От хлеба до топлива — все дорожает. Инфляция в Сербии в 2023 году достигла двузначных значений, при этом цены на основные товары и услуги выросли до 20% в некоторых секторах. Расходы на транспорт становятся все большей частью семейного бюджета. Pogon — это ответ на ежедневное давление на кошелек: купите один раз и ездите без топлива, регистрации, обслуживания или парковки.',
    'benefits.source': 'Источник:',
    
        // Refer Friend Banner
        'referBanner.text': 'Пригласите друга в Pogon Boost Plan и получите БЕСПЛАТНУЮ НЕДЕЛЮ каждый!',
        'referBanner.learnMore': 'Узнать Больше',
        
        // Refer and Earn Section
        'referEarn.title': 'Рекомендуй и Зарабатывай',
        'referEarn.subtitle': 'Рекомендуйте друга, который подпишется на наш Boost Plan, и вы оба получите БЕСПЛАТНУЮ НЕДЕЛЮ катания!',
        'referEarn.description': 'Бесплатная неделя действует для электровелосипедов и электроскутеров.',
        'referEarn.disclaimer': 'Действуют условия и положения.',
        'referEarn.cta': 'РЕКОМЕНДОВАТЬ ДРУГА',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
