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
    'hero.lifestyle': 'Lifestyle',
    'hero.delivery': 'Delivery',
    'hero.trusted': 'Trusted partner with',
    
    // Featured Products
    'products.title': 'Our Models',
    'products.subtitle': 'Experience premium e-mobility at an affordable price',
    'products.learnMore': 'Learn More',
    'products.rent': 'Rent',
    'products.buy': 'Buy',
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
    'referBanner.text': 'Refer a friend to the limited Pogon Boost Plan and unlock exclusive partnership benefits!',
    'referBanner.learnMore': 'Learn More',
    
    // Refer and Earn Section
    'referEarn.title': 'Refer and Earn',
    'referEarn.subtitle': 'Join us as a partner to secure a CONSISTENT MONTHLY INCOME.',
    'referEarn.description': 'This offer is valid for all displayed models.',
    'referEarn.disclaimer': 'Terms and conditions apply.',
    'referEarn.cta': 'REFER A FRIEND',
    'referEarn.form.title': 'Become a Partner',
    'referEarn.form.description': 'Fill out the form below to get started.',
    'referEarn.form.firstName': 'First Name',
    'referEarn.form.lastName': 'Last Name',
    'referEarn.form.city': 'City',
    'referEarn.form.phone': 'Phone Number',
    'referEarn.form.phonePlaceholder': 'Phone number',
    'referEarn.form.email': 'Email',
    'referEarn.form.preferredContact': 'Preferred Mode of Contact',
    'referEarn.form.preferredContactPlaceholder': 'Select preferred contact',
    'referEarn.form.contact.call': 'Call',
    'referEarn.form.contact.email': 'Email',
    'referEarn.form.contact.whatsapp': 'WhatsApp',
    'referEarn.form.contact.viber': 'Viber',
    'referEarn.form.cancel': 'Cancel',
    'referEarn.form.submit': 'Submit',
    'referEarn.form.submitting': 'Submitting...',
    'referEarn.form.success': 'Thank you! Your submission has been received.',
    'referEarn.form.error': 'There was an error submitting your form. Please try again.',

    // Pogon X Detail Page
    'bike.pogonX.title': 'Glide',
    'bike.pogonX.description':
      'Pogon X is a premium electric bike designed for city riding, perfect for those tired of long traffic jams and searching for parking. With its compact foldable design and advanced technology, it is the ideal solution for everyday commuting through the city.',
    'bike.pogonX.specsTitle': 'Specifications',
    'bike.pogonX.spec.speed': 'Top speed',
    'bike.pogonX.spec.range': 'Range',
    'bike.pogonX.spec.power': 'Power',
    'bike.pogonX.spec.capacity': 'Max load',
    'bike.pogonX.spec.chargeTime': 'Charging time',
    'bike.pogonX.spec.wheelSize': 'Wheel size',
    'bike.pogonX.spec.frameType': 'Frame type',
    'bike.pogonX.cta': 'Join the waitlist',
    'bike.pogonX.rent': 'Rent',
    'bike.pogonX.buy': 'Buy',
    
    // Glide Form
    'glide.form.rentTitle': 'Rent Glide',
    'glide.form.buyTitle': 'Buy Glide',
    'glide.form.description': 'Fill out the form below to get started.',
    'glide.form.firstName': 'First Name',
    'glide.form.lastName': 'Last Name',
    'glide.form.city': 'City',
    'glide.form.email': 'Email',
    'glide.form.phone': 'Phone Number',
    'glide.form.phonePlaceholder': 'Phone number',
    'glide.form.cancel': 'Cancel',
    'glide.form.submit': 'Submit',
    'glide.form.submitting': 'Submitting...',
    'glide.form.success': 'Thank you! Your submission has been received.',
    'glide.form.error': 'There was an error submitting your form. Please try again.',
    
    // Rent Waitlist
    'rentWaitlist.title': 'Join the Rent Waitlist',
    'rentWaitlist.description': 'Enter your email address to join the rent waitlist.',
    'rentWaitlist.placeholder': 'Enter your email address here',
    'rentWaitlist.submit': 'Submit',
    'rentWaitlist.submitting': 'Submitting...',
    'rentWaitlist.success': 'Thank you! You have successfully signed up!',
    'rentWaitlist.error': 'Error: Sign up failed.',
    
    // Buy Waitlist
    'buyWaitlist.title': 'Join the Buy Waitlist',
    'buyWaitlist.description': 'Enter your email address to join the buy waitlist.',
    'buyWaitlist.placeholder': 'Enter your email address here',
    'buyWaitlist.submit': 'Submit',
    'buyWaitlist.submitting': 'Submitting...',
    'buyWaitlist.success': 'Thank you! You have successfully signed up!',
    'buyWaitlist.error': 'Error: Sign up failed.',
  },
  sr: {
    // Navigation
    'nav.models': 'Modeli',
    'nav.about': 'O Nama',
    'nav.join': 'Pridružite se Mreži',
    'nav.contact': 'Kontakt',
    
    // Hero
    'hero.title': 'Pridruži se Revoluciji E-Mobilnosti',
    'hero.subtitle': 'Premium električni bicikli dizajnirani za čistiji, jeftiniji i pametniji prevoz',
    'hero.lifestyle': 'Lifestyle',
    'hero.delivery': 'Dostava',
    'hero.trusted': 'Pouzdan partner sa',
    
    // Featured Products
    'products.title': 'Naši modeli',
    'products.subtitle': 'Doživite premium e-mobilnost po pristupačnoj ceni',
    'products.learnMore': 'Saznaj Više',
    'products.rent': 'Iznajmi',
    'products.buy': 'Kupi',
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
    'referBanner.text': 'Preporučite prijatelja za ograničeni Pogon Boost Plan i otključajte ekskluzivne partnerske benefite!',
    'referBanner.learnMore': 'Saznaj Više',
    
    // Refer and Earn Section
    'referEarn.title': 'Preporuči i Zaradi',
    'referEarn.subtitle': 'Pridružite nam se kao partner da osiguramo STALAN MESEČNI PRIHOD.',
    'referEarn.description': 'Ova ponuda važi za sve prikazane modele.',
    'referEarn.disclaimer': 'Važe uslovi i odredbe.',
    'referEarn.cta': 'PREPORUČI PRIJATELJA',
    'referEarn.form.title': 'Postanite Partner',
    'referEarn.form.description': 'Popunite formular ispod da biste počeli.',
    'referEarn.form.firstName': 'Ime',
    'referEarn.form.lastName': 'Prezime',
    'referEarn.form.city': 'Grad',
    'referEarn.form.phone': 'Broj Telefona',
    'referEarn.form.phonePlaceholder': 'Broj telefona',
    'referEarn.form.email': 'Email',
    'referEarn.form.preferredContact': 'Preferirani Način Kontakta',
    'referEarn.form.preferredContactPlaceholder': 'Izaberite preferirani kontakt',
    'referEarn.form.contact.call': 'Poziv',
    'referEarn.form.contact.email': 'Email',
    'referEarn.form.contact.whatsapp': 'WhatsApp',
    'referEarn.form.contact.viber': 'Viber',
    'referEarn.form.cancel': 'Otkaži',
    'referEarn.form.submit': 'Pošalji',
    'referEarn.form.submitting': 'Slanje...',
    'referEarn.form.success': 'Hvala! Vaša prijava je primljena.',
    'referEarn.form.error': 'Došlo je do greške pri slanju forme. Molimo pokušajte ponovo.',

    // Pogon X Detail Page
    'bike.pogonX.title': 'Pogon X',
    'bike.pogonX.description':
      'Pogon X je vrhunski električni bicikl dizajniran za gradsku vožnju, savršen za one kojima su dosadile duge gužve i potrage za parkingom. Sa svojim kompaktnim sklopivim dizajnom i naprednom tehnologijom, predstavlja idealno rešenje za svakodnevno putovanje kroz grad.',
    'bike.pogonX.specsTitle': 'Specifikacije',
    'bike.pogonX.spec.speed': 'Brzina (maks.)',
    'bike.pogonX.spec.range': 'Domet',
    'bike.pogonX.spec.power': 'Snaga',
    'bike.pogonX.spec.capacity': 'Nosivost (maks.)',
    'bike.pogonX.spec.chargeTime': 'Vreme punjenja',
    'bike.pogonX.spec.wheelSize': 'Veličina točkova',
    'bike.pogonX.spec.frameType': 'Tip konstrukcije',
    'bike.pogonX.cta': 'Pridružite se čekanju',
    'bike.pogonX.rent': 'Iznajmi',
    'bike.pogonX.buy': 'Kupi',
    
    // Glide Form
    'glide.form.rentTitle': 'Iznajmi Glide',
    'glide.form.buyTitle': 'Kupi Glide',
    'glide.form.description': 'Popunite formular ispod da biste počeli.',
    'glide.form.firstName': 'Ime',
    'glide.form.lastName': 'Prezime',
    'glide.form.city': 'Grad',
    'glide.form.email': 'Email',
    'glide.form.phone': 'Broj Telefona',
    'glide.form.phonePlaceholder': 'Broj telefona',
    'glide.form.cancel': 'Otkaži',
    'glide.form.submit': 'Pošalji',
    'glide.form.submitting': 'Slanje...',
    'glide.form.success': 'Hvala! Vaša prijava je primljena.',
    'glide.form.error': 'Došlo je do greške pri slanju forme. Molimo pokušajte ponovo.',
    
    // Rent Waitlist
    'rentWaitlist.title': 'Pridružite se listi za iznajmljivanje',
    'rentWaitlist.description': 'Unesite svoju email adresu da biste se pridružili listi za iznajmljivanje.',
    'rentWaitlist.placeholder': 'Unesite svoju email adresu ovde',
    'rentWaitlist.submit': 'Pošaljite',
    'rentWaitlist.submitting': 'Slanje...',
    'rentWaitlist.success': 'Hvala, uspešno ste se prijavili!',
    'rentWaitlist.error': 'Greška: Prijava nije uspela.',
    
    // Buy Waitlist
    'buyWaitlist.title': 'Pridružite se listi za kupovinu',
    'buyWaitlist.description': 'Unesite svoju email adresu da biste se pridružili listi za kupovinu.',
    'buyWaitlist.placeholder': 'Unesite svoju email adresu ovde',
    'buyWaitlist.submit': 'Pošaljite',
    'buyWaitlist.submitting': 'Slanje...',
    'buyWaitlist.success': 'Hvala, uspešno ste se prijavili!',
    'buyWaitlist.error': 'Greška: Prijava nije uspela.',
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
    'hero.lifestyle': 'Образ жизни',
    'hero.delivery': 'Доставка',
    'hero.trusted': 'Надежный партнер с',
    
    // Featured Products
    'products.title': 'Наши Модели',
    'products.subtitle': 'Ощутите премиум электро-мобильность по доступной цене',
    'products.learnMore': 'Узнать Больше',
    'products.rent': 'Арендовать',
    'products.buy': 'Купить',
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
    'referBanner.text': 'Пригласите друга в ограниченный Pogon Boost Plan и получите эксклюзивные партнерские преимущества!',
    'referBanner.learnMore': 'Узнать Больше',
    
    // Refer and Earn Section
    'referEarn.title': 'Рекомендуй и Зарабатывай',
    'referEarn.subtitle': 'Присоединяйтесь к нам как партнер, чтобы обеспечить ПОСТОЯННЫЙ МЕСЯЧНЫЙ ДОХОД.',
    'referEarn.description': 'Это предложение действует для всех показанных моделей.',
    'referEarn.disclaimer': 'Действуют условия и положения.',
    'referEarn.cta': 'РЕКОМЕНДОВАТЬ ДРУГА',
    'referEarn.form.title': 'Стать Партнером',
    'referEarn.form.description': 'Заполните форму ниже, чтобы начать.',
    'referEarn.form.firstName': 'Имя',
    'referEarn.form.lastName': 'Фамилия',
    'referEarn.form.city': 'Город',
    'referEarn.form.phone': 'Номер Телефона',
    'referEarn.form.phonePlaceholder': 'Номер телефона',
    'referEarn.form.email': 'Email',
    'referEarn.form.preferredContact': 'Предпочтительный Способ Связи',
    'referEarn.form.preferredContactPlaceholder': 'Выберите предпочтительный способ связи',
    'referEarn.form.contact.call': 'Звонок',
    'referEarn.form.contact.email': 'Email',
    'referEarn.form.contact.whatsapp': 'WhatsApp',
    'referEarn.form.contact.viber': 'Viber',
    'referEarn.form.cancel': 'Отмена',
    'referEarn.form.submit': 'Отправить',
    'referEarn.form.submitting': 'Отправка...',
    'referEarn.form.success': 'Спасибо! Ваша заявка получена.',
    'referEarn.form.error': 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.',

    // Pogon X Detail Page
    'bike.pogonX.title': 'Pogon X',
    'bike.pogonX.description':
      'Pogon X — это премиальный электровелосипед, разработанный для городской езды, идеально подходит для тех, кому надоели длинные пробки и поиск парковки. Благодаря своему компактному складному дизайну и передовым технологиям он является идеальным решением для ежедневных поездок по городу.',
    'bike.pogonX.specsTitle': 'Характеристики',
    'bike.pogonX.spec.speed': 'Максимальная скорость',
    'bike.pogonX.spec.range': 'Запас хода',
    'bike.pogonX.spec.power': 'Мощность',
    'bike.pogonX.spec.capacity': 'Максимальная нагрузка',
    'bike.pogonX.spec.chargeTime': 'Время зарядки',
    'bike.pogonX.spec.wheelSize': 'Размер колёс',
    'bike.pogonX.spec.frameType': 'Тип рамы',
    'bike.pogonX.cta': 'Записаться в лист ожидания',
    'bike.pogonX.rent': 'Арендовать',
    'bike.pogonX.buy': 'Купить',
    
    // Glide Form
    'glide.form.rentTitle': 'Арендовать Glide',
    'glide.form.buyTitle': 'Купить Glide',
    'glide.form.description': 'Заполните форму ниже, чтобы начать.',
    'glide.form.firstName': 'Имя',
    'glide.form.lastName': 'Фамилия',
    'glide.form.city': 'Город',
    'glide.form.email': 'Email',
    'glide.form.phone': 'Номер Телефона',
    'glide.form.phonePlaceholder': 'Номер телефона',
    'glide.form.cancel': 'Отмена',
    'glide.form.submit': 'Отправить',
    'glide.form.submitting': 'Отправка...',
    'glide.form.success': 'Спасибо! Ваша заявка получена.',
    'glide.form.error': 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.',
    
    // Rent Waitlist
    'rentWaitlist.title': 'Присоединяйтесь к списку аренды',
    'rentWaitlist.description': 'Введите свой email адрес, чтобы присоединиться к списку аренды.',
    'rentWaitlist.placeholder': 'Введите свой email адрес здесь',
    'rentWaitlist.submit': 'Отправить',
    'rentWaitlist.submitting': 'Отправка...',
    'rentWaitlist.success': 'Спасибо! Вы успешно зарегистрировались!',
    'rentWaitlist.error': 'Ошибка: Регистрация не удалась.',
    
    // Buy Waitlist
    'buyWaitlist.title': 'Присоединяйтесь к списку покупок',
    'buyWaitlist.description': 'Введите свой email адрес, чтобы присоединиться к списку покупок.',
    'buyWaitlist.placeholder': 'Введите свой email адрес здесь',
    'buyWaitlist.submit': 'Отправить',
    'buyWaitlist.submitting': 'Отправка...',
    'buyWaitlist.success': 'Спасибо! Вы успешно зарегистрировались!',
    'buyWaitlist.error': 'Ошибка: Регистрация не удалась.',
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
