import { products, type Product, type ProductKey } from './products';

export type SiteLanguage = 'sr' | 'en' | 'ru';
export type Localized<T> = Record<SiteLanguage, T>;
export type BikeKey = Extract<ProductKey, 'cargo' | 'core' | 'glide'>;

export type ProductMedia = {
  src: string;
  alt: Localized<string>;
  width: number;
  height: number;
};

export type ProductHighlight = {
  value: string;
  label: Localized<string>;
};

export type ProductStory = {
  eyebrow: Localized<string>;
  title: Localized<string>;
  body: Localized<string>;
  image: ProductMedia;
};

export type ProductFeature = {
  icon: 'battery' | 'bike' | 'brake' | 'fold' | 'gps' | 'light' | 'lock' | 'shield' | 'sparkles' | 'wrench';
  title: Localized<string>;
  body: Localized<string>;
};

export type SpecificationGroup = {
  title: Localized<string>;
  items: Array<{ label: Localized<string>; value: Localized<string> }>;
};

export type ProductFaq = {
  question: Localized<string>;
  answer: Localized<string>;
};

export type ComparisonFacts = {
  range: Localized<string>;
  battery: Localized<string>;
  frame: Localized<string>;
  wheels: Localized<string>;
  foldable: boolean;
  gps: boolean;
  bestFor: Localized<string>;
};

export type ProductDetails = {
  key: BikeKey;
  product: Product;
  route: string;
  eyebrow: Localized<string>;
  valueProposition: Localized<string>;
  seoTitle: Localized<string>;
  seoDescription: Localized<string>;
  gallery: ProductMedia[];
  highlights: ProductHighlight[];
  stories: ProductStory[];
  features: ProductFeature[];
  specifications: SpecificationGroup[];
  whatsInBoxNote: Localized<string>;
  faq: ProductFaq[];
  comparison: ComparisonFacts;
};

const l = <T,>(sr: T, en: T, ru: T): Localized<T> => ({ sr, en, ru });

const productByKey = (key: BikeKey) => {
  const product = products.find((entry) => entry.key === key);
  if (!product) throw new Error(`Missing product catalog entry: ${key}`);
  return product;
};

const sharedFaq = (model: string): ProductFaq[] => [
  {
    question: l('Koliko traje punjenje?', 'How long does charging take?', 'Сколько длится зарядка?'),
    answer: l(
      'Postojeće Pogon informacije navode da potpuno punjenje obično traje do šest sati, u zavisnosti od baterije i početnog nivoa napunjenosti. Tačno vreme za konkretan primerak proverite sa Pogon timom.',
      'Current Pogon information says a full charge usually takes up to six hours, depending on the battery and its starting charge. Confirm the exact time for the specific bike with the Pogon team.',
      'Согласно актуальной информации Pogon, полная зарядка обычно занимает до шести часов — в зависимости от батареи и начального уровня заряда. Точное время для конкретного велосипеда уточняйте у команды Pogon.',
    ),
  },
  {
    question: l('Da li je bicikl legalan i da li je potrebna dozvola?', 'Is the bike road-legal and is a licence required?', 'Разрешён ли велосипед для дорог и нужны ли права?'),
    answer: l(
      'Objavljena konfiguracija navodi motor od 250 W i asistenciju do 25 km/h. Pravila mogu zavisiti od konkretne konfiguracije i načina upotrebe, zato pre vožnje proverite važeće propise i potvrđenu specifikaciju bicikla.',
      'The published configuration lists a 250 W motor and assistance up to 25 km/h. Rules can depend on the exact configuration and use, so check current regulations and the confirmed bike specification before riding.',
      'В опубликованной конфигурации указаны мотор 250 Вт и помощь до 25 км/ч. Правила могут зависеть от точной комплектации и способа использования, поэтому перед поездкой проверьте действующие нормы и подтверждённую спецификацию.',
    ),
  },
  {
    question: l('Da li mogu da platim na rate?', 'Can I pay in instalments?', 'Можно ли платить в рассрочку?'),
    answer: l(
      'Da. Checkout navodi plaćanje do 12 rata za kartice koje je izdala Banca Intesa. Broj rata i tačan konačni iznos prikazuje banka pre potvrde; konačan iznos može biti približno 10% viši.',
      'Yes. Checkout offers up to 12 instalments for cards issued by Banca Intesa. The bank displays the available instalment count and exact final amount before confirmation; the final amount may be approximately 10% higher.',
      'Да. В checkout доступно до 12 платежей для карт Banca Intesa. Банк показывает доступное число платежей и точную итоговую сумму до подтверждения; итог может быть примерно на 10% выше.',
    ),
  },
  {
    question: l('Kako funkcioniše garancija?', 'How does the warranty work?', 'Как работает гарантия?'),
    answer: l(
      'Pogon navodi dve godine garancije. Uslovi zavise od komponente i pravilne upotrebe; sačuvajte dokaz o kupovini i javite se podršci čim primetite problem.',
      'Pogon states a two-year warranty. Terms depend on the component and correct use; keep your proof of purchase and contact support as soon as you notice an issue.',
      'Pogon указывает двухлетнюю гарантию. Условия зависят от компонента и правильной эксплуатации; сохраните подтверждение покупки и обратитесь в поддержку при первых признаках проблемы.',
    ),
  },
  {
    question: l('Gde mogu da servisiram bicikl?', 'Where can I service the bike?', 'Где можно обслуживать велосипед?'),
    answer: l(
      'Servisna podrška je dostupna u više gradova. Najbližu lokaciju, dostupne usluge i radno vreme potvrdite porukom ili pozivom na 063 15 05 003.',
      'Service support is available in several cities. Confirm the nearest location, available services and opening hours by message or by calling +381 63 15 05 003.',
      'Сервисная поддержка доступна в нескольких городах. Ближайшую точку, перечень услуг и часы работы уточняйте сообщением или по телефону +381 63 15 05 003.',
    ),
  },
  {
    question: l(`Da li mogu da probam ${model} pre kupovine?`, `Can I try ${model} before buying?`, `Можно ли попробовать ${model} до покупки?`),
    answer: l(
      'Da. Besplatna test vožnja zakazuje se u Beogradu, Novom Sadu, Kragujevcu ili Nišu, uz unapred potvrđen termin i lokaciju.',
      'Yes. Free test rides can be booked in Belgrade, Novi Sad, Kragujevac or Niš, with the time and location confirmed in advance.',
      'Да. Бесплатный тест-драйв можно заранее согласовать в Белграде, Нови-Саде, Крагуеваце или Нише.',
    ),
  },
];

