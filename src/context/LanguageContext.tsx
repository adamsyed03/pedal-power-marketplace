import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "sr" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "nav.models": "Models",
    "nav.about": "About Us",
    "nav.join": "Join Network",
    "nav.contact": "Contact",

    "hero.title": "Join the E-Mobility Revolution",
    "hero.subtitle": "Premium electric bikes designed for cleaner, cheaper and smarter transportation",
    "hero.lifestyle": "Lifestyle",
    "hero.delivery": "Delivery",
    "hero.trusted": "Trusted partner with",

    "products.title": "Our Models",
    "products.subtitle": "Experience premium e-mobility at an affordable price",
    "products.learnMore": "Learn More",
    "products.rent": "Rent",
    "products.buy": "Buy",
    "products.category": "Urban",
    "products.description":
      "Premium electric bike with smart features, perfect for city riding if you're tired of long traffic jams and parking searches",

    "benefits.title": "Why Choose Pogon",
    "benefits.subtitle": "Experience the perfect blend of innovation, sustainability, and premium quality",
    "benefits.health.title": "Health",
    "benefits.health.description":
      "Imagine breathing air every day that seriously compromises your health, because that's already happening. Belgrade is among the most polluted capitals in Europe, with an average annual PM2.5 particle concentration of 23.3 µg/m³. These particles penetrate deep into the lungs and increase the risk of asthma, heart disease, and even premature death. Pogon offers a solution: a quiet, electric bike that doesn't pollute and helps us together clean the air we breathe.",
    "benefits.time.title": "Time",
    "benefits.time.description":
      "In Belgrade, we spend nearly 40 minutes in transport every day, often in chaos, nervousness, and traffic jams. That's more than 10 days a year lost in traffic. Instead of standing in queues, you could move easily, quickly, and directly through the city with the help of Pogon, an e-bike that takes you stress-free, whenever and wherever you want.",
    "benefits.economy.title": "Economic Benefits",
    "benefits.economy.description":
      "From bread to fuel, everything is getting more expensive. Inflation in Serbia reached double-digit values in 2023, with prices of basic products and services jumping up to 20% in some sectors. Transport costs are becoming an increasingly larger part of the household budget. Pogon is the answer to daily wallet pressure: buy once, and ride without fuel, registration, service, or parking.",
    "benefits.source": "Source:",

    "referBanner.text": "Refer a friend to the limited Pogon Boost Plan and unlock exclusive partnership benefits!",
    "referBanner.learnMore": "Learn More",

    "referEarn.title": "Refer and Earn",
    "referEarn.subtitle": "Join us as a partner to secure a CONSISTENT MONTHLY INCOME.",
    "referEarn.description": "This offer is valid for all displayed models.",
    "referEarn.disclaimer": "Terms and conditions apply.",
    "referEarn.cta": "REFER A FRIEND",
    "referEarn.form.title": "Become a Partner",
    "referEarn.form.description": "Fill out the form below to get started.",
    "referEarn.form.firstName": "First Name",
    "referEarn.form.lastName": "Last Name",
    "referEarn.form.city": "City",
    "referEarn.form.phone": "Phone Number",
    "referEarn.form.phonePlaceholder": "Phone number",
    "referEarn.form.email": "Email",
    "referEarn.form.preferredContact": "Preferred Mode of Contact",
    "referEarn.form.preferredContactPlaceholder": "Select preferred contact",
    "referEarn.form.contact.call": "Call",
    "referEarn.form.contact.email": "Email",
    "referEarn.form.contact.whatsapp": "WhatsApp",
    "referEarn.form.contact.viber": "Viber",
    "referEarn.form.cancel": "Cancel",
    "referEarn.form.submit": "Submit",
    "referEarn.form.submitting": "Submitting...",
    "referEarn.form.success": "Thank you! Your submission has been received.",
    "referEarn.form.error": "There was an error submitting your form. Please try again.",

    "bike.pogonX.title": "Glide",
    "bike.pogonX.description":
      "Pogon X is a premium electric bike designed for city riding, perfect for those tired of long traffic jams and searching for parking. With its compact foldable design and advanced technology, it is the ideal solution for everyday commuting through the city.",
    "bike.pogonX.specsTitle": "Specifications",
    "bike.pogonX.spec.speed": "Top speed",
    "bike.pogonX.spec.range": "Range",
    "bike.pogonX.spec.power": "Power",
    "bike.pogonX.spec.capacity": "Max load",
    "bike.pogonX.spec.chargeTime": "Charging time",
    "bike.pogonX.spec.wheelSize": "Wheel size",
    "bike.pogonX.spec.frameType": "Frame type",
    "bike.pogonX.cta": "Join the waitlist",
    "bike.pogonX.rent": "Rent",
    "bike.pogonX.buy": "Buy",

    "glide.form.rentTitle": "Rent Glide",
    "glide.form.buyTitle": "Buy Glide",
    "glide.form.description": "Fill out the form below to get started.",
    "glide.form.firstName": "First Name",
    "glide.form.lastName": "Last Name",
    "glide.form.city": "City",
    "glide.form.email": "Email",
    "glide.form.phone": "Phone Number",
    "glide.form.phonePlaceholder": "Phone number",
    "glide.form.cancel": "Cancel",
    "glide.form.submit": "Submit",
    "glide.form.submitting": "Submitting...",
    "glide.form.success": "Thank you! Your submission has been received.",
    "glide.form.error": "There was an error submitting your form. Please try again.",

    "rentWaitlist.title": "Join the Rent Waitlist",
    "rentWaitlist.description": "Enter your email address to join the rent waitlist.",
    "rentWaitlist.placeholder": "Enter your email address here",
    "rentWaitlist.submit": "Submit",
    "rentWaitlist.submitting": "Submitting...",
    "rentWaitlist.success": "Thank you! You have successfully signed up!",
    "rentWaitlist.error": "Error: Sign up failed.",

    "buyWaitlist.title": "Join the Buy Waitlist",
    "buyWaitlist.description": "Enter your email address to join the buy waitlist.",
    "buyWaitlist.placeholder": "Enter your email address here",
    "buyWaitlist.submit": "Submit",
    "buyWaitlist.submitting": "Submitting...",
    "buyWaitlist.success": "Thank you! You have successfully signed up!",
    "buyWaitlist.error": "Error: Sign up failed.",
  },
  sr: {
    "nav.models": "Modeli",
    "nav.about": "O nama",
    "nav.join": "Postani partner",
    "nav.contact": "Kontakt",

    "hero.title": "Pokreni dan po svom",
    "hero.subtitle": "Električni bicikli za grad, tempo i planove koji ne čekaju.",
    "hero.lifestyle": "Lifestyle",
    "hero.delivery": "Dostava",
    "hero.trusted": "Vozi se širom Srbije",

    "products.title": "Modeli",
    "products.subtitle": "Električni bicikli koji izgledaju dobro, voze još bolje i uklapaju se u svakodnevicu.",
    "products.learnMore": "Saznaj više",
    "products.rent": "Iznajmi",
    "products.buy": "Kupi",
    "products.category": "Gradski",
    "products.description": "Električni bicikl za gradsku vožnju, bez cimanja oko gužve, parkinga i svakodnevnog stresa.",

    "benefits.title": "Zašto Pogon",
    "benefits.subtitle": "Manje čekanja, manje troška, više slobode u svakodnevnom kretanju.",
    "benefits.health.title": "Lakše disanje",
    "benefits.health.description":
      "Grad već dovoljno opterećuje vazduh koji dišemo. Pogon je tiša i čistija opcija za svakodnevnu vožnju, bez izduvnih gasova i bez dodatnog zagađenja tamo gde se već najviše oseća.",
    "benefits.time.title": "Manje gužve, više vremena",
    "benefits.time.description":
      "Umesto da stojiš u koloni i gubiš vreme između obaveza, kroz grad prolaziš brže, lakše i bez nervoze. Pogon je napravljen za ritam dana koji ne trpi zastoje.",
    "benefits.economy.title": "Manji trošak",
    "benefits.economy.description":
      "Gorivo, parking i svakodnevni troškovi samo rastu. Sa Pogonom voziš jednostavnije i rasterećuješ budžet bez kompromisa u kretanju po gradu.",
    "benefits.source": "Izvor:",

    "referBanner.text": "Preporuči Pogon prijatelju i otvori dodatne partnerske pogodnosti.",
    "referBanner.learnMore": "Saznaj više",

    "referEarn.title": "Preporuči i zaradi",
    "referEarn.subtitle": "Ako imaš dobru mrežu ljudi, pretvori je u stabilan mesečni prihod.",
    "referEarn.description": "Ponuda važi za sve prikazane modele.",
    "referEarn.disclaimer": "Važe uslovi programa.",
    "referEarn.cta": "Preporuči prijatelja",
    "referEarn.form.title": "Postani partner",
    "referEarn.form.description": "Ostavi podatke i javljamo ti se uskoro.",
    "referEarn.form.firstName": "Ime",
    "referEarn.form.lastName": "Prezime",
    "referEarn.form.city": "Grad",
    "referEarn.form.phone": "Broj telefona",
    "referEarn.form.phonePlaceholder": "Unesi broj telefona",
    "referEarn.form.email": "Email",
    "referEarn.form.preferredContact": "Kako da te kontaktiramo",
    "referEarn.form.preferredContactPlaceholder": "Izaberi način kontakta",
    "referEarn.form.contact.call": "Poziv",
    "referEarn.form.contact.email": "Email",
    "referEarn.form.contact.whatsapp": "WhatsApp",
    "referEarn.form.contact.viber": "Viber",
    "referEarn.form.cancel": "Otkaži",
    "referEarn.form.submit": "Pošalji",
    "referEarn.form.submitting": "Šaljemo...",
    "referEarn.form.success": "Hvala! Prijava je uspešno poslata.",
    "referEarn.form.error": "Došlo je do greške. Pokušaj ponovo.",

    "bike.pogonX.title": "Glide",
    "bike.pogonX.description":
      "Glide je električni bicikl za gradsku vožnju bez gužve, traženja parkinga i bespotrebnog stresa. Kompaktan je, praktičan i spreman za tempo svakog dana.",
    "bike.pogonX.specsTitle": "Specifikacije",
    "bike.pogonX.spec.speed": "Maks. brzina",
    "bike.pogonX.spec.range": "Domet",
    "bike.pogonX.spec.power": "Snaga",
    "bike.pogonX.spec.capacity": "Nosivost",
    "bike.pogonX.spec.chargeTime": "Punjenje",
    "bike.pogonX.spec.wheelSize": "Veličina točka",
    "bike.pogonX.spec.frameType": "Ram",
    "bike.pogonX.cta": "Prijavi se",
    "bike.pogonX.rent": "Iznajmi",
    "bike.pogonX.buy": "Kupi",

    "glide.form.rentTitle": "Iznajmi Glide",
    "glide.form.buyTitle": "Kupi Glide",
    "glide.form.description": "Ostavi podatke i javljamo ti se uskoro.",
    "glide.form.firstName": "Ime",
    "glide.form.lastName": "Prezime",
    "glide.form.city": "Grad",
    "glide.form.email": "Email",
    "glide.form.phone": "Broj telefona",
    "glide.form.phonePlaceholder": "Unesi broj telefona",
    "glide.form.cancel": "Otkaži",
    "glide.form.submit": "Pošalji",
    "glide.form.submitting": "Šaljemo...",
    "glide.form.success": "Hvala! Prijava je uspešno poslata.",
    "glide.form.error": "Došlo je do greške. Pokušaj ponovo.",

    "rentWaitlist.title": "Prijavi se za rentu",
    "rentWaitlist.description": "Ostavi email i javljamo ti kada renta bude dostupna.",
    "rentWaitlist.placeholder": "Unesi email adresu",
    "rentWaitlist.submit": "Prijavi se",
    "rentWaitlist.submitting": "Šaljemo...",
    "rentWaitlist.success": "Uspešno si prijavljen.",
    "rentWaitlist.error": "Prijava nije uspela. Pokušaj ponovo.",

    "buyWaitlist.title": "Prijavi se za kupovinu",
    "buyWaitlist.description": "Ostavi email i javljamo ti kada kupovina bude dostupna.",
    "buyWaitlist.placeholder": "Unesi email adresu",
    "buyWaitlist.submit": "Prijavi se",
    "buyWaitlist.submitting": "Šaljemo...",
    "buyWaitlist.success": "Uspešno si prijavljen.",
    "buyWaitlist.error": "Prijava nije uspela. Pokušaj ponovo.",
  },
  ru: {
    "nav.models": "Модели",
    "nav.about": "О Нас",
    "nav.join": "Присоединиться к Сети",
    "nav.contact": "Контакты",

    "hero.title": "Присоединяйтесь к Революции Электро-мобильности",
    "hero.subtitle": "Премиум электровелосипеды, разработанные для более чистого, дешевого и умного транспорта",
    "hero.lifestyle": "Образ жизни",
    "hero.delivery": "Доставка",
    "hero.trusted": "Надежный партнер с",

    "products.title": "Наши Модели",
    "products.subtitle": "Ощутите премиум электро-мобильность по доступной цене",
    "products.learnMore": "Узнать Больше",
    "products.rent": "Арендовать",
    "products.buy": "Купить",
    "products.category": "Городской",
    "products.description":
      "Премиум электровелосипед с умными функциями, идеально подходит для городской езды, если вам надоели длинные пробки и поиск парковки",

    "benefits.title": "Почему Выбрать Pogon",
    "benefits.subtitle": "Ощутите идеальное сочетание инноваций, устойчивости и премиум качества",
    "benefits.health.title": "Здоровье",
    "benefits.health.description":
      "Представьте, что каждый день вы дышите воздухом, который серьезно вредит вашему здоровью — потому что это уже происходит. Белград входит в число самых загрязненных столиц Европы со средней годовой концентрацией частиц PM2.5 23,3 мкг/м³. Эти частицы проникают глубоко в легкие и увеличивают риск астмы, сердечных заболеваний и даже преждевременной смерти. Pogon предлагает решение: тихий, электрический велосипед, который не загрязняет и помогает нам вместе очистить воздух, которым мы дышим.",
    "benefits.time.title": "Время",
    "benefits.time.description":
      "В Белграде мы тратим почти 40 минут в день на транспорт — часто в хаосе, нервозности и пробках. Это более 10 дней в году, потерянных в дороге. Вместо того чтобы стоять в очередях, вы могли бы передвигаться легко, быстро и напрямую по городу с помощью Pogon — электровелосипеда, который везет вас без стресса, когда и куда вы хотите.",
    "benefits.economy.title": "Экономические Преимущества",
    "benefits.economy.description":
      "От хлеба до топлива — все дорожает. Инфляция в Сербии в 2023 году достигла двузначных значений, при этом цены на основные товары и услуги выросли до 20% в некоторых секторах. Расходы на транспорт становятся все большей частью семейного бюджета. Pogon — это ответ на ежедневное давление на кошелек: купите один раз и ездите без топлива, регистрации, обслуживания или парковки.",
    "benefits.source": "Источник:",

    "referBanner.text": "Пригласите друга в ограниченный Pogon Boost Plan и получите эксклюзивные партнерские преимущества!",
    "referBanner.learnMore": "Узнать Больше",

    "referEarn.title": "Рекомендуй и Зарабатывай",
    "referEarn.subtitle": "Присоединяйтесь к нам как партнер, чтобы обеспечить ПОСТОЯННЫЙ МЕСЯЧНЫЙ ДОХОД.",
    "referEarn.description": "Это предложение действует для всех показанных моделей.",
    "referEarn.disclaimer": "Действуют условия и положения.",
    "referEarn.cta": "РЕКОМЕНДОВАТЬ ДРУГА",
    "referEarn.form.title": "Стать Партнером",
    "referEarn.form.description": "Заполните форму ниже, чтобы начать.",
    "referEarn.form.firstName": "Имя",
    "referEarn.form.lastName": "Фамилия",
    "referEarn.form.city": "Город",
    "referEarn.form.phone": "Номер Телефона",
    "referEarn.form.phonePlaceholder": "Номер телефона",
    "referEarn.form.email": "Email",
    "referEarn.form.preferredContact": "Предпочтительный Способ Связи",
    "referEarn.form.preferredContactPlaceholder": "Выберите предпочтительный способ связи",
    "referEarn.form.contact.call": "Звонок",
    "referEarn.form.contact.email": "Email",
    "referEarn.form.contact.whatsapp": "WhatsApp",
    "referEarn.form.contact.viber": "Viber",
    "referEarn.form.cancel": "Отмена",
    "referEarn.form.submit": "Отправить",
    "referEarn.form.submitting": "Отправка...",
    "referEarn.form.success": "Спасибо! Ваша заявка получена.",
    "referEarn.form.error": "Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.",

    "bike.pogonX.title": "Pogon X",
    "bike.pogonX.description":
      "Pogon X — это премиальный электровелосипед, разработанный для городской езды, идеально подходит для тех, кому надоели длинные пробки и поиск парковки. Благодаря своему компактному складному дизайну и передовым технологиям он является идеальным решением для ежедневных поездок по городу.",
    "bike.pogonX.specsTitle": "Характеристики",
    "bike.pogonX.spec.speed": "Максимальная скорость",
    "bike.pogonX.spec.range": "Запас хода",
    "bike.pogonX.spec.power": "Мощность",
    "bike.pogonX.spec.capacity": "Максимальная нагрузка",
    "bike.pogonX.spec.chargeTime": "Время зарядки",
    "bike.pogonX.spec.wheelSize": "Размер колёс",
    "bike.pogonX.spec.frameType": "Тип рамы",
    "bike.pogonX.cta": "Записаться в лист ожидания",
    "bike.pogonX.rent": "Арендовать",
    "bike.pogonX.buy": "Купить",

    "glide.form.rentTitle": "Арендовать Glide",
    "glide.form.buyTitle": "Купить Glide",
    "glide.form.description": "Заполните форму ниже, чтобы начать.",
    "glide.form.firstName": "Имя",
    "glide.form.lastName": "Фамилия",
    "glide.form.city": "Город",
    "glide.form.email": "Email",
    "glide.form.phone": "Номер Телефона",
    "glide.form.phonePlaceholder": "Номер телефона",
    "glide.form.cancel": "Отмена",
    "glide.form.submit": "Отправить",
    "glide.form.submitting": "Отправка...",
    "glide.form.success": "Спасибо! Ваша заявка получена.",
    "glide.form.error": "Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.",

    "rentWaitlist.title": "Присоединяйтесь к списку аренды",
    "rentWaitlist.description": "Введите свой email адрес, чтобы присоединиться к списку аренды.",
    "rentWaitlist.placeholder": "Введите свой email адрес здесь",
    "rentWaitlist.submit": "Отправить",
    "rentWaitlist.submitting": "Отправка...",
    "rentWaitlist.success": "Спасибо! Вы успешно зарегистрировались!",
    "rentWaitlist.error": "Ошибка: Регистрация не удалась.",

    "buyWaitlist.title": "Присоединяйтесь к списку покупок",
    "buyWaitlist.description": "Введите свой email адрес, чтобы присоединиться к списку покупок.",
    "buyWaitlist.placeholder": "Введите свой email адрес здесь",
    "buyWaitlist.submit": "Отправить",
    "buyWaitlist.submitting": "Отправка...",
    "buyWaitlist.success": "Спасибо! Вы успешно зарегистрировались!",
    "buyWaitlist.error": "Ошибка: Регистрация не удалась.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("sr");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};