export const productDetails: Record<BikeKey, ProductDetails> = {
  cargo: {
    key: 'cargo',
    product: productByKey('cargo'),
    route: '/products/cargo/',
    eyebrow: l('Električni bicikl za posao i duge gradske rute', 'Work-ready electric bike for long city routes', 'Электровелосипед для работы и длинных городских маршрутов'),
    valueProposition: l('Dve Samsung baterije, do 140 km deklarisanog dometa i GPS zaštita za dan koji ne staje.', 'Dual Samsung batteries, up to 140 km of declared range and GPS protection for days that do not stop.', 'Две батареи Samsung, заявленный запас хода до 140 км и GPS-защита для длинного рабочего дня.'),
    seoTitle: l('Pogon Cargo | Električni bicikl do 140 km dometa', 'Pogon Cargo | Electric bike with up to 140 km range', 'Pogon Cargo | Электровелосипед с запасом хода до 140 км'),
    seoDescription: l('Pogon Cargo sa dve Samsung baterije ukupnog kapaciteta približno 1512 Wh, motorom 250 W, GPS zaštitom i hidrauličnim kočnicama.', 'Pogon Cargo with dual Samsung batteries totalling approximately 1512 Wh, a 250 W motor, GPS protection and hydraulic brakes.', 'Pogon Cargo с двумя батареями Samsung общей ёмкостью около 1512 Вт·ч, мотором 250 Вт, GPS-защитой и гидравлическими тормозами.'),
    gallery: [
      { src: '/Core main.jpg', alt: l('Pogon Cargo električni bicikl — glavni prikaz', 'Pogon Cargo electric bike — main view', 'Электровелосипед Pogon Cargo — главный вид'), width: 1086, height: 1448 },
      { src: '/Core 1.jpg', alt: l('Pogon Cargo električni bicikl — bočni prikaz', 'Pogon Cargo electric bike — side view', 'Электровелосипед Pogon Cargo — вид сбоку'), width: 1122, height: 1402 },
      { src: '/Core 2.jpg', alt: l('Pogon Cargo — detalj zadnjeg dela', 'Pogon Cargo — rear detail', 'Pogon Cargo — задняя часть'), width: 1122, height: 1402 },
      { src: '/Core 3.jpg', alt: l('Pogon Cargo — detalj rama i opreme', 'Pogon Cargo — frame and equipment detail', 'Pogon Cargo — рама и оснащение'), width: 1122, height: 1402 },
    ],
    highlights: [
      { value: '140 km', label: l('Domet do', 'Range up to', 'Запас хода до') },
      { value: '48 V · 14 + 17,5 Ah', label: l('Dve baterije', 'Dual battery', 'Две батареи') },
      { value: '250 W', label: l('Zadnji motor', 'Rear motor', 'Задний мотор') },
      { value: '25 km/h', label: l('Asistencija do', 'Assistance up to', 'Помощь до') },
      { value: '20″', label: l('Točkovi', 'Wheels', 'Колёса') },
      { value: 'Hidraulične', label: l('Kočnice', 'Brakes', 'Тормоза') },
    ],
    stories: [
      {
        eyebrow: l('Dve baterije. Manje prekida.', 'Two batteries. Fewer interruptions.', 'Две батареи. Меньше пауз.'),
        title: l('Do 140 km deklarisanog dometa', 'Up to 140 km of declared range', 'До 140 км заявленного запаса хода'),
        body: l('Kombinacija 48 V 14 Ah i 48 V 17,5 Ah baterije daje približno 1512 Wh energije za duge rute, dostavu i celodnevne obaveze. Stvarni domet zavisi od tereta, terena, temperature i nivoa asistencije.', 'A 48 V 14 Ah and 48 V 17.5 Ah battery combination provides approximately 1512 Wh for long routes, deliveries and full working days. Real range varies with load, terrain, temperature and assistance level.', 'Связка батарей 48 В 14 А·ч и 48 В 17,5 А·ч даёт около 1512 Вт·ч для длинных маршрутов и рабочего дня. Реальный запас зависит от нагрузки, рельефа, температуры и режима помощи.'),
        image: { src: '/Core 1.jpg', alt: l('Pogon Cargo sa dve baterije za duge gradske rute', 'Pogon Cargo with dual batteries for long city routes', 'Pogon Cargo с двумя батареями для длинных городских маршрутов'), width: 1122, height: 1402 },
      },
      {
        eyebrow: l('Kontrola kada je najvažnije', 'Control when it matters', 'Контроль в нужный момент'),
        title: l('GPS zaštita i hidraulične kočnice', 'GPS protection and hydraulic brakes', 'GPS-защита и гидравлические тормоза'),
        body: l('GPS sigurnosne funkcije pomažu da bicikl ostane pod nadzorom, dok hidraulične kočnice daju sigurniju i precizniju kontrolu u gradskom ritmu.', 'GPS security features help keep the bike monitored, while hydraulic brakes provide more confident and precise control in city traffic.', 'GPS-функции помогают держать велосипед под контролем, а гидравлические тормоза обеспечивают уверенное и точное торможение в городе.'),
        image: { src: '/Core 2.jpg', alt: l('Pogon Cargo detalj kočnica i zadnjeg točka', 'Pogon Cargo brake and rear-wheel detail', 'Pogon Cargo — тормоза и заднее колесо'), width: 1122, height: 1402 },
      },
      {
        eyebrow: l('Za svakodnevni rad', 'Built for everyday work', 'Для ежедневной работы'),
        title: l('Kenda fat tyre i Shimano menjač', 'Kenda fat tyres and Shimano gearing', 'Широкие шины Kenda и переключатель Shimano'),
        body: l('Široke Kenda anti-puncture gume donose stabilniji osećaj na lošijem asfaltu, a Shimano menjač pomaže da ritam vožnje prilagodiš ruti i teretu.', 'Wide Kenda anti-puncture tyres bring a steadier feel on rougher streets, while Shimano gearing helps match the ride to the route and load.', 'Широкие устойчивые к проколам шины Kenda увереннее чувствуют себя на плохом асфальте, а переключатель Shimano помогает подобрать темп под маршрут и груз.'),
        image: { src: '/Core 3.jpg', alt: l('Pogon Cargo detalj širokih guma i pogona', 'Pogon Cargo fat tyre and drivetrain detail', 'Pogon Cargo — широкие шины и трансмиссия'), width: 1122, height: 1402 },
      },
    ],
    features: [
      { icon: 'battery', title: l('Samsung dual battery', 'Samsung dual battery', 'Две батареи Samsung'), body: l('48 V 14 Ah + 48 V 17,5 Ah, približno 1512 Wh ukupno.', '48 V 14 Ah + 48 V 17.5 Ah, approximately 1512 Wh total.', '48 В 14 А·ч + 48 В 17,5 А·ч, около 1512 Вт·ч суммарно.') },
      { icon: 'gps', title: l('GPS zaštita', 'GPS protection', 'GPS-защита'), body: l('Sigurnosne funkcije za dodatni nadzor bicikla.', 'Security features for additional bike monitoring.', 'Функции безопасности для дополнительного контроля велосипеда.') },
      { icon: 'brake', title: l('Hidraulične kočnice', 'Hydraulic brakes', 'Гидравлические тормоза'), body: l('Preciznija kontrola kočenja u gradu i pod teretom.', 'More precise braking control in the city and under load.', 'Более точный контроль торможения в городе и с грузом.') },
      { icon: 'bike', title: l('Shimano menjač', 'Shimano gearing', 'Переключатель Shimano'), body: l('Prilagođavanje prenosa promenama rute i opterećenja.', 'Gearing that adapts to route and load changes.', 'Передачи для разных маршрутов и нагрузки.') },
      { icon: 'shield', title: l('Kenda anti-puncture gume', 'Kenda anti-puncture tyres', 'Шины Kenda с защитой от проколов'), body: l('Široke gume za stabilniji osećaj na gradskim neravninama.', 'Wide tyres for a steadier feel over city imperfections.', 'Широкие шины для устойчивости на неровных улицах.') },
      { icon: 'wrench', title: l('Servis i podrška', 'Service and support', 'Сервис и поддержка'), body: l('Podrška je dostupna u više gradova uz prethodnu potvrdu.', 'Support is available in several cities, subject to confirmation.', 'Поддержка доступна в нескольких городах по предварительному согласованию.') },
    ],
    specifications: [
      { title: l('Performanse', 'Performance', 'Характеристики'), items: [
        { label: l('Motor', 'Motor', 'Мотор'), value: l('250 W, u zadnjem točku', '250 W rear hub', '250 Вт, заднее колесо') },
        { label: l('Asistencija', 'Assistance', 'Помощь'), value: l('Do 25 km/h', 'Up to 25 km/h', 'До 25 км/ч') },
        { label: l('Deklarisani domet', 'Declared range', 'Заявленный запас хода'), value: l('Do 140 km', 'Up to 140 km', 'До 140 км') },
      ] },
      { title: l('Baterija', 'Battery', 'Батарея'), items: [
        { label: l('Konfiguracija', 'Configuration', 'Конфигурация'), value: l('48 V 14 Ah + 48 V 17,5 Ah', '48 V 14 Ah + 48 V 17.5 Ah', '48 В 14 А·ч + 48 В 17,5 А·ч') },
        { label: l('Ukupna energija', 'Total energy', 'Общая энергия'), value: l('Približno 1512 Wh', 'Approximately 1512 Wh', 'Около 1512 Вт·ч') },
        { label: l('Ćelije', 'Cells', 'Ячейки'), value: l('Samsung', 'Samsung', 'Samsung') },
      ] },
      { title: l('Ram i dimenzije', 'Frame and dimensions', 'Рама и размеры'), items: [
        { label: l('Ram', 'Frame', 'Рама'), value: l('Čelični ram', 'Steel frame', 'Стальная рама') },
        { label: l('Tip', 'Type', 'Тип'), value: l('Radni fat tyre e-bike', 'Work-focused fat tyre e-bike', 'Рабочий электровелосипед с широкими шинами') },
      ] },
      { title: l('Komponente i tehnologija', 'Components and technology', 'Компоненты и технологии'), items: [
        { label: l('Kočnice', 'Brakes', 'Тормоза'), value: l('Hidraulične', 'Hydraulic', 'Гидравлические') },
        { label: l('Menjač', 'Gearing', 'Переключатель'), value: l('Shimano', 'Shimano', 'Shimano') },
        { label: l('Točkovi i gume', 'Wheels and tyres', 'Колёса и шины'), value: l('20 inča, Kenda fat tyre', '20-inch Kenda fat tyres', '20 дюймов, широкие Kenda') },
        { label: l('Sigurnost', 'Security', 'Безопасность'), value: l('GPS funkcije', 'GPS features', 'GPS-функции') },
      ] },
    ],
    whatsInBoxNote: l('Tačan sadržaj paketa nije objavljen u postojećim Pogon podacima. Pre poručivanja Pogon tim će potvrditi da li paket sadrži punjač, dokumentaciju ili dodatnu opremu.', 'The exact box contents are not published in the current Pogon data. Before ordering, the Pogon team will confirm whether the package includes a charger, documentation or additional equipment.', 'Точный состав комплекта не опубликован в текущих данных Pogon. Перед заказом команда подтвердит, входят ли в комплект зарядное устройство, документы или дополнительное оснащение.'),
    faq: [
      { question: l('Koliki je stvarni domet?', 'What is the real-world range?', 'Каков реальный запас хода?'), answer: l('Deklarisani maksimum je do 140 km. Stvarni domet zavisi od tereta, terena, temperature, vetra, pritiska u gumama i nivoa asistencije.', 'The declared maximum is up to 140 km. Real range depends on load, terrain, temperature, wind, tyre pressure and assistance level.', 'Заявленный максимум — до 140 км. Реальный запас зависит от груза, рельефа, температуры, ветра, давления в шинах и режима помощи.') },
      { question: l('Kako funkcioniše GPS?', 'How does GPS work?', 'Как работает GPS?'), answer: l('Pogon navodi GPS sigurnosne funkcije. Način aktivacije, aplikaciju i uslove korišćenja potvrdite sa timom pre preuzimanja, jer ti detalji nisu objavljeni u projektu.', 'Pogon lists GPS security features. Confirm activation, app and usage terms with the team before collection because those details are not published in the project.', 'Pogon указывает GPS-функции безопасности. Способ активации, приложение и условия использования уточните у команды до получения: эти детали не опубликованы в проекте.') },
      ...sharedFaq('Cargo'),
    ],
    comparison: {
      range: l('Do 140 km', 'Up to 140 km', 'До 140 км'),
      battery: l('Dve, ≈1512 Wh', 'Dual, ≈1512 Wh', 'Две, ≈1512 Вт·ч'),
      frame: l('Čelični', 'Steel', 'Стальная'),
      wheels: l('20 inča', '20 inches', '20 дюймов'),
      foldable: false,
      gps: true,
      bestFor: l('Dostava, posao i duge rute', 'Delivery, work and long routes', 'Доставка, работа и длинные маршруты'),
    },
  },
  core: {
    key: 'core',
    product: productByKey('core'),
    route: '/products/core/',
    eyebrow: l('Sklopivi električni bicikl za grad', 'Folding electric bike for the city', 'Складной электровелосипед для города'),
    valueProposition: l('Sklopi. Ubaci. Vozi. Kompaktan gradski e-bike za stan, kancelariju i gepek automobila.', 'Fold it. Load it. Ride it. A compact city e-bike for apartments, offices and car boots.', 'Сложи. Погрузи. Едь. Компактный городской e-bike для квартиры, офиса и багажника.'),
    seoTitle: l('Pogon Core | Sklopivi električni bicikl za grad', 'Pogon Core | Folding electric bike for the city', 'Pogon Core | Складной городской электровелосипед'),
    seoDescription: l('Pogon Core sklopivi električni bicikl sa zadnjim motorom 250 W, baterijama 48 V 14 Ah i 48 V 17,5 Ah, točkovima od 20 inča i dometom do 140 km.', 'Pogon Core folding electric bike with a 250 W rear motor, 48 V 14 Ah and 48 V 17.5 Ah batteries, 20-inch wheels and up to 140 km range.', 'Складной электровелосипед Pogon Core с задним мотором 250 Вт, батареями 48 В 14 А·ч и 48 В 17,5 А·ч, колёсами 20 дюймов и запасом хода до 140 км.'),
    gallery: [
      { src: '/Cargo Main.jpg', alt: l('Pogon Core sklopivi električni bicikl — glavni prikaz', 'Pogon Core folding electric bike — main view', 'Складной электровелосипед Pogon Core — главный вид'), width: 1122, height: 1402 },
      { src: '/Cargo fold.jpg', alt: l('Pogon Core u sklopljenom položaju', 'Pogon Core in its folded position', 'Pogon Core в сложенном виде'), width: 1122, height: 1402 },
      { src: '/Cargo 1.jpg', alt: l('Pogon Core — bočni prikaz', 'Pogon Core — side view', 'Pogon Core — вид сбоку'), width: 1122, height: 1402 },
      { src: '/Cargo 2.jpg', alt: l('Pogon Core — detalj rama', 'Pogon Core — frame detail', 'Pogon Core — деталь рамы'), width: 1122, height: 1402 },
    ],
    highlights: [
      { value: '140 km', label: l('Domet do', 'Range up to', 'Запас хода до') },
      { value: '48 V · 14 + 17,5 Ah', label: l('Dve baterije', 'Dual battery', 'Две батареи') },
      { value: '250 W', label: l('Zadnji motor', 'Rear motor', 'Задний мотор') },
      { value: '25 km/h', label: l('Asistencija do', 'Assistance up to', 'Помощь до') },
      { value: '20″', label: l('Točkovi', 'Wheels', 'Колёса') },
      { value: '≈25 kg', label: l('Masa', 'Weight', 'Вес') },
    ],
    stories: [
      {
        eyebrow: l('Jedan potez menja prostor', 'One move changes the space', 'Одно движение меняет пространство'),
        title: l('Sklopi. Ubaci. Vozi.', 'Fold it. Load it. Ride it.', 'Сложи. Погрузи. Едь.'),
        body: l('Sklopivi format pomaže kada bicikl treba da stane u stan, kancelariju ili gepek automobila. Core je napravljen za gradsku mobilnost koja se prilagođava tvom prostoru.', 'The folding format helps when the bike needs to fit into an apartment, office or car boot. Core is designed for city mobility that adapts to your space.', 'Складной формат удобен, когда велосипед нужно хранить в квартире, офисе или багажнике. Core подстраивается под городской ритм и ваше пространство.'),
        image: { src: '/Cargo fold.jpg', alt: l('Sklopljeni Pogon Core spreman za odlaganje', 'Folded Pogon Core ready for storage', 'Сложенный Pogon Core готов к хранению'), width: 1122, height: 1402 },
      },
      {
        eyebrow: l('Kompaktan, ali električan', 'Compact, yet electric', 'Компактный, но электрический'),
        title: l('250 W za svakodnevni gradski ritam', '250 W for the everyday city rhythm', '250 Вт для ежедневного города'),
        body: l('Zadnji motor od 250 W i asistencija do 25 km/h olakšavaju polaske, ravne deonice i svakodnevne obaveze bez pretvaranja Core-a u glomazan bicikl.', 'A 250 W rear motor and assistance up to 25 km/h make starts, flat routes and daily errands easier without turning Core into a bulky bike.', 'Задний мотор 250 Вт и помощь до 25 км/ч облегчают старт и ежедневные поездки, сохраняя компактность Core.'),
        image: { src: '/Cargo 1.jpg', alt: l('Pogon Core za kompaktnu gradsku vožnju', 'Pogon Core for compact city riding', 'Pogon Core для компактных городских поездок'), width: 1122, height: 1402 },
      },
      {
        eyebrow: l('Mala mera, velika praktičnost', 'Small footprint, everyday practicality', 'Малый размер, большая практичность'),
        title: l('20 inča za stabilnu vožnju', '20 inches for a stable ride', '20 дюймов для устойчивой езды'),
        body: l('Točkovi od 20 inča i približna masa od 25 kg daju Core-u stabilan format uz praktičan sklopivi ram. Pre kupovine ga probaj sklopiti i podići.', '20-inch wheels and an approximate 25 kg weight give Core a stable format with a practical folding frame. Try folding and lifting it before buying.', 'Колёса 20 дюймов и масса около 25 кг обеспечивают устойчивость и практичность складной рамы. Перед покупкой попробуйте сложить и поднять велосипед.'),
        image: { src: '/Cargo 2.jpg', alt: l('Pogon Core detalj kompaktnog sklopa', 'Pogon Core compact frame detail', 'Pogon Core — деталь компактной рамы'), width: 1122, height: 1402 },
      },
    ],
    features: [
      { icon: 'fold', title: l('Sklopivi dizajn', 'Folding design', 'Складная конструкция'), body: l('Za lakše odlaganje u stanu, kancelariji ili automobilu.', 'For easier storage in an apartment, office or car.', 'Для удобного хранения в квартире, офисе или автомобиле.') },
      { icon: 'battery', title: l('Dve baterije 48 V', 'Dual 48 V batteries', 'Две батареи 48 В'), body: l('48 V 14 Ah + 48 V 17,5 Ah, ukupno približno 1512 Wh.', '48 V 14 Ah + 48 V 17.5 Ah, approximately 1512 Wh total.', '48 В 14 А·ч + 48 В 17,5 А·ч, около 1512 Вт·ч суммарно.') },
      { icon: 'bike', title: l('250 W zadnji motor', '250 W rear motor', 'Задний мотор 250 Вт'), body: l('Električna asistencija za gradske polaske i rutinu.', 'Electric assistance for city starts and daily routines.', 'Электропомощь для стартов и повседневных поездок.') },
      { icon: 'sparkles', title: l('20-inčni točkovi', '20-inch wheels', 'Колёса 20 дюймов'), body: l('Stabilan format uz praktičnu sklopivu konstrukciju.', 'A stable format with a practical folding design.', 'Устойчивый формат с практичной складной конструкцией.') },
      { icon: 'shield', title: l('2 godine garancije', '2-year warranty', 'Гарантия 2 года'), body: l('Pogon podrška uz dokaz o kupovini i pravilnu upotrebu.', 'Pogon support with proof of purchase and correct use.', 'Поддержка Pogon при наличии подтверждения покупки и правильной эксплуатации.') },
      { icon: 'wrench', title: l('Servis i podrška', 'Service and support', 'Сервис и поддержка'), body: l('Najbližu servisnu lokaciju i usluge potvrdite sa timom.', 'Confirm the nearest service location and available services with the team.', 'Ближайший сервис и доступные услуги уточняйте у команды.') },
    ],
    specifications: [
      { title: l('Performanse', 'Performance', 'Характеристики'), items: [
        { label: l('Motor', 'Motor', 'Мотор'), value: l('250 W, u zadnjem točku', '250 W rear hub', '250 Вт, заднее колесо') },
        { label: l('Asistencija', 'Assistance', 'Помощь'), value: l('Do 25 km/h', 'Up to 25 km/h', 'До 25 км/ч') },
        { label: l('Deklarisani domet', 'Declared range', 'Заявленный запас хода'), value: l('Do 140 km', 'Up to 140 km', 'До 140 км') },
      ] },
      { title: l('Baterija', 'Battery', 'Батарея'), items: [
        { label: l('Konfiguracija', 'Configuration', 'Конфигурация'), value: l('48 V 14 Ah + 48 V 17,5 Ah', '48 V 14 Ah + 48 V 17.5 Ah', '48 В 14 А·ч + 48 В 17,5 А·ч') },
        { label: l('Ukupna energija', 'Total energy', 'Общая энергия'), value: l('Približno 1512 Wh', 'Approximately 1512 Wh', 'Около 1512 Вт·ч') },
      ] },
      { title: l('Ram i dimenzije', 'Frame and dimensions', 'Рама и размеры'), items: [
        { label: l('Ram', 'Frame', 'Рама'), value: l('Sklopivi', 'Folding', 'Складная') },
        { label: l('Točkovi', 'Wheels', 'Колёса'), value: l('20 inča', '20 inches', '20 дюймов') },
        { label: l('Masa', 'Weight', 'Вес'), value: l('Približno 25 kg', 'Approximately 25 kg', 'Около 25 кг') },
      ] },
    ],
    whatsInBoxNote: l('Tačan sadržaj paketa nije objavljen u postojećim Pogon podacima. Pre poručivanja Pogon tim će potvrditi da li Core paket sadrži punjač, dokumentaciju ili dodatnu opremu.', 'The exact box contents are not published in the current Pogon data. Before ordering, the Pogon team will confirm whether the Core package includes a charger, documentation or additional equipment.', 'Точный состав комплекта не опубликован. Перед заказом команда Pogon подтвердит, входят ли в комплект Core зарядное устройство, документы или дополнительное оснащение.'),
    faq: [
      { question: l('Koliki je domet Core modela?', 'What is the Core range?', 'Каков запас хода Core?'), answer: l('Deklarisani domet je do 140 km. Stvarni rezultat zavisi od mase, terena, temperature, pritiska u gumama i nivoa asistencije.', 'The declared range is up to 140 km. Real results depend on weight, terrain, temperature, tyre pressure and assistance level.', 'Заявленный запас хода — до 140 км. Реальный результат зависит от веса, рельефа, температуры, давления в шинах и режима помощи.') },
      { question: l('Da li Core može da stane u gepek?', 'Can Core fit in a car boot?', 'Поместится ли Core в багажник?'), answer: l('Sklopivi dizajn je namenjen lakšem transportu, ali dimenzije gepeka se razlikuju. Izmerite otvor i prostor, a na test vožnji probajte sklapanje pre odluke.', 'The folding design is intended to make transport easier, but car boots vary. Measure the opening and space, and try folding the bike during a test ride before deciding.', 'Складная конструкция упрощает перевозку, но багажники различаются. Измерьте проём и пространство и попробуйте сложить велосипед на тест-драйве.') },
      ...sharedFaq('Core'),
    ],
    comparison: {
      range: l('Do 140 km', 'Up to 140 km', 'До 140 км'),
      battery: l('Dve, 48 V 14 Ah + 17,5 Ah', 'Dual, 48 V 14 Ah + 17.5 Ah', 'Две, 48 В 14 А·ч + 17,5 А·ч'),
      frame: l('Sklopivi', 'Folding', 'Складная'),
      wheels: l('20 inča', '20 inches', '20 дюймов'),
      foldable: true,
      gps: false,
      bestFor: l('Stan, kancelarija i kombinovani prevoz', 'Apartments, offices and mixed transport', 'Квартира, офис и комбинированные поездки'),
    },
  },
  glide: {
    key: 'glide',
    product: productByKey('glide'),
    route: '/products/glide/',
    eyebrow: l('Premium gradski električni bicikl', 'Premium city electric bike', 'Премиальный городской электровелосипед'),
    valueProposition: l('Aluminijumski ram, baterija od 1200 Wh i tehnologija za mirniju svakodnevnu gradsku vožnju.', 'An aluminium frame, 1200 Wh battery and technology for calmer everyday city riding.', 'Алюминиевая рама, батарея 1200 Вт·ч и технологии для комфортных ежедневных поездок.'),
    seoTitle: l('Pogon Glide | Premium gradski električni bicikl', 'Pogon Glide | Premium city electric bike', 'Pogon Glide | Премиальный городской электровелосипед'),
    seoDescription: l('Pogon Glide premium gradski e-bike sa aluminijumskim ramom, baterijom 1200 Wh, dometom do 90 km, GPS funkcijama i NFC karticama.', 'Pogon Glide premium city e-bike with an aluminium frame, 1200 Wh battery, up to 90 km range, GPS features and NFC cards.', 'Pogon Glide — премиальный городской e-bike с алюминиевой рамой, батареей 1200 Вт·ч, запасом до 90 км, GPS и NFC-картами.'),
    gallery: [
      { src: '/Glide main.jpg', alt: l('Pogon Glide premium gradski električni bicikl — glavni prikaz', 'Pogon Glide premium city electric bike — main view', 'Pogon Glide — премиальный городской электровелосипед, главный вид'), width: 941, height: 1672 },
      { src: '/Glide 1.jpg', alt: l('Pogon Glide — bočni prikaz', 'Pogon Glide — side view', 'Pogon Glide — вид сбоку'), width: 1254, height: 1254 },
      { src: '/Glide 2.jpg', alt: l('Pogon Glide — detalj rama', 'Pogon Glide — frame detail', 'Pogon Glide — деталь рамы'), width: 1254, height: 1254 },
      { src: '/Glide 4.jpg', alt: l('Pogon Glide — gradska oprema', 'Pogon Glide — city equipment', 'Pogon Glide — городское оснащение'), width: 1254, height: 1254 },
    ],
    highlights: [
      { value: '90 km', label: l('Domet do', 'Range up to', 'Запас хода до') },
      { value: '1200 Wh', label: l('Baterija', 'Battery', 'Батарея') },
      { value: '250 W', label: l('Zadnji motor', 'Rear motor', 'Задний мотор') },
      { value: 'GPS', label: l('Zaštita', 'Protection', 'Защита') },
      { value: 'NFC', label: l('Otključavanje', 'Unlocking', 'Разблокировка') },
      { value: 'Hidraulične', label: l('Kočnice', 'Brakes', 'Тормоза') },
    ],
    stories: [
      {
        eyebrow: l('Premium city e-bike', 'Premium city e-bike', 'Премиальный городской e-bike'),
        title: l('Grad klizi lakše', 'Let the city glide', 'Город становится легче'),
        body: l('Aluminijumski ram i gradska geometrija pozicioniraju Glide kao udoban izbor za posao, obaveze i svakodnevne gradske relacije.', 'An aluminium frame and city geometry position Glide as a comfortable choice for work, errands and everyday urban routes.', 'Алюминиевая рама и городская геометрия делают Glide комфортным выбором для работы, дел и ежедневных маршрутов.'),
        image: { src: '/Glide 1.jpg', alt: l('Pogon Glide premium električni bicikl za grad', 'Pogon Glide premium electric bike for the city', 'Премиальный городской электровелосипед Pogon Glide'), width: 1254, height: 1254 },
      },
      {
        eyebrow: l('Energija za ceo gradski dan', 'Energy for a full city day', 'Энергия на весь городской день'),
        title: l('1200 Wh i do 90 km dometa', '1200 Wh and up to 90 km range', '1200 Вт·ч и до 90 км'),
        body: l('Velika baterija daje rezervu za duže gradske rute. Deklarisani maksimum nije garantovana kilometraža: teren, temperatura, masa i nivo asistencije menjaju rezultat.', 'The large battery provides reserve for longer city routes. The declared maximum is not guaranteed mileage: terrain, temperature, weight and assistance level change the result.', 'Большая батарея даёт запас для длинных городских маршрутов. Заявленный максимум не гарантирован: результат меняют рельеф, температура, вес и режим помощи.'),
        image: { src: '/Glide 2.jpg', alt: l('Pogon Glide detalj aluminijumskog rama i baterije', 'Pogon Glide aluminium frame and battery detail', 'Pogon Glide — алюминиевая рама и батарея'), width: 1254, height: 1254 },
      },
      {
        eyebrow: l('Pametna svakodnevica', 'Smarter everyday riding', 'Умнее каждый день'),
        title: l('GPS zaštita i NFC kartice', 'GPS protection and NFC cards', 'GPS-защита и NFC-карты'),
        body: l('GPS sigurnosne funkcije i NFC kartice za otključavanje donose praktičniji način da započneš i završiš svaku gradsku vožnju.', 'GPS security features and NFC unlocking cards create a more practical way to start and finish every city ride.', 'GPS-функции безопасности и NFC-карты делают начало и завершение каждой поездки удобнее.'),
        image: { src: '/Glide 4.jpg', alt: l('Pogon Glide tehnološke funkcije za gradsku vožnju', 'Pogon Glide technology for city riding', 'Технологии Pogon Glide для города'), width: 1254, height: 1254 },
      },
    ],
    features: [
      { icon: 'sparkles', title: l('Aluminijumski ram', 'Aluminium frame', 'Алюминиевая рама'), body: l('Premium gradski format za svakodnevnu vožnju.', 'A premium city format for everyday riding.', 'Премиальный городской формат для ежедневных поездок.') },
      { icon: 'battery', title: l('1200 Wh baterija', '1200 Wh battery', 'Батарея 1200 Вт·ч'), body: l('Energetska rezerva za duže gradske relacije.', 'Energy reserve for longer city routes.', 'Запас энергии для длинных городских маршрутов.') },
      { icon: 'gps', title: l('GPS zaštita', 'GPS protection', 'GPS-защита'), body: l('Sigurnosne funkcije za dodatni nadzor bicikla.', 'Security features for additional bike monitoring.', 'Функции безопасности для дополнительного контроля.') },
      { icon: 'lock', title: l('NFC kartice', 'NFC cards', 'NFC-карты'), body: l('Praktično otključavanje bez klasičnog ključa.', 'Convenient unlocking without a traditional key.', 'Удобная разблокировка без обычного ключа.') },
      { icon: 'brake', title: l('Hidraulične kočnice', 'Hydraulic brakes', 'Гидравлические тормоза'), body: l('Kontrolisanije kočenje u svakodnevnom saobraćaju.', 'More controlled braking in everyday traffic.', 'Более точное торможение в ежедневном потоке.') },
      { icon: 'bike', title: l('Shimano menjač', 'Shimano gearing', 'Переключатель Shimano'), body: l('Prenos prilagođen promenama gradskog ritma.', 'Gearing suited to changing city rhythms.', 'Передачи для меняющегося городского ритма.') },
    ],
    specifications: [
      { title: l('Performanse', 'Performance', 'Характеристики'), items: [
        { label: l('Motor', 'Motor', 'Мотор'), value: l('250 W, u zadnjem točku', '250 W rear hub', '250 Вт, заднее колесо') },
        { label: l('Deklarisani domet', 'Declared range', 'Заявленный запас хода'), value: l('Do 90 km', 'Up to 90 km', 'До 90 км') },
      ] },
      { title: l('Baterija', 'Battery', 'Батарея'), items: [
        { label: l('Kapacitet', 'Capacity', 'Ёмкость'), value: l('1200 Wh', '1200 Wh', '1200 Вт·ч') },
      ] },
      { title: l('Ram i dimenzije', 'Frame and dimensions', 'Рама и размеры'), items: [
        { label: l('Ram', 'Frame', 'Рама'), value: l('Aluminijumski', 'Aluminium', 'Алюминиевая') },
        { label: l('Nosivost', 'Payload', 'Нагрузка'), value: l('Do 120 kg', 'Up to 120 kg', 'До 120 кг') },
      ] },
      { title: l('Komponente i tehnologija', 'Components and technology', 'Компоненты и технологии'), items: [
        { label: l('Kočnice', 'Brakes', 'Тормоза'), value: l('Hidraulične', 'Hydraulic', 'Гидравлические') },
        { label: l('Menjač', 'Gearing', 'Переключатель'), value: l('Shimano', 'Shimano', 'Shimano') },
        { label: l('Sigurnost', 'Security', 'Безопасность'), value: l('GPS funkcije', 'GPS features', 'GPS-функции') },
        { label: l('Otključavanje', 'Unlocking', 'Разблокировка'), value: l('NFC kartice', 'NFC cards', 'NFC-карты') },
      ] },
    ],
    whatsInBoxNote: l('Tačan sadržaj paketa nije objavljen u postojećim Pogon podacima. Pre poručivanja Pogon tim će potvrditi da li Glide paket sadrži punjač, NFC kartice, dokumentaciju ili dodatnu opremu.', 'The exact box contents are not published in the current Pogon data. Before ordering, the Pogon team will confirm whether the Glide package includes a charger, NFC cards, documentation or additional equipment.', 'Точный состав комплекта не опубликован. Перед заказом команда Pogon подтвердит, входят ли в комплект Glide зарядное устройство, NFC-карты, документы или дополнительное оснащение.'),
    faq: [
      { question: l('Koliki je stvarni domet?', 'What is the real-world range?', 'Каков реальный запас хода?'), answer: l('Deklarisani maksimum je do 90 km. Stvarni domet zavisi od terena, temperature, mase, vetra, pritiska u gumama i nivoa asistencije.', 'The declared maximum is up to 90 km. Real range depends on terrain, temperature, weight, wind, tyre pressure and assistance level.', 'Заявленный максимум — до 90 км. Реальный запас зависит от рельефа, температуры, веса, ветра, давления в шинах и режима помощи.') },
      { question: l('Kako rade GPS i NFC?', 'How do GPS and NFC work?', 'Как работают GPS и NFC?'), answer: l('Pogon navodi GPS sigurnosne funkcije i NFC kartice za otključavanje. Način aktivacije i detalje aplikacije potvrdite sa timom pre preuzimanja, jer nisu objavljeni u projektu.', 'Pogon lists GPS security features and NFC unlocking cards. Confirm activation and app details with the team before collection because they are not published in the project.', 'Pogon указывает GPS-функции и NFC-карты для разблокировки. Активацию и детали приложения уточните у команды до получения: они не опубликованы в проекте.') },
      ...sharedFaq('Glide'),
    ],
    comparison: {
      range: l('Do 90 km', 'Up to 90 km', 'До 90 км'),
      battery: l('1200 Wh', '1200 Wh', '1200 Вт·ч'),
      frame: l('Aluminijumski', 'Aluminium', 'Алюминиевая'),
      wheels: l('Veličina nije objavljena', 'Size not published', 'Размер не опубликован'),
      foldable: false,
      gps: true,
      bestFor: l('Premium svakodnevna gradska vožnja', 'Premium everyday city riding', 'Премиальные ежедневные поездки по городу'),
    },
  },
};

export const bikeProductDetails = Object.values(productDetails);

export function getProductDetails(key: string | undefined): ProductDetails | null {
  return key === 'cargo' || key === 'core' || key === 'glide' ? productDetails[key] : null;
}

export function localize<T>(value: Localized<T>, language: SiteLanguage): T {
  return value[language];
}

export function languageFromSearch(search: string): SiteLanguage {
  const requested = new URLSearchParams(search).get('lang');
  return requested === 'en' || requested === 'ru' ? requested : 'sr';
}
