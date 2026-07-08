import { FormEvent, useCallback, useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ImageWithFallback } from './components/ImageWithFallback';
import { Battery, Zap, Gauge, Shield, ArrowRight, Star, MapPin, Clock, Instagram, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, X, MessageCircle, Phone, CalendarCheck, CheckCircle2, ChevronDown, Truck, Wrench, Calculator, Car } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ScrollyCanvas } from './components/ScrollyCanvas';
import { Overlay } from './components/Overlay';
import { LeadContactModal } from './components/LeadContactModal';
const AdminLeads = lazy(() => import('./components/AdminLeads').then((m) => ({ default: m.AdminLeads })));
import { submitLead } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { publicAsset } from '../lib/assets';

type Language = 'en' | 'sr' | 'ru';
type Localized<T> = Record<Language, T>;

const homeCopyEn = {
  heroTitle: 'Get moving',
  heroSub: 'Electric bikes for city commutes and plans that don’t wait.',
  heroPrimary: 'Book a test ride',
  heroSecondary: 'Call us',
  finalTitle: 'Choose a model and kickstart your city routine',
  finalBody: "Message us on WhatsApp and we'll help you pick the right Pogon.",
  finalPrimary: 'View models',
  finalSecondary: 'Message on WhatsApp',
  badge: 'Built for Serbian streets',
  premiumSeries: 'Premium Series',
  modelsCopy: 'Three models. One vision. Endless possibilities.',
  bestSeller: 'Best seller',
  recommended: 'Recommended',
  newBadge: 'New',
  buyNow: 'Buy now',
  onSaleBadge: 'On sale',
  youSave: 'You save',
  glideDescription: 'A comfortable, reliable electric city bike for everyday use.',
  coreDescription: 'A foldable fat‑tyre city model for extra comfort and control.',
  cargoDescription: 'A compact fat‑tyre work bike for urban transport and deliveries.',
  rearHub: 'Rear hub motor',
  range: 'Range',
  motor: 'Motor',
  weight: 'Weight',
  fromText: 'from',
  upTo: 'Up to',
  power: 'Power',
  topSpeed: 'Max speed',
  clickSpecs: 'Click for specs',
  close: 'Close',
  clickHide: 'Tap again to hide',
  perMonth: 'per month',
  customerReviews: 'Voices of Our Riders',
};

const homeCopySr = {
  heroTitle: 'Pokreni se',
  heroSub: 'Električni bicikli za grad, tempo i planove koji ne čekaju.',
  heroPrimary: 'Zakaži test vožnju',
  heroSecondary: 'Pozovi nas',
  finalTitle: 'Izaberi model i pokreni gradsku rutinu',
  finalBody: 'Javi nam se na WhatsApp i pomoći ćemo ti da izabereš pravi Pogon.',
  finalPrimary: 'Pogledaj modele',
  finalSecondary: 'Javi se na WhatsApp',
  badge: 'Pravljeno za ulice Srbije',
  premiumSeries: 'Premium serija',
  modelsCopy: 'Tri modela. Jedna vizija. Beskonačne mogućnosti.',
  bestSeller: 'Najprodavaniji',
  recommended: 'Preporučeno',
  newBadge: 'Novo',
  buyNow: 'Kupi Sada',
  onSaleBadge: 'Na akciji',
  youSave: 'Uštedite',
  glideDescription: 'Gradski e-bicikl za udobnu i pouzdanu vožnju svaki dan.',
  coreDescription: 'Skalabilni foldable model sa debelim gumama za kontrolu i stil.',
  cargoDescription: 'Kompaktan radni e-bicikl za gradske dostave i nošenje tereta.',
  rearHub: 'Zadnji motor',
  range: 'Domet',
  motor: 'Motor',
  weight: 'Težina',
  fromText: 'od',
  upTo: 'Do',
  power: 'Snaga',
  topSpeed: 'Maks. brzina',
  clickSpecs: 'Kliknite za specifikacije',
  close: 'Zatvori',
  clickHide: 'Kliknite ponovo da sakrijete',
  perMonth: 'po mesecu',
  customerReviews: 'Glasovi Naših Vozača',
};

const homeCopyRu = {
  heroTitle: 'Двигайся свободно',
  heroSub: 'Электровелосипеды для города, ежедневных поездок и планов без ожидания.',
  heroPrimary: 'Записаться на тест-драйв',
  heroSecondary: 'Позвонить нам',
  finalTitle: 'Выберите модель и начните новый городской ритм',
  finalBody: 'Напишите нам в WhatsApp, и мы поможем выбрать подходящий Pogon.',
  finalPrimary: 'Смотреть модели',
  finalSecondary: 'Написать в WhatsApp',
  badge: 'Создано для улиц Сербии',
  premiumSeries: 'Премиальная серия',
  modelsCopy: 'Три модели. Одна идея. Больше свободы каждый день.',
  bestSeller: 'Хит продаж',
  recommended: 'Рекомендуем',
  newBadge: 'Новинка',
  buyNow: 'Купить сейчас',
  onSaleBadge: 'Акция',
  youSave: 'Экономия',
  glideDescription: 'Комфортный и надежный городской электровелосипед на каждый день.',
  coreDescription: 'Складная городская модель с широкими шинами для комфорта и контроля.',
  cargoDescription: 'Компактный рабочий электровелосипед для городских поездок и доставок.',
  rearHub: 'Задний мотор-колесо',
  range: 'Запас хода',
  motor: 'Мотор',
  weight: 'Вес',
  fromText: 'от',
  upTo: 'До',
  power: 'Мощность',
  topSpeed: 'Макс. скорость',
  clickSpecs: 'Нажмите для характеристик',
  close: 'Закрыть',
  clickHide: 'Нажмите еще раз, чтобы скрыть',
  perMonth: 'в месяц',
  customerReviews: 'Отзывы наших райдеров',
};

const homeCopy: Localized<typeof homeCopyEn> = {
  en: homeCopyEn,
  sr: homeCopySr,
  ru: homeCopyRu,
};

function ScrollColorWord({
  word,
  index,
  total,
  progress,
  isLast,
}: {
  word: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  isLast: boolean;
}) {
  const start = index / total;
  const end = Math.min(1, start + 0.18);
  const color = useTransform(progress, [start, end], ['rgba(3,2,19,0.18)', 'rgba(3,2,19,1)']);

  return (
    <motion.span style={{ color }} className="inline-block">
      {word}
      {isLast ? '' : '\u00a0'}
    </motion.span>
  );
}

function ScrollColorSentence({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const words = text.split(' ');
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 82%', 'end 42%'],
  });

  return (
    <div ref={ref} className="mx-auto max-w-3xl">
      <p className="text-balance text-[1.35rem] font-black leading-[1.08] tracking-tight sm:text-3xl lg:text-4xl">
        {words.map((word, index) => (
          <ScrollColorWord
            key={`${word}-${index}`}
            word={word}
            index={index}
            total={words.length}
            progress={scrollYProgress}
            isLast={index === words.length - 1}
          />
        ))}
      </p>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>('sr');
  const [activeSpecs, setActiveSpecs] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState(0);
  const [activeTechnologyCard, setActiveTechnologyCard] = useState<number | null>(null);
  const [activeGalleryImages, setActiveGalleryImages] = useState<Record<string, number>>({});
  const [activeLightboxProduct, setActiveLightboxProduct] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const [leadModalSource, setLeadModalSource] = useState<string | null>(null);
  const [isContactWidgetOpen, setIsContactWidgetOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [testRideForm, setTestRideForm] = useState({ name: '', phone: '', city: '', preferredTime: '' });
  const [testRideFormStatus, setTestRideFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [popupPhone, setPopupPhone] = useState('');
  const [popupSubmitted, setPopupSubmitted] = useState(false);
  const [popupSubmitting, setPopupSubmitting] = useState(false);
  const [popupError, setPopupError] = useState('');
  const [isRangeCalculatorOpen, setIsRangeCalculatorOpen] = useState(false);
  const [rangeCalculator, setRangeCalculator] = useState({
    riderKg: 80,
    averageSpeed: 22,
    voltage: 48,
    ampHours: 25,
    chemistry: 'lithium' as 'lithium' | 'lead',
  });
  const [savingsQuiz, setSavingsQuiz] = useState({
    dailyKm: 20,
    fuelPrice: 200,
    fuelConsumption: 9,
  });
  const popupShownRef = useRef(false);
  const productScrollRef = useRef<HTMLDivElement | null>(null);
  const savingsQuizRef = useRef<HTMLElement | null>(null);
  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const scrollLockTimeout = useRef<number | null>(null);
  const pageScrollTimeout = useRef<number | null>(null);
  const copy = homeCopy[lang];
  const tr = <T,>(translations: Localized<T>) => translations[lang];
  const isSavingsQuizRoute = window.location.pathname.replace(/\/+$/, '') === '/kviz';
  const batteryWh = Math.round(rangeCalculator.voltage * rangeCalculator.ampHours);
  const chemistryFactor = rangeCalculator.chemistry === 'lead' ? 0.5 : 0.9;
  const batteryHealth = 0.8;
  const usableBatteryWh = Math.round(batteryWh * chemistryFactor * batteryHealth);
  const legalMotorWatts = 250;
  const bikeKg = 40;
  const cargoKg = 0;
  const temperatureC = 20;
  const totalWeightKg = rangeCalculator.riderKg + bikeKg + cargoKg;
  const extraWeightKg = Math.max(0, totalWeightKg - 100);
  const weightPenalty = extraWeightKg * 0.045;
  const speedPenalty = rangeCalculator.averageSpeed > 20
    ? (rangeCalculator.averageSpeed - 20) * 0.3
    : rangeCalculator.averageSpeed < 16
    ? (16 - rangeCalculator.averageSpeed) * 0.15
    : 0;
  const temperaturePenalty = (temperatureC < 10 ? 1 : 0) + (temperatureC < 0 ? 2.2 : 0);
  const assistBaseWhPerKm = 7.5;
  const whPerKm = Math.max(
    7,
    Math.min(
      assistBaseWhPerKm
      + weightPenalty
      + speedPenalty
      + temperaturePenalty,
      25,
    ),
  );
  const estimatedRangeKm = Math.max(1, Math.round(usableBatteryWh / whPerKm));
  const rangeLowKm = Math.max(1, Math.round(usableBatteryWh / (whPerKm * 1.15)));
  const rangeHighKm = Math.max(1, Math.round(usableBatteryWh / (whPerKm * 0.9)));
  const fullAssistHours = usableBatteryWh / legalMotorWatts;
  const updateRangeCalculator = (key: 'riderKg' | 'averageSpeed' | 'voltage' | 'ampHours', value: number) => {
    if (!Number.isFinite(value)) return;
    setRangeCalculator((current) => ({ ...current, [key]: value }));
  };
  const updateSavingsQuiz = (key: 'dailyKm' | 'fuelPrice' | 'fuelConsumption', value: number) => {
    if (!Number.isFinite(value)) return;
    setSavingsQuiz((current) => ({ ...current, [key]: value }));
  };
  const dailyFuelCost = (savingsQuiz.dailyKm * savingsQuiz.fuelConsumption * savingsQuiz.fuelPrice) / 100;
  const dailyElectricCost = savingsQuiz.dailyKm * 0.5;
  const monthlySavings = Math.max(0, Math.round((dailyFuelCost - dailyElectricCost) * 30));
  const yearlySavings = Math.max(0, Math.round((dailyFuelCost - dailyElectricCost) * 365));
  const yearlyCo2Kg = Math.max(0, Math.round((savingsQuiz.dailyKm * 365 * savingsQuiz.fuelConsumption * 2.31) / 100));
  const formatRsd = (value: number) => `${new Intl.NumberFormat('sr-RS').format(value)} RSD`;
  const ui = tr({
    sr: {
        navModels: 'Modeli',
        navTechnology: 'Tehnologija',
        navReviews: 'Iskustva',
        specs: 'Specifikacije',
        innovation: 'Inovacija',
        technologyTitle: 'Tehnologija Koja Pokreće',
        technologyCards: [
          { title: 'Napredna Baterija', body: 'Samsung SDI ćelije sa inteligentnim BMS sistemom za optimalnu autonomiju' },
          { title: 'Bafang Motor', body: 'Premium mid-drive motor sa 45Nm obrtnog momenta' },
          { title: 'Smart Kontrola', body: 'Kolor displej sa GPS navigacijom i praćenjem performansi' },
          { title: 'Sigurnost', body: 'Shimano hidraulične kočnice i integrisani LED svetlosni sistem' },
        ],
        reviewsEyebrow: 'Iskustva',
        services: [
          { title: 'GPS sigurnosni sistemi', body: 'Pametni sistem za sigurnost i zaštitu tokom svake vožnje' },
          { title: '2 Godine Garancije', body: 'Proširena garancija na sve komponente i besplatni servis prve godine' },
          { title: 'Test Vožnja', body: 'Zakažite besplatnu test vožnju u našim salonima u Beogradu i Novom Sadu' },
        ],
        ctaBullets: ['GPS sigurnosni sistemi', '2 godine garancije', 'Fleksibilna rata'],
        footerBody: 'Lideri u premium električnim biciklima. Transformišemo urbanu mobilnost jednu vožnju po vožnju.',
        footerProducts: 'Proizvodi',
        footerCompare: 'Uporedi Modele',
        footerSupport: 'Podrška',
        footerSupportLinks: ['Test Vožnja', 'Servisi', 'Garancija'],
        footerCompany: 'Kompanija',
        footerCompanyLinks: ['O Nama', 'Kontakt', 'Karijera', 'Blog'],
        copyright: 'Sva prava zadržana.',
        footerLegal: ['Privatnost', 'Uslovi', 'Kolačići'],
      },
    en: {
        navModels: 'Models',
        navTechnology: 'Technology',
        navReviews: 'Reviews',
        specs: 'Specifications',
        innovation: 'Innovation',
        technologyTitle: 'Technology That Moves You',
        technologyCards: [
          { title: 'Advanced Battery', body: 'Samsung SDI cells with an intelligent BMS system for optimal range' },
          { title: 'Bafang Motor', body: 'Premium mid-drive motor with 45Nm of torque' },
          { title: 'Smart Control', body: 'Color display with GPS navigation and performance tracking' },
          { title: 'Safety', body: 'Shimano hydraulic brakes and an integrated LED lighting system' },
        ],
        reviewsEyebrow: 'Reviews',
        services: [
          { title: 'GPS security systems', body: 'Smart security and protection for every ride' },
          { title: '2-Year Warranty', body: 'Extended warranty on all components and free service in the first year' },
          { title: 'Test Ride', body: 'Book a free test ride in our showrooms in Belgrade and Novi Sad' },
        ],
        ctaBullets: ['GPS security systems', '2-year warranty', 'Flexible installment'],
        footerBody: 'Leaders in premium electric bikes. Transforming urban mobility one ride at a time.',
        footerProducts: 'Products',
        footerCompare: 'Compare Models',
        footerSupport: 'Support',
        footerSupportLinks: ['Test Ride', 'Service', 'Warranty'],
        footerCompany: 'Company',
        footerCompanyLinks: ['About Us', 'Contact', 'Careers', 'Blog'],
        copyright: 'All rights reserved.',
        footerLegal: ['Privacy', 'Terms', 'Cookies'],
      },
    ru: {
        navModels: 'Модели',
        navTechnology: 'Технологии',
        navReviews: 'Отзывы',
        specs: 'Характеристики',
        innovation: 'Инновации',
        technologyTitle: 'Технологии, которые двигают вас',
        technologyCards: [
          { title: 'Продвинутая батарея', body: 'Элементы Samsung SDI и интеллектуальная BMS-система для оптимального запаса хода' },
          { title: 'Мотор Bafang', body: 'Премиальный mid-drive мотор с крутящим моментом 45 Нм' },
          { title: 'Умное управление', body: 'Цветной дисплей с GPS-навигацией и отслеживанием показателей' },
          { title: 'Безопасность', body: 'Гидравлические тормоза Shimano и встроенная LED-система освещения' },
        ],
        reviewsEyebrow: 'Отзывы',
        services: [
          { title: 'GPS-системы безопасности', body: 'Умная защита и безопасность во время каждой поездки' },
          { title: 'Гарантия 2 года', body: 'Расширенная гарантия на все компоненты и бесплатный сервис в первый год' },
          { title: 'Тест-драйв', body: 'Запишитесь на бесплатный тест-драйв в наших шоурумах в Белграде и Нови-Саде' },
        ],
        ctaBullets: ['GPS-системы безопасности', 'Гарантия 2 года', 'Гибкая рассрочка'],
        footerBody: 'Лидеры в премиальных электровелосипедах. Меняем городскую мобильность по одной поездке за раз.',
        footerProducts: 'Продукты',
        footerCompare: 'Сравнить модели',
        footerSupport: 'Поддержка',
        footerSupportLinks: ['Тест-драйв', 'Сервис', 'Гарантия'],
        footerCompany: 'Компания',
        footerCompanyLinks: ['О нас', 'Контакт', 'Карьера', 'Блог'],
        copyright: 'Все права защищены.',
        footerLegal: ['Конфиденциальность', 'Условия', 'Cookies'],
      },
  });
  const whatsappNumber = '381631505003';
  const phoneHref = 'tel:+381631505003';
  const buildWhatsappLink = (text: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  const testRideWhatsappText = tr({
    sr: 'Zdravo, želim da zakažem test vožnju Pogon e-bike-a.',
    en: 'Hi, I want to book a Pogon e-bike test ride.',
    ru: 'Здравствуйте, хочу записаться на тест-драйв электровелосипеда Pogon.',
  });
  const whatsappHref = buildWhatsappLink(testRideWhatsappText);
  const closeLeadModal = useCallback(() => setLeadModalSource(null), []);
  const openLeadModal = (source: string) => {
    trackEvent(source.includes('hero') ? 'primary_cta_click' : 'test_ride_click', { source });
    setLeadModalSource(source);
  };
  const handlePhoneClick = (source: string) => trackEvent('phone_call_click', { source });
  const handleWhatsappClick = (source: string) => trackEvent('whatsapp_click', { source });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const updateViewport = () => setIsDesktop(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!isSavingsQuizRoute) return;

    const scrollTimeout = window.setTimeout(() => {
      savingsQuizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      savingsQuizRef.current?.focus({ preventScroll: true });
      trackEvent('savings_quiz_route_view', { path: window.location.pathname });
    }, 250);

    return () => window.clearTimeout(scrollTimeout);
  }, [isSavingsQuizRoute]);
  const footerSupportMessages = tr({
    sr: [
        'Zdravo, želim da zakažem test vožnju.',
        'Zdravo, zanima me servis za Pogon bicikl.',
        'Zdravo, imam pitanje oko garancije za Pogon.',
      ],
    en: [
        'Hi, I want to book a test ride.',
        'Hi, I have a question about Pogon service.',
        'Hi, I have a question about the Pogon warranty.',
      ],
    ru: [
        'Здравствуйте, хочу записаться на тест-драйв.',
        'Здравствуйте, меня интересует сервис для велосипеда Pogon.',
        'Здравствуйте, у меня вопрос по гарантии Pogon.',
      ],
  });
  const footerCompanyMessages = tr({
    sr: [
        'Zdravo, želim da saznam više o Pogonu.',
        'Zdravo, želim da kontaktiram Pogon tim.',
        'Zdravo, zanima me karijera u Pogonu.',
        'Zdravo, zanima me Pogon blog.',
      ],
    en: [
        'Hi, I want to learn more about Pogon.',
        'Hi, I want to contact the Pogon team.',
        'Hi, I am interested in careers at Pogon.',
        'Hi, I am interested in the Pogon blog.',
      ],
    ru: [
        'Здравствуйте, хочу узнать больше о Pogon.',
        'Здравствуйте, хочу связаться с командой Pogon.',
        'Здравствуйте, меня интересует работа в Pogon.',
        'Здравствуйте, меня интересует блог Pogon.',
      ],
  });
  const preModelsSentence = tr({
    sr: 'Pogon je e-bike za gradsku rutinu: stabilan, udoban i spreman da proveriš vožnju pre nego što odlučiš.',
    en: 'Pogon is an e-bike for city routines: stable, comfortable and ready to test before you decide.',
    ru: 'Pogon — электровелосипед для городского ритма: стабильный, удобный и готовый к тестовой поездке перед решением.',
  });
  const reviews = [
    {
      name: 'Vuk Rankovic',
      location: 'Beograd',
      rating: 5,
      text: {
        sr: 'Ovaj Pogon model je totalno promenio moje gradske vožnje — tiho, snažno i pouzdano.',
        en: 'This Pogon model totally changed my city rides — quiet, powerful and reliable.',
        ru: 'Эта модель Pogon полностью изменила мои поездки по городу — тихая, мощная и надежная.',
      },
    },
    {
      name: 'Andreas Spanoudis',
      location: 'Beograd',
      rating: 5,
      text: {
        sr: 'Brza dostava, sjajan osećaj na putu i odlična podrška. Preporučujem svima.',
        en: 'Fast delivery, great ride feel and excellent support. I recommend it to everyone.',
        ru: 'Быстрая доставка, отличные ощущения на дороге и прекрасная поддержка. Рекомендую всем.',
      },
    },
    {
      name: 'Ana Sunjka',
      location: 'Novi Sad',
      rating: 5,
      text: {
        sr: 'Savršeno uklopljen u gradski ritam, dobro drži put i baterija traje dugo.',
        en: 'Perfectly matched to the city rhythm, handles well and the battery lasts long.',
        ru: 'Идеально подходит для городского ритма, хорошо держит дорогу, а батареи хватает надолго.',
      },
    },
    {
      name: 'Aleksa Djuraskovic',
      location: 'Niš',
      rating: 5,
      text: {
        sr: 'Mekano ubrzanje, stabilnost i lep dizajn. Najbolja kupovina ove godine.',
        en: 'Smooth acceleration, stability and great design. Best purchase this year.',
        ru: 'Плавный разгон, устойчивость и красивый дизайн. Лучшая покупка в этом году.',
      },
    },
    {
      name: 'Matija Ilic',
      location: 'Novi Sad',
      rating: 5,
      text: {
        sr: 'Vožnja je sada zabavna, bez gužvi i bez stresa. Pogon je odličan izbor.',
        en: 'Riding is fun now, no traffic lines and no stress. Pogon is an excellent choice.',
        ru: 'Теперь поездки стали приятными: без пробок и стресса. Pogon — отличный выбор.',
      },
    },
    {
      name: 'Marko Jovanovic',
      location: 'Beograd',
      rating: 5,
      text: {
        sr: 'Odličan odnos cene i kvaliteta. Svaki dan sa osmehom idem na posao.',
        en: 'Great value for money. Now I go to work with a smile every day.',
        ru: 'Отличное соотношение цены и качества. Каждый день еду на работу с улыбкой.',
      },
    },
    {
      name: 'Matija Jovovic',
      location: 'Niš',
      rating: 4,
      text: {
        sr: 'Vozilo je veoma stabilno, samo bi voleo da ima još jedan mod vožnje.',
        en: 'The bike is very stable, I just wish it had one more riding mode.',
        ru: 'Велосипед очень стабильный, хотелось бы только еще один режим езды.',
      },
    },
    {
      name: 'Marija Antic',
      location: 'Novi Sad',
      rating: 4,
      text: {
        sr: 'Bicikl je odličan, samo je malo teži za žene pri nošenju uz stepenice.',
        en: 'The bike is excellent, just a bit heavy for women when carrying it up stairs.',
        ru: 'Велосипед отличный, просто немного тяжеловат, если нести его по лестнице.',
      },
    },
    {
      name: 'Elena Nikolaou',
      location: 'Beograd',
      rating: 4,
      text: {
        sr: 'Dizajn je fenomenalan, a komponente solidne. Jedino je sedište moglo biti mekše.',
        en: 'The design is phenomenal and components are solid. Only the seat could be softer.',
        ru: 'Дизайн прекрасный, компоненты хорошие. Только сиденье могло бы быть мягче.',
      },
    },
    {
      name: 'Luka Maric',
      location: 'Zemun',
      rating: 4,
      text: {
        sr: 'Lagan za upravljanje i brz. Malo je težak za nošenje stepenicama.',
        en: 'Easy to handle and fast. A bit heavy for carrying up stairs.',
        ru: 'Легко управляется и быстро едет. Немного тяжеловат для переноски по лестнице.',
      },
    },
  ];

  const reviewLoop = [...reviews, ...reviews];

  const reviewText = (review: { text: Localized<string> }) => review.text[lang];
  const trustBadges = tr({
    sr: ['Test vožnja dostupna', 'Servis i podrška', 'Dostava dostupna', 'Legalno za vožnju', 'Garancija'],
    en: ['Test ride available', 'Service and support', 'Delivery available', 'Road legal', 'Warranty'],
    ru: ['Тест-драйв доступен', 'Сервис и поддержка', 'Доставка доступна', 'Легально для дорог', 'Гарантия'],
  });
  const faqItems = tr({
    sr: [
        { question: 'Koliki je domet?', answer: 'Realni domet zavisi od rute, težine vozača, temperature i nivoa asistencije. Najbolje ga proveriš na test vožnji.' },
        { question: 'Da li mogu da probam bicikl pre kupovine?', answer: 'Da. Zakaži termin i probaj bicikl pre odluke, bez pritiska.' },
        { question: 'Da li je legalan za vožnju?', answer: 'Modeli su podešeni za gradsku vožnju i legalnu upotrebu u skladu sa pravilima za e-bike.' },
        { question: 'Da li treba dozvola?', answer: 'Za standardnu e-bike vožnju nije potrebna posebna dozvola.' },
        { question: 'Koliko traje punjenje?', answer: 'Punjenje najčešće traje nekoliko sati, u zavisnosti od baterije i nivoa napunjenosti.' },
        { question: 'Šta ako se pokvari?', answer: 'Tu su servis i podrška. Javiš nam se i dogovaramo najbrže rešenje.' },
        { question: 'Da li imate servis?', answer: 'Da, nudimo servisnu podršku i pomoć oko održavanja.' },
        { question: 'Da li može uzbrdo?', answer: 'Da. Motor pomaže na usponima, a test vožnja najbolje pokaže kako radi na tvojoj ruti.' },
        { question: 'Kako se plaća?', answer: 'Plaćanje dogovaramo direktno, uz jasne informacije pre kupovine.' },
      ],
    en: [
        { question: 'What is the range?', answer: 'Real range depends on route, rider weight, temperature and assist level. A test ride is the easiest check.' },
        { question: 'Can I try the bike before buying?', answer: 'Yes. Book a slot and try it before deciding, without pressure.' },
        { question: 'Is it road legal?', answer: 'The bikes are set up for city riding and legal e-bike use.' },
        { question: 'Do I need a licence?', answer: 'No special licence is needed for standard e-bike riding.' },
        { question: 'How long does charging take?', answer: 'Charging usually takes a few hours, depending on the battery and charge level.' },
        { question: 'What if it breaks?', answer: 'Service and support are available. Contact us and we will arrange the quickest solution.' },
        { question: 'Do you offer service?', answer: 'Yes, we provide service support and maintenance help.' },
        { question: 'Can it go uphill?', answer: 'Yes. The motor helps on climbs, and a test ride shows how it feels on your route.' },
        { question: 'How do I pay?', answer: 'Payment is arranged directly with clear information before purchase.' },
      ],
    ru: [
        { question: 'Какой запас хода?', answer: 'Реальный запас хода зависит от маршрута, веса райдера, температуры и уровня ассистента. Лучше всего проверить это на тест-драйве.' },
        { question: 'Можно попробовать велосипед перед покупкой?', answer: 'Да. Запишитесь на удобное время и попробуйте велосипед перед решением, без давления.' },
        { question: 'Он легален для езды по дорогам?', answer: 'Модели настроены для городской езды и легального использования как e-bike.' },
        { question: 'Нужны ли права?', answer: 'Для стандартной езды на электровелосипеде специальные права не нужны.' },
        { question: 'Сколько длится зарядка?', answer: 'Обычно зарядка занимает несколько часов, в зависимости от батареи и уровня заряда.' },
        { question: 'Что делать, если он сломается?', answer: 'Есть сервис и поддержка. Свяжитесь с нами, и мы организуем самое быстрое решение.' },
        { question: 'У вас есть сервис?', answer: 'Да, мы предлагаем сервисную поддержку и помощь с обслуживанием.' },
        { question: 'Он едет в гору?', answer: 'Да. Мотор помогает на подъемах, а тест-драйв лучше всего покажет ощущения на вашем маршруте.' },
        { question: 'Как происходит оплата?', answer: 'Оплату согласуем напрямую, с понятной информацией до покупки.' },
      ],
  });
  const trustBadgeIcons = [CalendarCheck, Wrench, Truck, Shield, CheckCircle2];

  const handleTestRideFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = testRideForm.name.trim();
    const cleanPhone = testRideForm.phone.trim();

    if (!cleanName || !cleanPhone) {
      setTestRideFormStatus('error');
      return;
    }

    trackEvent('test_ride_form_submit', {
      source: 'bottom-test-ride-form',
      city: testRideForm.city.trim(),
      preferredTime: testRideForm.preferredTime.trim(),
    });

    try {
      setTestRideFormStatus('submitting');
      await submitLead({
        name: cleanName,
        phone: cleanPhone,
        source: `test-ride-form${testRideForm.city.trim() ? `-${testRideForm.city.trim()}` : ''}`,
        language: lang,
        city: testRideForm.city.trim() || null,
        country: null,
        date_contacted: null,
        comment: testRideForm.preferredTime.trim() || null,
      });
      setTestRideFormStatus('success');
      setTestRideForm({ name: '', phone: '', city: '', preferredTime: '' });
    } catch {
      setTestRideFormStatus('success');
    }
  };

  const updateActiveProduct = () => {
    const container = productScrollRef.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;
    const center = container.scrollLeft + container.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(center - childCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActiveProduct(nearestIndex);
  };

  const snapToProduct = (index: number) => {
    const container = productScrollRef.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    const target = children[index];
    if (!target) return;
    const offset = target.offsetLeft - (container.clientWidth - target.clientWidth) / 2;
    container.scrollTo({ left: offset, behavior: 'smooth' });
    setActiveProduct(index);
  };

  const handleProductScroll = () => {
    if (scrollLockTimeout.current) {
      window.clearTimeout(scrollLockTimeout.current);
    }
    scrollLockTimeout.current = window.setTimeout(() => {
      updateActiveProduct();
    }, 100);
  };

  const getPageSections = () => {
    const root = pageRootRef.current;
    if (!root) return [] as HTMLElement[];
    return Array.from(root.querySelectorAll('section')) as HTMLElement[];
  };

  const snapToNearestSection = () => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    const sections = getPageSections();
    if (sections.length === 0) return;

    const currentScroll = window.scrollY;
    let nearestSection = sections[0];
    let nearestDistance = Infinity;

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + currentScroll;
      const distance = Math.abs(sectionTop - currentScroll);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestSection = section;
      }
    });

    const navHeight = document.querySelector('nav')?.clientHeight ?? 0;
    const targetTop = Math.max(0, nearestSection.getBoundingClientRect().top + currentScroll - navHeight);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  const handlePageScroll = () => {
    if (pageScrollTimeout.current) {
      window.clearTimeout(pageScrollTimeout.current);
    }
    pageScrollTimeout.current = window.setTimeout(() => {
      snapToNearestSection();
    }, 120);
  };

  useEffect(() => {
    updateActiveProduct();
    window.addEventListener('resize', updateActiveProduct);
    return () => {
      window.removeEventListener('resize', updateActiveProduct);
      if (scrollLockTimeout.current) {
        window.clearTimeout(scrollLockTimeout.current);
      }
      if (pageScrollTimeout.current) {
        window.clearTimeout(pageScrollTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSavingsQuizRoute) return;

    const popupStorageKey = window.matchMedia('(min-width: 768px)').matches
      ? 'pogon_popup_done_desktop'
      : 'pogon_popup_done_mobile';
    try { localStorage.removeItem('pogon_popup_done'); } catch { /* */ }
    try { if (localStorage.getItem(popupStorageKey) === '1') return; } catch { /* */ }
    const show = () => {
      if (popupShownRef.current) return;
      popupShownRef.current = true;
      setShowLeadPopup(true);
    };
    const timer = setTimeout(show, 8000);
    const onScroll = () => {
      const pct = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (pct >= 0.35) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [isSavingsQuizRoute]);

  const closeLeadPopup = () => {
    setShowLeadPopup(false);
    const popupStorageKey = window.matchMedia('(min-width: 768px)').matches
      ? 'pogon_popup_done_desktop'
      : 'pogon_popup_done_mobile';
    try { localStorage.setItem(popupStorageKey, '1'); } catch { /* */ }
  };

  const handlePopupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const digits = popupPhone.replace(/\D/g, '').replace(/^0+/, '');
    if (digits.length < 6) {
      setPopupError(tr({
        sr: 'Unesite ispravan broj telefona.',
        en: 'Enter a valid phone number.',
        ru: 'Введите корректный номер телефона.',
      }));
      return;
    }
    setPopupError('');
    setPopupSubmitting(true);
    try {
      await Promise.race([
        submitLead({ name: 'Popup lead', phone: `+381${digits}`, source: 'lead-popup', language: lang, city: null, country: null, date_contacted: null, comment: null }),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
      ]);
    } catch { /* show success regardless */ }
    setPopupSubmitting(false);
    setPopupSubmitted(true);
  };

  const bikeModels = [
    {
      key: 'glide',
      name: 'Glide',
      badgeKey: 'bestSeller' as const,
      badgeClass: 'bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase',
      image: { src: publicAsset('Glide main.jpg'), alt: 'Pogon Glide electric bike main product photo' },
      gallery: [
        { src: publicAsset('Glide main.jpg'), alt: 'Pogon Glide main product photo' },
        { src: publicAsset('Glide 1.jpg'), alt: 'Pogon Glide product photo 1' },
        { src: publicAsset('Glide 2.jpg'), alt: 'Pogon Glide product photo 2' },
        { src: publicAsset('Glide 4.jpg'), alt: 'Pogon Glide product photo 4' },
      ],
      description: copy.glideDescription,
      monthlyPrice: '17,000 RSD',
      price: '170,000 RSD',
      mobileSpecs: { range: '70 km', power: '250W motor', battery: '1200 Wh' },
      points: tr({
        sr: [
            'Motor u zadnjem točku',
            'Aluminijumski ram',
            'Hidraulične kočnice',
            'Nosivost 110 kg',
            'Domet 70 km',
            'GPS sigurnosne funkcije',
          ],
        en: [
            'Rear hub motor',
            'Aluminum frame',
            'Hydraulic brakes',
            '110 kg load capacity',
            'Up to 70 km range',
            'GPS security features',
          ],
        ru: [
            'Задний мотор-колесо',
            'Алюминиевая рама',
            'Гидравлические тормоза',
            'Грузоподъемность 110 кг',
            'Запас хода до 100 км',
            'GPS-функции безопасности',
          ],
      }),
    },
    {
      key: 'core',
      name: 'Core',
      badgeKey: 'recommended' as const,
      badgeClass: 'bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs font-bold uppercase',
      image: { src: publicAsset('Cargo Main.jpg'), alt: 'Pogon Core electric bike main product photo' },
      gallery: [
        { src: publicAsset('Cargo Main.jpg'), alt: 'Pogon Core main product photo' },
        { src: publicAsset('Cargo fold.jpg'), alt: 'Pogon Core folded product photo' },
        { src: publicAsset('Cargo 1.jpg'), alt: 'Pogon Core product photo 1' },
        { src: publicAsset('Cargo 2.jpg'), alt: 'Pogon Core product photo 2' },
      ],
      description: copy.coreDescription,
      monthlyPrice: '12,500 RSD',
      price: '125,000 RSD',
      originalMonthlyPrice: '14,000 RSD',
      originalPrice: '140,000 RSD',
      savingsAmount: '15,000 RSD',
      onSale: true,
      mobileSpecs: { range: '110 km', power: '250W motor', battery: '1512 Wh' },
      points: tr({
        sr: [
            'Motor u zadnjem točku',
            'Sklopivi čelični ram',
            'Hidraulične kočnice',
            'Dve baterije, domet preko 110 km',
            'Fat tyre gume',
            'GPS sigurnosne funkcije',
          ],
        en: [
            'Rear hub motor',
            'Foldable steel frame',
            'Hydraulic brakes',
            'Two batteries — up to 110 km range',
            'Fat tyre wheels',
            'GPS security features',
          ],
        ru: [
            'Задний мотор-колесо',
            'Складная стальная рама',
            'Гидравлические тормоза',
            'Две батареи, запас хода более 110 км',
            'Широкие fat tyre шины',
            'GPS-функции безопасности',
          ],
      }),
      isFeatured: true,
    },
    {
      key: 'cargo',
      name: 'Cargo',
      badgeKey: 'newBadge' as const,
      badgeClass: 'bg-card text-foreground px-3 py-1 rounded-full text-xs font-bold uppercase border border-border',
      image: { src: publicAsset('Core main.jpg'), alt: 'Pogon Cargo electric bike main product photo' },
      gallery: [
        { src: publicAsset('Core main.jpg'), alt: 'Pogon Cargo main product photo' },
        { src: publicAsset('Core 1.jpg'), alt: 'Pogon Cargo product photo 1' },
        { src: publicAsset('Core 2.jpg'), alt: 'Pogon Cargo product photo 2' },
        { src: publicAsset('Core 3.jpg'), alt: 'Pogon Cargo product photo 3' },
      ],
      description: copy.cargoDescription,
      monthlyPrice: '12,000 RSD',
      price: '120,000 RSD',
      mobileSpecs: { range: '110 km', power: '250W motor', battery: '1512 Wh' },
      points: tr({
        sr: [
            'Motor u zadnjem točku',
            'Čelični ram',
            'Hidraulične kočnice',
            'Dve baterije, domet preko 110 km',
            'Fat tyre gume',
            'GPS sigurnosne funkcije',
          ],
        en: [
            'Rear hub motor',
            'Steel frame',
            'Hydraulic brakes',
            'Two batteries — up to 110 km range',
            'Fat tyre wheels',
            'GPS security features',
          ],
        ru: [
            'Задний мотор-колесо',
            'Стальная рама',
            'Гидравлические тормоза',
            'Две батареи, запас хода более 110 км',
            'Широкие fat tyre шины',
            'GPS-функции безопасности',
          ],
      }),
    },
  ];

  const lightboxModel = bikeModels.find((model) => model.key === activeLightboxProduct);
  const lightboxGallery = lightboxModel && 'gallery' in lightboxModel ? lightboxModel.gallery : undefined;
  const lightboxIndex = lightboxModel ? activeGalleryImages[lightboxModel.key] ?? 0 : 0;
  const lightboxImage = lightboxGallery?.[lightboxIndex];
  const canZoomOut = lightboxZoom > 1;
  const canZoomIn = lightboxZoom < 2;
  const zoomLightboxIn = () => setLightboxZoom((current) => Math.min(2, Number((current + 0.25).toFixed(2))));
  const zoomLightboxOut = () => setLightboxZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))));
  const setLightboxImage = (index: number) => {
    if (!lightboxModel || !lightboxGallery) return;
    setActiveGalleryImages((current) => ({ ...current, [lightboxModel.key]: index }));
    setLightboxZoom(1);
  };
  const closeLightbox = () => {
    setActiveLightboxProduct(null);
    setLightboxZoom(1);
  };

  if (new URLSearchParams(window.location.search).get('admin') === '1') {
    return <Suspense fallback={null}><AdminLeads /></Suspense>;
  }

  return (
    <div ref={pageRootRef} className="min-h-screen bg-background overflow-x-hidden sm:overflow-x-visible px-4 sm:px-0 pb-[4.75rem] md:pb-0">
      <style>{`
        @keyframes scroll-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .review-marquee {
          animation: scroll-marquee 50s linear infinite;
          min-width: max-content;
        }
        .review-marquee > * {
          flex: 0 0 auto;
        }
        .trust-conveyor {
          animation: scroll-marquee 24s linear infinite;
          min-width: max-content;
        }
        .trust-conveyor > * {
          flex: 0 0 auto;
        }
        @keyframes swipe-hint {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(0.9rem); opacity: 1; }
        }
        .swipe-hint-dot {
          animation: swipe-hint 1.25s ease-in-out infinite;
        }
        @keyframes soft-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.45rem); }
        }
        .product-soft-float {
          animation: soft-float 5.5s ease-in-out infinite;
        }
        @media (max-width: 639px) {
          .review-card {
            min-width: min(20rem, calc(100vw - 4rem));
            max-width: min(20rem, calc(100vw - 4rem));
          }
        }
      `}</style>

      <AnimatePresence>
        {showLeadPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center bg-black/75 backdrop-blur-md sm:p-4"
            onMouseDown={(e) => e.target === e.currentTarget && closeLeadPopup()}
          >
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm overflow-hidden rounded-t-[2rem] bg-[#0c0c0c] shadow-[0_-20px_80px_rgba(0,0,0,0.7)] sm:rounded-[2rem] sm:shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
            >
              {/* Green top bar */}
              <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#7fff00] to-transparent" />

              <div className="px-6 pb-8 pt-6 sm:px-8">
                <button
                  type="button"
                  onClick={closeLeadPopup}
                  aria-label={copy.close}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" />
                </button>

                {popupSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="py-8 text-center"
                  >
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#7fff00]/15 ring-1 ring-[#7fff00]/30">
                      <CheckCircle2 className="size-8 text-[#7fff00]" />
                    </div>
                    <h2 className="text-2xl font-black text-white">{tr({ sr: 'Hvala!', en: 'Thank you!', ru: 'Спасибо!' })}</h2>
                    <p className="mt-2 text-sm text-white/40">{tr({ sr: 'Javićemo ti se uskoro.', en: "We'll be in touch soon.", ru: 'Мы скоро свяжемся с вами.' })}</p>
                    <button type="button" onClick={closeLeadPopup} className="mt-7 rounded-full border border-white/15 px-8 py-3 text-sm font-bold text-white/60 transition-colors hover:bg-white/5 hover:text-white">
                      {copy.close}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Logo */}
                    <motion.img
                      src={publicAsset('Logo.png')}
                      alt="POGON"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 }}
                      className="mb-6 h-9 w-auto brightness-0 invert"
                    />

                    {/* Headline */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.13 }}
                      className="mb-5"
                    >
                      <h2 className="text-[2rem] font-black leading-[1.1] text-white">
                        {lang === 'sr' ? (
                          <><span>Hoćeš</span><br /><span className="text-[#7fff00]">test vožnju?</span></>
                        ) : lang === 'ru' ? (
                          <><span>Хотите</span><br /><span className="text-[#7fff00]">тест-драйв?</span></>
                        ) : (
                          <><span>Want a</span><br /><span className="text-[#7fff00]">test ride?</span></>
                        )}
                      </h2>
                      <p className="mt-2.5 text-sm leading-relaxed text-white/40">
                        {tr({
                          sr: 'Ostavi broj — pozvaćemo te da dogovorimo termin. Bez obaveze kupovine.',
                          en: "Leave your number — we'll call to arrange a slot. No purchase required.",
                          ru: 'Оставьте номер — мы позвоним и договоримся о времени. Покупка не обязательна.',
                        })}
                      </p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                      onSubmit={handlePopupSubmit}
                      noValidate
                      className="space-y-2.5"
                    >
                      <div className={`flex items-center overflow-hidden rounded-2xl border bg-white/[0.06] transition-all ${popupError ? 'border-red-400/60' : 'border-white/10 focus-within:border-[#7fff00]/50'}`}>
                        <span className="select-none pl-4 pr-1 text-sm font-bold text-white/25">+381</span>
                        <span className="select-none text-white/10">|</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          value={popupPhone}
                          onChange={(e) => { setPopupPhone(e.target.value); setPopupError(''); }}
                          placeholder={tr({ sr: 'Broj telefona', en: 'Phone number', ru: 'Номер телефона' })}
                          className="flex-1 bg-transparent py-4 pl-3 pr-4 text-base text-white outline-none placeholder:text-white/20"
                        />
                      </div>
                      {popupError && <p className="text-xs text-red-400">{popupError}</p>}
                      <button
                        type="submit"
                        disabled={popupSubmitting}
                        className="w-full rounded-2xl bg-[#7fff00] py-4 text-sm font-black uppercase tracking-wider text-black transition-all hover:bg-[#b2ff4d] active:scale-[0.98] disabled:opacity-60"
                      >
                        {popupSubmitting ? '…' : tr({ sr: 'Pozovite me', en: 'Call me', ru: 'Позвоните мне' })}
                      </button>
                    </motion.form>

                    {/* Divider */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.23 }}
                      className="my-4 flex items-center gap-3"
                    >
                      <div className="h-px flex-1 bg-white/8" />
                      <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/20">{tr({ sr: 'ili', en: 'or', ru: 'или' })}</span>
                      <div className="h-px flex-1 bg-white/8" />
                    </motion.div>

                    {/* WhatsApp */}
                    <motion.a
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => { handleWhatsappClick('popup'); closeLeadPopup(); }}
                      className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 text-sm font-bold text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-[0.98]"
                    >
                      <MessageCircle className="size-4 text-[#25D366]" />
                      {tr({ sr: 'Piši nam na WhatsApp', en: 'Message us on WhatsApp', ru: 'Написать в WhatsApp' })}
                    </motion.a>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-2.5 [@media_(orientation:landscape)_and_(max-height:520px)]:py-1.5">
          <div className="w-full flex h-8 items-center justify-between gap-2 rounded-full border border-black/10 bg-white/90 px-2 shadow-[0_15px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:h-auto sm:py-1.5 [@media_(orientation:landscape)_and_(max-height:520px)]:h-9 [@media_(orientation:landscape)_and_(max-height:520px)]:py-0.5">
            <a href="#top" aria-label="Back to home" className="relative inline-flex h-8 w-28 items-center rounded-full bg-white shadow-sm transition-transform hover:-translate-y-0.5 sm:h-auto sm:w-auto sm:px-4 sm:py-1.5 [@media_(orientation:landscape)_and_(max-height:520px)]:py-0.5">
              <div className="flex items-center justify-center">
                <img src={publicAsset('Logo.png')} alt="POGON" className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-36 -translate-x-1/2 -translate-y-1/2 object-cover object-center sm:hidden" />
                <img src={publicAsset('Logo.png')} alt="POGON" className="hidden h-9 w-auto opacity-100 sm:block lg:h-10 [@media_(orientation:landscape)_and_(max-height:520px)]:h-6" />
              </div>
            </a>

            <div className="hidden md:flex flex-1 items-center justify-center gap-4 text-xs uppercase tracking-wider text-black/65">
              <a href="#modeli" className="transition-colors hover:text-black">{ui.navModels}</a>
              <a href="#tehnologija" className="transition-colors hover:text-black">{ui.navTechnology}</a>
              <a href="#iskustva" className="transition-colors hover:text-black">{ui.navReviews}</a>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <button type="button" onClick={() => openLeadModal('purchase-general')} className="inline-flex items-center justify-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-black/75 transition-all hover:bg-black/10">{copy.buyNow}</button>
              <button onClick={() => setLang('sr')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'sr' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>SR</button>
              <button onClick={() => setLang('en')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'en' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>EN</button>
              <button onClick={() => setLang('ru')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'ru' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>RU</button>
            </div>

            <div className="flex items-center md:hidden gap-1">
              <button onClick={() => setLang('sr')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'sr' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>SR</button>
              <button onClick={() => setLang('en')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'en' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>EN</button>
              <button onClick={() => setLang('ru')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'ru' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>RU</button>
            </div>
          </div>
        </div>
      </nav>

      {isDesktop && (
      <div>
        <ScrollyCanvas frameCount={30}>
          <Overlay
            copy={copy}
            onBookTestRide={() => openLeadModal('desktop-hero')}
            phoneHref={phoneHref}
            onPhoneClick={() => handlePhoneClick('desktop-hero')}
          />
        </ScrollyCanvas>
        <div className="hidden border-b border-border/60 bg-white/90 py-4 lg:block">
          <div className="mx-auto max-w-7xl overflow-hidden px-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="trust-conveyor flex gap-3">
              {[...trustBadges, ...trustBadges, ...trustBadges].map((badge, index) => {
                const Icon = trustBadgeIcons[index % trustBadgeIcons.length];
                return (
                  <div key={`desktop-hero-trust-${badge}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-foreground/70">
                    <Icon className="size-4 text-primary" />
                    {badge}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Hero Section */}
      {!isDesktop && (
      <section className="relative flex touch-pan-y items-center justify-center pt-10 pb-10 sm:pt-14 sm:pb-12 lg:hidden">
        {/* Background — overflow clipped here only so absolute badges aren't clipped */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.05)_0%,transparent_50%)]"></div>
        </div>

        <div className="relative w-full max-w-lg mx-auto px-5">
          <div className="grid grid-cols-1 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-sm">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                </span>
                <span className="uppercase tracking-wider text-xs font-medium">{copy.badge}</span>
              </div>

              <div className="space-y-4">
                {lang === 'sr' ? (
                  <h1 className="text-[clamp(2.1rem,13vw,3.4rem)] font-black uppercase leading-[0.9] tracking-[-0.05em]">
                    <span>Pokreni </span>
                    <span className="relative inline-block pb-2">
                      Se
                      <span className="absolute bottom-0 left-0 h-1 w-full bg-primary" aria-hidden="true"></span>
                    </span>
                  </h1>
                ) : (
                  <>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                      {copy.heroTitle}
                    </h1>
                    <div className="h-1 w-20 bg-primary mx-auto lg:mx-0"></div>
                  </>
                )}
              </div>

              <p className="text-base sm:text-lg md:text-xl text-foreground/60 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
                {copy.heroSub}
              </p>

              <div className="flex flex-wrap gap-3 pt-3 justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => openLeadModal('mobile-hero')}
                  className="w-full sm:w-auto group bg-primary text-primary-foreground px-6 sm:px-8 py-4 rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-[0.98] text-sm uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/15"
                >
                  <CalendarCheck className="size-5" />
                  {copy.heroPrimary}
                </button>
                <a href={phoneHref} onClick={() => handlePhoneClick('mobile-hero')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-border px-6 sm:px-8 py-4 rounded-full hover:bg-accent transition-all active:scale-[0.98] text-sm uppercase tracking-wider font-bold"
                >
                  <Phone className="size-5" />
                  {copy.heroSecondary}
                </a>
              </div>

              <div className="overflow-hidden pt-1 pb-1 [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]">
                <div className="trust-conveyor flex gap-2">
                  {[...trustBadges, ...trustBadges, ...trustBadges].map((badge, index) => {
                    const Icon = trustBadgeIcons[index % trustBadgeIcons.length];
                    return (
                      <div key={`hero-trust-${badge}-${index}`} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-foreground/70">
                        <Icon className="size-3.5 text-primary" />
                        {badge}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-7 border-t border-border/50">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight">90<span className="text-lg sm:text-2xl text-foreground/40">km</span></div>
                  <div className="text-[0.65rem] sm:text-xs uppercase tracking-wider text-foreground/50 mt-1">{copy.range}</div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-end gap-1 text-black justify-center">
                    <span className="text-[0.7rem] lowercase tracking-[0.18em] text-foreground/60">{copy.fromText}</span>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">250<span className="text-lg sm:text-2xl text-foreground/40">w</span></span>
                  </div>
                  <div className="text-[0.65rem] sm:text-xs uppercase tracking-wider text-foreground/50 mt-1">{copy.power}</div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-end gap-1 text-black justify-center">
                    <span className="text-[0.7rem] lowercase tracking-[0.18em] text-foreground/60">{copy.fromText}</span>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">25<span className="text-lg sm:text-2xl text-foreground/40">km/h</span></span>
                  </div>
                  <div className="text-[0.65rem] sm:text-xs uppercase tracking-wider text-foreground/50 mt-1">{copy.topSpeed}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.1 }}
              className="relative mt-2"
            >
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/25 via-primary/15 to-transparent rounded-3xl blur-2xl pointer-events-none"></div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                <ImageWithFallback
                  src={publicAsset('Excellent4.optimized.jpg')}
                  alt="POGON e-bicikl"
                  loading="eager"
                  className="w-full h-full object-cover"
                />
                {/* Rating badge — inside the image corner, no negative positioning */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-border/30 px-3 py-2 shadow-lg">
                  <Star className="size-4 fill-primary stroke-primary shrink-0" />
                  <span className="text-sm font-black">4.9</span>
                  <span className="text-xs text-foreground/50 font-medium">rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* Product Intro */}
      <section className="relative overflow-hidden bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <ScrollColorSentence
            text={tr({
              sr: 'Upoznaj električni bicikl koji podiže standard u Srbiji. Sa vrhunskim komponentima, snažnom asistencijom i najmodernijim tehničkim karakteristikama',
              en: 'Meet the electric bike raising the standard in Serbia. With premium components, strong assistance, and modern technical features, Pogon is made for riders who want quality they can feel on every ride.',
              ru: 'Познакомьтесь с электровелосипедом, который задает новый стандарт в Сербии. Премиальные компоненты, мощная ассистенция и современные технические решения для качества, которое ощущается в каждой поездке.',
            })}
          />
        </div>
      </section>

      {/* Product Showcase */}
      <section id="modeli" className="relative overflow-hidden bg-background pt-8 pb-14 text-foreground sm:pt-10 sm:pb-28 lg:pt-12 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-accent/20"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-8 md:mb-20 lg:mb-10">
            <div className="inline-block px-4 py-1 bg-primary/10 rounded-full text-xs uppercase tracking-widest font-semibold mb-4 lg:mb-3">{copy.premiumSeries}</div>
            <h2 className="text-4xl md:text-6xl lg:text-5xl font-black mb-4 md:mb-6 lg:mb-3 tracking-tight">{ui.navModels}</h2>
            <p className="text-base sm:text-xl lg:text-base text-foreground/60 max-w-2xl mx-auto font-light">
              {copy.modelsCopy}
            </p>
          </div>

          <div className="mb-4 flex items-center justify-center lg:hidden">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-foreground/70 shadow-sm">
              <span aria-hidden="true">‹</span>
              <span className="relative h-2 w-10 overflow-hidden rounded-full bg-foreground/10">
                <span className="swipe-hint-dot absolute left-1 top-1/2 h-1.5 w-4 -translate-y-1/2 rounded-full bg-primary"></span>
              </span>
              <span aria-hidden="true">›</span>
              <span>{tr({ sr: 'Prevuci', en: 'Drag', ru: 'Листайте' })}</span>
            </div>
          </div>

          <div className="relative">
            <div
              ref={productScrollRef}
              onScroll={handleProductScroll}
              className="grid grid-flow-col auto-cols-[minmax(17.5rem,calc(100vw-3rem))] gap-4 overflow-x-auto pb-4 -mx-6 px-6 sm:auto-cols-[21rem] lg:mx-0 lg:px-0 lg:grid-cols-3 lg:grid-flow-row lg:auto-cols-auto lg:overflow-visible lg:gap-5 snap-x snap-mandatory"
            >
              {bikeModels.map((model) => {
                const gallery = 'gallery' in model ? model.gallery : undefined;
                const defaultGalleryIndex = gallery?.findIndex((image) => image.src === model.image.src) ?? -1;
                const selectedGalleryIndex = gallery
                  ? activeGalleryImages[model.key] ?? Math.max(defaultGalleryIndex, 0)
                  : 0;
                const setGalleryImage = (index: number) => {
                  if (!gallery) return;
                  setActiveGalleryImages((current) => ({ ...current, [model.key]: index }));
                };
                const selectedImage = gallery ? gallery[selectedGalleryIndex] : model.image;
                const handleImagePanelClick = () => {
                  if (gallery) {
                    setActiveLightboxProduct(model.key);
                    setLightboxZoom(1);
                    return;
                  }

                  setActiveSpecs(activeSpecs === model.key ? null : model.key);
                };

                return (
                <motion.div
                  key={model.key}
                  initial={{ opacity: 0, y: 26, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.52, delay: bikeModels.findIndex((bike) => bike.key === model.key) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`group snap-center sm:snap-start min-w-0 overflow-hidden rounded-3xl transition-all duration-300 ${model.isFeatured ? 'bg-primary text-primary-foreground border-2 border-primary shadow-2xl hover:-translate-y-2 hover:shadow-2xl lg:product-soft-float' : 'bg-card border-2 border-border hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2'}`}
                >
                <div className="relative overflow-hidden rounded-t-3xl">
                  {model.isFeatured ? <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80"></div> : null}
                  <div
                    className="aspect-[4/5] overflow-hidden relative bg-black cursor-pointer group sm:aspect-[5/4] lg:aspect-[3/2]"
                    onClick={handleImagePanelClick}
                  >
                    <motion.div
                      initial={{ scale: 1.08, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                      className="relative z-10 h-full w-full"
                    >
                      <ImageWithFallback
                        src={selectedImage.src}
                        alt={selectedImage.alt}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </motion.div>
                    {gallery ? (
                      <div className="absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between">
                        <button
                          type="button"
                          aria-label={`Previous ${model.name} photo`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setGalleryImage((selectedGalleryIndex - 1 + gallery.length) % gallery.length);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/65"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          aria-label={`Next ${model.name} photo`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setGalleryImage((selectedGalleryIndex + 1) % gallery.length);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/65"
                        >
                          ›
                        </button>
                      </div>
                    ) : null}
                    {gallery ? (
                      <button
                        type="button"
                        aria-label={`Zoom ${model.name} photo`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveLightboxProduct(model.key);
                          setLightboxZoom(1);
                        }}
                        className="absolute bottom-4 right-4 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/65 sm:inline-flex"
                      >
                        <ZoomIn className="size-5" />
                      </button>
                    ) : null}
                    <div className={`absolute top-4 right-4 z-20 ${model.badgeClass}`}>
                      {copy[model.badgeKey]}
                    </div>
                    {model.onSale ? (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-[0_0_0_3px_rgba(255,255,255,0.15)] animate-pulse">
                        <Zap className="size-3 fill-white" />
                        {copy.onSaleBadge}
                      </div>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3.5 pb-3 pt-12 text-white lg:hidden">
                      <div className="max-w-[78%] text-left">
                        <div className="text-xl font-black leading-none drop-shadow-md">{model.name}</div>
                        <div className="mt-1.5 flex items-baseline gap-2">
                          <span className="text-xl font-black leading-none tracking-tight drop-shadow-md">{model.monthlyPrice}</span>
                          {model.onSale ? (
                            <span className="text-xs font-semibold text-white/55 line-through">{model.originalMonthlyPrice}</span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white/70">{copy.perMonth}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[0.62rem] font-semibold text-white/65">
                          {model.onSale ? <span className="line-through opacity-60">{model.originalPrice}</span> : null}
                          <span className={model.onSale ? 'font-bold text-white' : ''}>{model.price}</span>
                        </div>
                        {model.onSale ? (
                          <div className="mt-1 inline-flex items-center rounded-full bg-orange-500/90 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-white shadow">
                            {copy.youSave} {model.savingsAmount}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className={`absolute inset-0 z-30 bg-black/95 p-5 flex flex-col gap-3 overflow-y-auto overscroll-contain transition-all duration-200 lg:hidden ${activeSpecs === model.key ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs uppercase tracking-[0.35em] text-white/80">{ui.specs}</span>
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); setActiveSpecs(null); }}
                            className="text-white/90 hover:text-white text-sm font-semibold"
                          >
                            {copy.close}
                          </button>
                        </div>
                        <ul className="space-y-2 text-sm leading-relaxed list-disc pl-5 text-white/90">
                          {model.points.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-[0.75rem] text-white/70">{copy.clickHide}</div>
                    </div>
                  </div>
                  {gallery ? (
                    <div className="relative z-40 flex gap-1.5 overflow-x-auto border-t border-border bg-white p-1.5 shadow-inner lg:p-2">
                      {gallery.map((image, index) => (
                        <button
                          key={image.src}
                          type="button"
                          aria-label={`Show ${model.name} photo ${index + 1}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setGalleryImage(index);
                          }}
                          className={`aspect-square w-12 flex-none overflow-hidden rounded-xl border bg-white p-0.5 shadow-sm ring-offset-2 ring-offset-white transition-all sm:w-14 lg:w-14 ${
                            selectedGalleryIndex === index ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/60 hover:ring-2 hover:ring-primary/30'
                          }`}
                        >
                          <ImageWithFallback
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            className="h-full w-full rounded-lg object-cover object-center transition-transform duration-300 hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="p-3 sm:p-4 lg:p-5">
                  <h3 className={`hidden lg:block text-xl font-bold mb-1.5 ${model.isFeatured ? 'text-primary-foreground' : 'text-foreground'}`}>{model.name}</h3>
                  <div className="hidden lg:grid grid-cols-2 gap-x-7 gap-y-2.5 mb-4 text-[0.9rem] font-medium leading-snug">
                    {model.points.map((point, index) => (
                      <div
                        key={`${model.key}-desktop-point-${index}`}
                        className={`flex min-h-[2.05rem] items-start gap-2.5 ${model.isFeatured ? 'text-primary-foreground/88' : 'text-foreground/70'}`}
                      >
                        <span className={`mt-[0.48rem] size-1.5 shrink-0 rounded-full ${model.isFeatured ? 'bg-primary-foreground/75' : 'bg-primary/75'}`} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`pt-2 lg:pt-4 lg:border-t ${model.isFeatured ? 'lg:border-white/20' : 'lg:border-border'}`}>
                    <div className={`hidden lg:flex items-baseline gap-2 mb-0.5 ${model.isFeatured ? 'text-primary-foreground' : ''}`}>
                      <span className="text-3xl font-black">{model.monthlyPrice}</span>
                      {model.onSale ? (
                        <span className={`text-base font-semibold line-through ${model.isFeatured ? 'text-white/50' : 'text-foreground/40'}`}>{model.originalMonthlyPrice}</span>
                      ) : null}
                    </div>
                    <div className={`hidden lg:block text-[0.65rem] uppercase tracking-wider mb-1.5 ${model.isFeatured ? 'text-white/80' : 'text-foreground/50'}`}>{copy.perMonth}</div>
                    <div className={`hidden lg:flex items-center gap-1.5 text-xs ${model.onSale ? 'mb-2' : 'mb-3'} ${model.isFeatured ? 'text-primary-foreground/80' : 'text-foreground/60'}`}>
                      {model.onSale ? <span className="line-through opacity-60">{model.originalPrice}</span> : null}
                      <span className={model.onSale ? 'font-bold' : ''}>{model.price}</span>
                    </div>
                    {model.onSale ? (
                      <div className="hidden lg:inline-flex items-center rounded-full bg-orange-500/90 px-2.5 py-0.5 mb-3 text-[0.6rem] font-bold uppercase tracking-wide text-white shadow">
                        {copy.youSave} {model.savingsAmount}
                      </div>
                    ) : null}
                    <div className="mb-3 grid grid-cols-3 gap-1.5 lg:hidden">
                      {[
                        { value: model.mobileSpecs.range, label: copy.range },
                        { value: model.mobileSpecs.power, label: copy.power },
                        { value: model.mobileSpecs.battery, label: tr({ sr: 'Baterija', en: 'Battery', ru: 'Батарея' }) },
                      ].map((spec) => (
                        <div
                          key={`${model.key}-${spec.label}`}
                          className={`rounded-xl border px-1.5 py-2 text-center ${
                            model.isFeatured ? 'border-white/25 bg-white/10' : 'border-border bg-background/80'
                          }`}
                        >
                          <div className={`text-sm font-black leading-none ${model.isFeatured ? 'text-primary-foreground' : 'text-foreground'}`}>{spec.value}</div>
                          <div className={`mt-1 text-[0.5rem] uppercase tracking-wider ${model.isFeatured ? 'text-white/70' : 'text-foreground/45'}`}>{spec.label}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => openLeadModal(`model-${model.name}`)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 lg:py-2.5 rounded-full transition-all font-semibold uppercase text-[0.62rem] sm:text-xs lg:text-xs tracking-wider active:scale-[0.98] ${model.isFeatured ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                    >
                      <CalendarCheck className="size-3.5" />
                      {copy.heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => openLeadModal(`purchase-${model.name}`)}
                      className={`mt-1.5 w-full inline-flex items-center justify-center gap-1.5 rounded-full border py-2 lg:py-2 text-[0.56rem] font-semibold uppercase tracking-wider active:scale-[0.98] ${
                        model.isFeatured ? 'border-white/35 text-primary-foreground/80' : 'border-border text-foreground/60'
                      }`}
                    >
                      {copy.buyNow}
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
                );
              })}
          </div>
          <div className="lg:hidden mt-4 px-6">
            <div className="flex items-center justify-between gap-3 text-foreground/70 text-xs uppercase tracking-[0.25em]">
              <button
                type="button"
                onClick={() => snapToProduct(Math.max(activeProduct - 1, 0))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-foreground/80"
              >
                ‹
              </button>
              <div className="flex items-center gap-2">
                {bikeModels.map((_, index) => (
                  <span
                    key={`dot-${index}`}
                    className={`h-2 w-2 rounded-full ${activeProduct === index ? 'bg-foreground' : 'bg-foreground/30'}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => snapToProduct(Math.min(activeProduct + 1, bikeModels.length - 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-foreground/80"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Test Ride Booking */}
      <section id="test-voznja" className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.25 }}
            className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/75">
                <CalendarCheck className="size-4" />
                {tr({ sr: 'Test vožnja', en: 'Test ride', ru: 'Тест-драйв' })}
              </div>
              <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                {tr({ sr: 'Provozaj ga pre nego što odlučiš.', en: 'Ride it before you decide.', ru: 'Прокатитесь перед решением.' })}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/65">
                {tr({
                  sr: 'Ne moraš da kupiš e-bike na osnovu slika. Zakaži test vožnju, probaj kako vuče, kako koči i da li ti odgovara za tvoju rutu.',
                  en: 'You do not have to choose an e-bike from photos alone. Book a test ride, feel the pull and braking, and see if it fits your route.',
                  ru: 'Не нужно выбирать e-bike только по фотографиям. Запишитесь на тест-драйв, почувствуйте тягу и торможение и проверьте, подходит ли он для вашего маршрута.',
                })}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsappClick('test-ride-section')}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-black uppercase tracking-wider text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle className="size-5" />
                  {tr({ sr: 'Zakaži preko WhatsApp-a', en: 'Book on WhatsApp', ru: 'Записаться через WhatsApp' })}
                </a>
                <a
                  href={phoneHref}
                  onClick={() => handlePhoneClick('test-ride-section')}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-6 py-4 text-sm font-black uppercase tracking-wider transition-colors hover:bg-accent active:scale-[0.98]"
                >
                  <Phone className="size-5" />
                  {tr({ sr: 'Pozovi odmah', en: 'Call now', ru: 'Позвонить сейчас' })}
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                ...tr({
                  sr: ['Pošalji poruku ili pozovi', 'Dogovorimo termin', 'Probaš bicikl i odlučiš bez pritiska'],
                  en: ['Send a message or call', 'We arrange a time', 'Try the bike and decide without pressure'],
                  ru: ['Напишите или позвоните', 'Согласуем удобное время', 'Пробуете велосипед и решаете без давления'],
                }),
              ].map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  viewport={{ once: true, amount: 0.4 }}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-base font-bold leading-tight">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Range Explainer */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true, amount: 0.3 }}
            className="overflow-hidden rounded-3xl border border-border bg-primary text-primary-foreground shadow-2xl"
          >
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                  <Gauge className="size-4" />
                  {copy.range}
                </div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {tr({ sr: 'Koliki je realan domet?', en: 'What is the real range?', ru: 'Какой реальный запас хода?' })}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
                  {tr({
                    sr: 'Domet zavisi od kapaciteta baterije, težine vozača i prosečne brzine. Otvori kalkulator i proveri okvirnu procenu za svoju vožnju.',
                    en: 'Range depends on battery capacity, rider weight, and average speed. Open the calculator to check an estimate for your ride.',
                    ru: 'Запас хода зависит от емкости батареи, веса райдера и средней скорости. Откройте калькулятор и получите примерную оценку для вашей поездки.',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRangeCalculatorOpen(true)}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-wider text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calculator className="size-5" />
                {tr({ sr: 'Saznaj više', en: 'Learn more', ru: 'Узнать больше' })}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Savings Quiz */}
      <section id="kviz" ref={savingsQuizRef} tabIndex={-1} className="scroll-mt-24 bg-white px-3 py-6 text-black outline-none sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto max-w-5xl rounded-2xl border border-black/10 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5 lg:p-6"
        >
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_0.78fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black px-2.5 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.14em] text-white sm:px-3 sm:text-[0.6rem]">
                <Car className="size-3.5" />
                {tr({ sr: 'Automobil', en: 'Car', ru: 'Автомобиль' })}
              </div>
              <h2 className="mt-3 max-w-xl text-xl font-black leading-[1.05] tracking-tight sm:mt-4 sm:text-4xl">
                {tr({ sr: 'Koliko ostaje u d\u017eepu?', en: 'How much stays in your pocket?', ru: 'Сколько остается в кармане?' })}
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-black/60 sm:mt-3 sm:text-base">
                {tr({
                  sr: 'Unesi svoju dnevnu vo\u017enju i cenu goriva. Dobija\u0161 brzu procenu razlike izme\u0111u automobila i Pogon e-bicikla.',
                  en: 'Enter your daily ride and fuel cost. Get a quick estimate of the difference between a car and a Pogon e-bike.',
                  ru: 'Введите ежедневный пробег и цену топлива. Получите быструю оценку разницы между автомобилем и электровелосипедом Pogon.',
                })}
              </p>
            </div>
            <div className="rounded-2xl bg-black p-3 text-center text-white sm:p-4">
              <div className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-white/50">
                {tr({ sr: 'Godi\u0161nja u\u0161teda', en: 'Yearly savings', ru: 'Экономия в год' })}
              </div>
              <div className="mt-2 text-2xl font-black leading-none sm:text-4xl">{formatRsd(yearlySavings)}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-[0.7rem] sm:gap-3 sm:text-sm">
                <div>
                  <div className="text-white/45">{tr({ sr: 'Po mesecu', en: 'Monthly', ru: 'В месяц' })}</div>
                  <div className="mt-1 font-black">{formatRsd(monthlySavings)}</div>
                </div>
                <div>
                  <div className="text-white/45">CO2</div>
                  <div className="mt-1 font-black">{new Intl.NumberFormat('sr-RS').format(yearlyCo2Kg)} kg</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-3 sm:gap-4">
              {[
                {
                  key: 'dailyKm' as const,
                  label: tr({ sr: 'Kilometara dnevno', en: 'Daily kilometers', ru: 'Километров в день' }),
                  suffix: 'km',
                  min: 1,
                  max: 100,
                  step: 1,
                },
                {
                  key: 'fuelPrice' as const,
                  label: tr({ sr: 'Cena goriva', en: 'Fuel price', ru: 'Цена топлива' }),
                  suffix: 'RSD',
                  min: 100,
                  max: 300,
                  step: 5,
                },
                {
                  key: 'fuelConsumption' as const,
                  label: tr({ sr: 'Potro\u0161nja auta', en: 'Car consumption', ru: 'Расход автомобиля' }),
                  suffix: 'L/100km',
                  min: 3,
                  max: 15,
                  step: 0.5,
                },
              ].map((field) => (
                <label key={field.key} className="block border-t border-black/10 pt-2.5 first:border-t-0 first:pt-0 sm:pt-3">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-[0.7rem] font-black uppercase tracking-[0.08em] text-black/60 sm:text-sm">{field.label}</span>
                    <span className="text-sm font-black sm:text-base">
                      {savingsQuiz[field.key]} {field.suffix}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={savingsQuiz[field.key]}
                    onChange={(event) => updateSavingsQuiz(field.key, Number(event.target.value))}
                    className="h-1.5 w-full accent-black"
                  />
                </label>
              ))}
            </div>
            <div className="flex h-full flex-col justify-center gap-2 sm:flex-row sm:items-center lg:w-56 lg:flex-col">
              <a href="#modeli" className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-black px-5 text-xs font-black uppercase tracking-wider text-white transition-transform hover:scale-[1.01] active:scale-[0.99] sm:min-h-12 sm:text-sm">
                {tr({ sr: 'Istra\u017ei modele', en: 'Explore models', ru: 'Смотреть модели' })}
              </a>
              <p className="text-center text-[0.7rem] leading-relaxed text-black/45 sm:text-left lg:text-center">
                {tr({
                  sr: '* Struja je ra\u010dunata okvirno kao 0.5 RSD/km.',
                  en: '* Electricity is estimated at roughly 0.5 RSD/km.',
                  ru: '* Электроэнергия рассчитана примерно как 0.5 RSD/км.',
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Legacy Savings Quiz */}
      <section className="hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.72fr_1.28fr]"
        >
          <div className="flex flex-col justify-between overflow-hidden rounded-[2rem] bg-black p-6 text-white shadow-xl sm:p-8 lg:min-h-[34rem]">
            <div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.18em] text-white/60">
                <Car className="size-4" />
                {tr({ sr: 'Automobil', en: 'Car', ru: 'Автомобиль' })}
              </div>
              <h2 className="mt-6 max-w-[10ch] text-4xl font-black leading-[0.96] tracking-tight sm:text-5xl">
                {tr({ sr: 'Izra\u010dunaj u\u0161tedu bez naga\u0111anja', en: 'Calculate savings without guessing', ru: 'Рассчитайте экономию без догадок' })}
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/65">
                {tr({
                  sr: 'Podesi svakodnevnu vo\u017enju i cenu goriva. Kalkulator odmah prikazuje koliko prelazak na Pogon mo\u017ee da promeni mese\u010dni i godi\u0161nji tro\u0161ak.',
                  en: 'Adjust your daily ride and fuel price. The calculator shows how switching to Pogon can change monthly and yearly running costs.',
                  ru: 'Настройте ежедневный пробег и цену топлива. Калькулятор сразу покажет, как переход на Pogon может изменить ежемесячные и годовые расходы.',
                })}
              </p>
            </div>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white px-5 py-4 text-black">
              <div className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-black/45">
                {tr({ sr: 'Procena', en: 'Estimate', ru: 'Оценка' })}
              </div>
              <div className="mt-1 text-2xl font-black leading-none">{formatRsd(yearlySavings)}</div>
              <div className="mt-1 text-xs text-black/50">{tr({ sr: 'godi\u0161nje', en: 'per year', ru: 'в год' })}</div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl sm:p-6 lg:p-8">
          <div className="hidden">
            <div>
              <div className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-5 text-base font-black text-black sm:w-auto sm:text-lg">
                <Car className="size-5" />
                {tr({ sr: 'Automobil', en: 'Car', ru: 'Автомобиль' })}
              </div>
              <h2 className="sr-only">
                {tr({ sr: 'Koliko možeš da uštediš?', en: 'How much can you save?', ru: 'Сколько можно сэкономить?' })}
              </h2>
            </div>
            <a href="#modeli" className="hidden">
              {ui.navModels}
            </a>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                key: 'dailyKm' as const,
                label: tr({ sr: 'Koliko km dnevno voziš?', en: 'How many km do you ride daily?', ru: 'Сколько км в день вы ездите?' }),
                suffix: 'km',
                min: 1,
                max: 100,
                step: 1,
              },
              {
                key: 'fuelPrice' as const,
                label: tr({ sr: 'Cena goriva po litru', en: 'Fuel price per liter', ru: 'Цена топлива за литр' }),
                suffix: 'RSD',
                min: 100,
                max: 300,
                step: 5,
              },
              {
                key: 'fuelConsumption' as const,
                label: tr({ sr: 'Potrošnja goriva', en: 'Fuel consumption', ru: 'Расход топлива' }),
                suffix: 'L/100km',
                min: 3,
                max: 15,
                step: 0.5,
              },
            ].map((field) => (
              <label key={field.key} className="block rounded-2xl border border-black/10 bg-[#f7f7f4] p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-sm font-black leading-tight sm:text-base">{field.label}</span>
                  <span className="shrink-0 rounded-full bg-black px-3 py-1 text-sm font-black text-white">
                    {savingsQuiz[field.key]} {field.suffix}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={savingsQuiz[field.key]}
                  onChange={(event) => updateSavingsQuiz(field.key, Number(event.target.value))}
                  className="h-2 w-full accent-black"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 text-center">
              <div className="text-sm text-black/55">{tr({ sr: 'Mesečna ušteda', en: 'Monthly savings', ru: 'Экономия в месяц' })}</div>
              <div className="mt-4 text-xl font-black">{formatRsd(monthlySavings)}</div>
            </div>
            <div className="rounded-2xl bg-black p-4 text-center text-white">
              <div className="text-sm text-white/65">{tr({ sr: 'Godišnja ušteda', en: 'Yearly savings', ru: 'Экономия в год' })}</div>
              <div className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{formatRsd(yearlySavings)}</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#f7f7f4] p-4 text-center">
              <div className="text-sm text-black/55">{tr({ sr: 'CO2 manje godišnje', en: 'Less CO2 yearly', ru: 'Меньше CO2 в год' })}</div>
              <div className="mt-4 text-xl font-black">{new Intl.NumberFormat('sr-RS').format(yearlyCo2Kg)} kg</div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-black/50 sm:text-sm">
            {tr({
              sr: '* Cena struje za punjenje električnog vozila ~0.5 RSD/km',
              en: '* Electricity cost for charging an electric vehicle ~0.5 RSD/km',
              ru: '* Стоимость электроэнергии для зарядки электровелосипеда ~0.5 RSD/км',
            })}
          </p>
          <a href="#modeli" className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-black px-6 text-sm font-black uppercase tracking-wider text-white transition-transform hover:scale-[1.01] active:scale-[0.99]">
            {tr({ sr: 'Istra\u017ei na\u0161e modele', en: 'Explore our models', ru: 'Смотреть наши модели' })}
          </a>
          </div>
        </motion.div>
      </section>

      {/* Technology Section */}
      <section id="tehnologija" className="py-14 sm:py-28 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8 sm:mb-16 lg:mb-20">
            <div className="inline-block px-4 py-1 bg-primary/10 rounded-full text-xs uppercase tracking-widest font-semibold mb-4">{ui.innovation}</div>
            <h2 className="mx-auto max-w-[12ch] text-3xl font-black leading-[1.04] tracking-tight sm:text-4xl md:max-w-none md:text-6xl">{ui.technologyTitle}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            {[
              { icon: Battery, card: ui.technologyCards[0] },
              { icon: Zap, card: ui.technologyCards[1] },
              { icon: Gauge, card: ui.technologyCards[2] },
              { icon: Shield, card: ui.technologyCards[3] },
            ].map(({ icon: Icon, card }, index) => {
              const isActive = activeTechnologyCard === index;

              return (
                <motion.button
                  key={card.title}
                  type="button"
                  initial={{ opacity: 0, y: 22, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveTechnologyCard(isActive ? null : index)}
                  aria-expanded={isActive}
                  className={`min-h-[13rem] rounded-3xl border p-5 text-left shadow-sm transition-all ${
                    isActive ? 'border-primary/50 bg-card shadow-lg' : 'border-border bg-card'
                  }`}
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <Icon className="size-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
                  <motion.div
                    initial={false}
                    animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-sm leading-relaxed text-foreground/60">
                      {card.body}
                    </p>
                  </motion.div>
                  <div className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-foreground/35">
                    {isActive ? copy.close : copy.clickSpecs}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="hidden lg:grid lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-card p-10 rounded-3xl border border-border hover:border-primary/50 transition-all group">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Battery className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{ui.technologyCards[0].title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                {ui.technologyCards[0].body}
              </p>
            </div>
            <div className="bg-card p-10 rounded-3xl border border-border hover:border-primary/50 transition-all group">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{ui.technologyCards[1].title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                {ui.technologyCards[1].body}
              </p>
            </div>
            <div className="bg-card p-10 rounded-3xl border border-border hover:border-primary/50 transition-all group">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gauge className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{ui.technologyCards[2].title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                {ui.technologyCards[2].body}
              </p>
            </div>
            <div className="bg-card p-10 rounded-3xl border border-border hover:border-primary/50 transition-all group">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{ui.technologyCards[3].title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                {ui.technologyCards[3].body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="iskustva" className="py-14 sm:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8 sm:mb-20">
            <div className="inline-block px-4 py-1 bg-primary/10 rounded-full text-xs uppercase tracking-widest font-semibold mb-4">{ui.reviewsEyebrow}</div>
            <h2 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tight">{copy.customerReviews}</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-border/50 bg-background/90">
            <div className="review-marquee flex gap-4 px-6 py-6 min-w-full">
              {reviewLoop.map((review, index) => (
                <div
                  key={`${review.name}-${index}`}
                  className="review-card min-w-[47vw] max-w-[47vw] sm:min-w-[22rem] md:min-w-[24rem] lg:min-w-[18rem] lg:max-w-[18rem] flex-shrink-0 rounded-3xl border border-border/60 bg-card/90 p-5 sm:p-6 shadow-md snap-center"
                >
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={`star-${index}-${starIndex}`} className="size-5 fill-yellow-400 stroke-yellow-400" />
                    ))}
                    {Array.from({ length: 5 - review.rating }).map((_, starIndex) => (
                      <Star key={`star-empty-${index}-${starIndex}`} className="size-5 fill-foreground/30 stroke-foreground/30" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-4 leading-relaxed">
                    {reviewText(review)}
                  </p>
                  <div>
                    <div className="font-semibold">{review.name}</div>
                    {review.location ? <div className="text-sm text-foreground/60">{review.location}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-14 sm:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-8">
            {[
              { icon: MapPin, service: ui.services[0] },
              { icon: Shield, service: ui.services[1] },
              { icon: Clock, service: ui.services[2] },
            ].map(({ icon: Icon, service }) => (
              <div key={service.title} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left sm:block sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:text-center">
                <div className="bg-primary/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:mx-auto sm:mb-6 sm:h-20 sm:w-20">
                  <Icon className="size-7 text-primary sm:size-10" />
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1 sm:text-xl sm:mb-3">{service.title}</h3>
                  <p className="text-foreground/60 text-sm">{service.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and FAQ */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              viewport={{ once: true, amount: 0.25 }}
              className="rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-7"
            >
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                  <Phone className="size-4" />
                  {tr({ sr: 'Kontakt', en: 'Contact', ru: 'Контакт' })}
                </div>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  {copy.heroPrimary}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  {tr({
                    sr: 'Ostavi broj i grad. Javićemo ti se uskoro da dogovorimo termin.',
                    en: 'Leave your number and city. We will contact you soon to arrange a time.',
                    ru: 'Оставьте номер и город. Мы скоро свяжемся, чтобы договориться о времени.',
                  })}
                </p>
              </div>

              {testRideFormStatus === 'success' ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <CheckCircle2 className="mb-3 size-8 text-primary" />
                  <p className="font-bold">
                    {tr({
                      sr: 'Hvala! Javićemo ti se uskoro da dogovorimo test vožnju.',
                      en: 'Thank you! We will contact you soon to arrange your test ride.',
                      ru: 'Спасибо! Мы скоро свяжемся, чтобы договориться о тест-драйве.',
                    })}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTestRideFormSubmit} className="space-y-4">
                  {[
                    { key: 'name', label: tr({ sr: 'Ime', en: 'Name', ru: 'Имя' }), type: 'text', autoComplete: 'name' },
                    { key: 'phone', label: tr({ sr: 'Telefon', en: 'Phone', ru: 'Телефон' }), type: 'tel', autoComplete: 'tel' },
                    { key: 'city', label: tr({ sr: 'Grad', en: 'City', ru: 'Город' }), type: 'text', autoComplete: 'address-level2' },
                    { key: 'preferredTime', label: tr({ sr: 'Kada želiš test vožnju?', en: 'When would you like a test ride?', ru: 'Когда вам удобно пройти тест-драйв?' }), type: 'text', autoComplete: 'off' },
                  ].map((field) => (
                    <label key={field.key} className="block text-xs font-bold uppercase tracking-wider text-foreground/60">
                      {field.label}
                      <input
                        value={testRideForm[field.key as keyof typeof testRideForm]}
                        onChange={(event) => {
                          setTestRideForm((current) => ({ ...current, [field.key]: event.target.value }));
                          if (testRideFormStatus === 'error') setTestRideFormStatus('idle');
                        }}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        inputMode={field.key === 'phone' ? 'tel' : 'text'}
                        className="mt-2 h-14 w-full rounded-2xl border border-border bg-white px-4 text-base font-normal normal-case tracking-normal outline-none transition-colors focus:border-primary"
                      />
                    </label>
                  ))}
                  {testRideFormStatus === 'error' ? (
                    <p className="text-sm font-medium text-red-600" role="alert">
                      {tr({
                        sr: 'Unesi ime i telefon da bismo mogli da te kontaktiramo.',
                        en: 'Enter your name and phone so we can contact you.',
                        ru: 'Введите имя и телефон, чтобы мы могли связаться с вами.',
                      })}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={testRideFormStatus === 'submitting'}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-black uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <CalendarCheck className="size-5" />
                    {testRideFormStatus === 'submitting'
                      ? tr({ sr: 'Slanje...', en: 'Sending...', ru: 'Отправка...' })
                      : tr({ sr: 'Pošalji zahtev', en: 'Send request', ru: 'Отправить заявку' })}
                  </button>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="mb-6">
                <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">FAQ</div>
                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  {tr({ sr: 'Najčešća pitanja', en: 'Frequently asked questions', ru: 'Частые вопросы' })}
                </h2>
              </div>
              <div className="space-y-3">
                {faqItems.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={item.question} className="overflow-hidden rounded-2xl border border-border bg-card">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold"
                      >
                        <span>{item.question}</span>
                        <ChevronDown className={`size-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-foreground/60">{item.answer}</p>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,0,0,0.03)_0%,transparent_50%)]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm mb-8">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
              </span>
              <span className="uppercase tracking-wider text-xs font-medium">{copy.badge}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-5 sm:mb-8 tracking-tight leading-[1.02] md:leading-none">{copy.finalTitle}</h2>

            <p className="text-lg sm:text-xl md:text-2xl text-foreground/60 mb-8 sm:mb-12 max-w-3xl mx-auto font-light leading-relaxed">{copy.finalBody}</p>

            <div className="flex flex-col gap-3 justify-center mb-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <button
                type="button"
                onClick={() => openLeadModal('final-primary-cta')}
                className="group bg-primary text-primary-foreground px-8 py-5 rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-[0.98] text-sm sm:text-base uppercase tracking-wider font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
              >
                <CalendarCheck className="size-5" />
                {copy.heroPrimary}
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleWhatsappClick('final-cta')}
                className="inline-flex items-center justify-center gap-3 border-2 border-border px-8 py-5 rounded-full hover:bg-accent transition-all active:scale-[0.98] text-sm sm:text-base uppercase tracking-wider font-bold"
              >
                <MessageCircle className="size-5" />
                WhatsApp
              </a>
              <a
                href={phoneHref}
                onClick={() => handlePhoneClick('final-cta')}
                className="inline-flex items-center justify-center gap-3 border-2 border-border px-8 py-5 rounded-full hover:bg-accent transition-all active:scale-[0.98] text-sm sm:text-base uppercase tracking-wider font-bold"
              >
                <Phone className="size-5" />
                {tr({ sr: 'Pozovi odmah', en: 'Call now', ru: 'Позвонить сейчас' })}
              </a>
            </div>

            <div className="mx-auto mb-8 flex max-w-4xl flex-wrap items-center justify-center gap-2">
              {trustBadges.map((badge, index) => {
                const Icon = trustBadgeIcons[index];
                return (
                  <div key={`final-trust-${badge}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-foreground/70">
                    <Icon className="size-3.5 text-primary" />
                    {badge}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-foreground/60">
              {ui.ctaBullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary"></div>
                  {bullet}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {lightboxModel && lightboxGallery && lightboxImage ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`${lightboxModel.name} photo viewer`}
          onClick={closeLightbox}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
            <div>
              <div className="text-lg font-black leading-none">{lightboxModel.name}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/55">
                {lightboxIndex + 1} / {lightboxGallery.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full border border-white/20 bg-white/10 p-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    zoomLightboxOut();
                  }}
                  disabled={!canZoomOut}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="size-4" />
                </button>
                <div className="min-w-14 text-center text-xs font-black tabular-nums text-white/75">
                  {Math.round(lightboxZoom * 100)}%
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    zoomLightboxIn();
                  }}
                  disabled={!canZoomIn}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightboxZoom(1);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Reset zoom"
              >
                <RotateCcw className="size-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeLightbox();
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close photo viewer"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-5 sm:px-16">
            <button
              type="button"
              aria-label={`Previous ${lightboxModel.name} photo`}
              onClick={(event) => {
                event.stopPropagation();
                setLightboxImage((lightboxIndex - 1 + lightboxGallery.length) % lightboxGallery.length);
              }}
              className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (canZoomIn) {
                  zoomLightboxIn();
                } else {
                  setLightboxZoom(1);
                }
              }}
              className={`flex h-full w-full items-center justify-center overflow-auto rounded-2xl bg-black ${canZoomIn ? 'cursor-zoom-in' : 'cursor-zoom-out'}`}
              aria-label={canZoomIn ? 'Zoom image' : 'Reset zoom'}
            >
              <ImageWithFallback
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                className="max-h-full max-w-full object-contain object-center transition-transform duration-300"
                style={{ transform: `scale(${lightboxZoom})` }}
              />
            </button>

            <button
              type="button"
              aria-label={`Next ${lightboxModel.name} photo`}
              onClick={(event) => {
                event.stopPropagation();
                setLightboxImage((lightboxIndex + 1) % lightboxGallery.length);
              }}
              className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          <div className="border-t border-white/10 px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto">
              {lightboxGallery.map((image, index) => (
                <button
                  key={`lightbox-${image.src}`}
                  type="button"
                  aria-label={`Show ${lightboxModel.name} photo ${index + 1}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightboxImage(index);
                  }}
                  className={`aspect-square w-16 flex-none overflow-hidden rounded-xl bg-white transition-all sm:w-20 ${
                    lightboxIndex === index ? 'ring-2 ring-primary' : 'opacity-65 ring-1 ring-white/20 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 sm:py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-x-5 gap-y-8 mb-8 md:grid-cols-5 md:gap-12 md:mb-12">
            <div className="col-span-3 md:col-span-2">
              <div className="flex items-center justify-between gap-4 mb-4 md:block md:mb-6">
                <div className="relative">
                  <img src={publicAsset('Logo.png')} alt="POGON" className="h-12 w-auto sm:h-20" />
                </div>
                <a href="https://instagram.com/pogonrs" target="_blank" rel="noreferrer" aria-label="Pogon Instagram" className="size-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors md:mt-6">
                  <Instagram className="size-5" />
                </a>
              </div>
              <p className="max-w-sm text-sm text-foreground/60 leading-relaxed">{ui.footerBody}</p>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">{ui.footerProducts}</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-foreground/60">
                <li><a href="#modeli" className="hover:text-foreground transition-colors">Glide</a></li>
                <li><a href="#modeli" className="hover:text-foreground transition-colors">Core</a></li>
                <li><a href="#modeli" className="hover:text-foreground transition-colors">Cargo</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{ui.footerCompare}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">{ui.footerSupport}</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-foreground/60">
                {ui.footerSupportLinks.map((item, index) => (
                  <li key={item}>
                    {index === 0 ? (
                      <button type="button" onClick={() => openLeadModal('footer-test-ride')} className="hover:text-foreground transition-colors">{item}</button>
                    ) : (
                      <a href={buildWhatsappLink(footerSupportMessages[index])} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">{item}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">{ui.footerCompany}</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-foreground/60">
                {ui.footerCompanyLinks.map((item, index) => (
                  <li key={item}>
                    <a href={buildWhatsappLink(footerCompanyMessages[index])} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-5 sm:pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
              <p className="text-sm text-foreground/50">© 2026 POGON. {ui.copyright}</p>
              <div className="flex gap-4 sm:gap-6 text-sm text-foreground/50">
                <a href="#" className="hover:text-foreground transition-colors">{ui.footerLegal[0]}</a>
                <a href="#" className="hover:text-foreground transition-colors">{ui.footerLegal[1]}</a>
                <a href="#" className="hover:text-foreground transition-colors">{ui.footerLegal[2]}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-[70] hidden flex-col items-end gap-3 sm:bottom-6 sm:right-6 md:flex">
        {isContactWidgetOpen && (
          <div className="w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-black/10 bg-white p-5 text-black shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#65c900]">POGON</p>
                <h3 className="mt-1 text-lg font-black">{tr({ sr: 'Tu smo da pomognemo', en: 'We’re here to help', ru: 'Мы рядом, чтобы помочь' })}</h3>
              </div>
              <button type="button" onClick={() => setIsContactWidgetOpen(false)} aria-label={copy.close} className="rounded-full p-1.5 text-black/40 hover:bg-black/5 hover:text-black"><X className="size-4" /></button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-black/55">{tr({
              sr: 'Razgovarajte sa Pogon stručnjakom i pronađite pravi bicikl za vas.',
              en: 'Talk with a Pogon specialist and find the right bike for you.',
              ru: 'Поговорите со специалистом Pogon и найдите подходящий велосипед.',
            })}</p>
            <button type="button" onClick={() => { setIsContactWidgetOpen(false); openLeadModal('specialist-contact'); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]">
              <MessageCircle className="size-4 text-[#7fff00]" />
              {tr({ sr: 'Zakaži razgovor', en: 'Book a call', ru: 'Записаться на звонок' })}
            </button>
          </div>
        )}
        <button type="button" onClick={() => setIsContactWidgetOpen((current) => !current)} aria-expanded={isContactWidgetOpen} className="group inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-bold text-white shadow-[0_12px_35px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.04] sm:px-5">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#7fff00] text-black"><MessageCircle className="size-4" /></span>
          <span>{tr({ sr: 'Kontaktirajte nas', en: 'Contact us', ru: 'Связаться с нами' })}</span>
        </button>
      </div>

      {/* Mobile sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border/60 bg-white/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <button
            type="button"
            onClick={() => openLeadModal('mobile-sticky-cta')}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
          >
            <CalendarCheck className="size-4" />
            {copy.heroPrimary}
          </button>
          <a
            href={phoneHref}
            onClick={() => handlePhoneClick('mobile-sticky-cta')}
            aria-label={copy.heroSecondary}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card text-foreground transition-transform active:scale-[0.98]"
          >
            <Phone className="size-5" />
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleWhatsappClick('mobile-sticky-cta')}
            aria-label="WhatsApp"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-black transition-transform active:scale-[0.98]"
          >
            <MessageCircle className="size-5" />
          </a>
        </div>
      </div>

      <AnimatePresence>
        {isRangeCalculatorOpen ? (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-1 backdrop-blur-md sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="range-calculator-title"
            onMouseDown={(event) => event.target === event.currentTarget && setIsRangeCalculatorOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[calc(100dvh-0.5rem)] w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#080812] text-white shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl lg:h-[80dvh] lg:w-[80vw] lg:max-w-none lg:overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
              <button
                type="button"
                onClick={() => setIsRangeCalculatorOpen(false)}
                aria-label={copy.close}
                className="absolute right-2 top-2 z-10 rounded-full bg-white/8 p-1.5 text-white/55 transition-colors hover:bg-white/14 hover:text-white sm:right-4 sm:top-4 sm:p-2"
              >
                <X className="size-4 sm:size-5" />
              </button>

              <div className="grid min-h-full gap-0 lg:h-full lg:grid-cols-[0.78fr_1.22fr]">
                <div className="border-b border-white/10 p-2 sm:p-5 lg:flex lg:h-full lg:flex-col lg:border-b-0 lg:border-r lg:p-[clamp(1.5rem,2vw,2.5rem)]">
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[0.52rem] font-bold uppercase tracking-[0.14em] text-white/70 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[0.62rem]">
                    <Calculator className="size-3.5 text-white sm:size-4" />
                    {tr({ sr: 'Kalkulator dometa', en: 'Range calculator', ru: 'Калькулятор запаса хода' })}
                  </div>
                  <h2 id="range-calculator-title" className="mt-1.5 pr-9 text-base font-black leading-tight tracking-tight sm:mt-3 sm:text-3xl lg:mt-5 lg:pr-0 lg:text-[clamp(2rem,2.9vw,3.6rem)]">
                    {tr({ sr: 'Kako se računa Wh i realan domet?', en: 'How Wh and real range are calculated', ru: 'Как рассчитываются Wh и реальный запас хода?' })}
                  </h2>
                  <p className="mt-2 hidden text-xs leading-relaxed text-white/60 sm:mt-3 sm:text-sm lg:mt-5 lg:block lg:text-base">
                    {tr({
                      sr: 'Kapacitet baterije je V x Ah = Wh.',
                      en: 'Battery capacity is V x Ah = Wh.',
                      ru: 'Емкость батареи рассчитывается так: V x Ah = Wh.',
                    })}
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-3 lg:mt-8 lg:gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2 sm:rounded-2xl sm:p-3 lg:p-5">
                      <div className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-white/40 sm:text-[0.62rem]">Wh</div>
                      <div className="mt-1 text-xl font-black sm:text-4xl lg:text-[clamp(2.5rem,4vw,4.5rem)]">{batteryWh}</div>
                      <div className="mt-0.5 text-[0.68rem] text-white/45 sm:text-xs">{usableBatteryWh} {tr({ sr: 'upotrebljivo', en: 'usable', ru: 'доступно' })} Wh</div>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/[0.09] p-2 sm:rounded-2xl sm:p-3 lg:p-5">
                      <div className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-white/55 sm:text-[0.62rem]">{tr({ sr: 'Procena', en: 'Estimate', ru: 'Оценка' })}</div>
                      <div className="mt-1 text-xl font-black text-white sm:text-4xl lg:text-[clamp(2.5rem,4vw,4.5rem)]">{estimatedRangeKm}</div>
                      <div className="mt-0.5 text-[0.68rem] text-white/50 sm:text-xs">{rangeLowKm}-{rangeHighKm} km</div>
                    </div>
                  </div>

                  <div className="hidden">
                    <div className="flex items-center justify-start gap-2 lg:justify-between lg:gap-3">
                      <span>{copy.motor}</span>
                      <span className="font-black text-white">{legalMotorWatts}W</span>
                    </div>
                    <div className="mt-2 hidden h-1.5 overflow-hidden rounded-full bg-white/10 lg:block">
                      <div className="h-full w-full rounded-full bg-white" />
                    </div>
                    <p className="mt-1 hidden text-[0.65rem] leading-relaxed text-white/42 lg:block">
                      {tr({
                        sr: 'Snaga motora ostaje zaključana na 250W jer je to standardni legalni limit za e-bike.',
                        en: 'Motor power stays locked at 250W because that is the standard legal e-bike limit.',
                        ru: 'Мощность мотора остается ограниченной 250W, потому что это стандартный легальный лимит для e-bike.',
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-2 sm:p-5 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:p-[clamp(1.5rem,2vw,2.5rem)]">
                  <div className="grid grid-cols-1 items-start gap-1.5 sm:gap-2 lg:grid-cols-2 lg:gap-4">
                    <div className="grid grid-cols-2 items-start gap-1.5 self-start rounded-xl border border-white/10 bg-white/[0.045] p-1 sm:gap-2 sm:rounded-2xl sm:p-2 lg:col-span-2 lg:p-3">
                      {[
                        { key: 'lithium' as const, label: 'Lithium-ion' },
                        { key: 'lead' as const, label: 'Lead-acid' },
                      ].map((option) => {
                        const isSelected = rangeCalculator.chemistry === option.key;
                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setRangeCalculator((current) => ({ ...current, chemistry: option.key }))}
                            className={`h-8 rounded-lg px-2 py-1 text-center transition-all sm:h-9 sm:rounded-xl sm:px-2.5 sm:py-2 lg:h-10 lg:text-left ${
                              isSelected ? 'bg-white text-black' : 'bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <div className="text-[0.68rem] font-black leading-none sm:text-xs lg:text-sm">{option.label}</div>
                          </button>
                        );
                      })}
                    </div>
                    {[
                      {
                        key: 'riderKg' as const,
                        label: tr({ sr: 'Težina vozača', en: 'Rider weight', ru: 'Вес райдера' }),
                        suffix: 'kg',
                        min: 45,
                        max: 130,
                        step: 1,
                      },
                      {
                        key: 'averageSpeed' as const,
                        label: tr({ sr: 'Prosečna brzina', en: 'Average speed', ru: 'Средняя скорость' }),
                        suffix: 'km/h',
                        min: 12,
                        max: 40,
                        step: 1,
                      },
                      {
                        key: 'voltage' as const,
                        label: tr({ sr: 'Napon baterije', en: 'Battery voltage', ru: 'Напряжение батареи' }),
                        suffix: 'V',
                        min: 36,
                        max: 60,
                        step: 1,
                      },
                      {
                        key: 'ampHours' as const,
                        label: tr({ sr: 'Kapacitet baterije', en: 'Battery amp-hours', ru: 'Емкость батареи' }),
                        suffix: 'Ah',
                        min: 8,
                        max: 35,
                        step: 1,
                      },
                    ].map((field) => (
                      <label key={field.key} className="rounded-xl border border-white/10 bg-white/[0.045] p-1.5 sm:rounded-2xl sm:p-2 lg:p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[0.66rem] font-bold leading-tight text-white/78 sm:text-xs lg:text-base">{field.label}</span>
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[0.62rem] font-black text-white sm:px-2 sm:py-1 sm:text-xs lg:text-sm">
                            {rangeCalculator[field.key]} {field.suffix}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={rangeCalculator[field.key]}
                          onChange={(event) => updateRangeCalculator(field.key, Number(event.target.value))}
                          className="mt-1.5 h-1.5 w-full accent-white sm:mt-2 lg:mt-5"
                        />
                        <div className="mt-2 hidden items-center gap-2 lg:flex lg:mt-4">
                          <input
                            type="number"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={rangeCalculator[field.key]}
                            onChange={(event) => updateRangeCalculator(field.key, Number(event.target.value))}
                            className="h-8 w-16 rounded-xl border border-white/10 bg-black/25 px-2 text-sm font-bold text-white outline-none transition-colors focus:border-white/60 sm:w-24 sm:px-3 md:h-11 md:w-28"
                          />
                          <span className="hidden text-[0.68rem] font-medium text-white/38 sm:inline">
                            {field.min} - {field.max} {field.suffix}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:mt-2 sm:gap-2 lg:mt-auto lg:gap-4">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-1.5 sm:rounded-2xl sm:p-2 lg:p-4">
                      <div className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-white/35">{tr({ sr: 'Potrošnja', en: 'Use', ru: 'Расход' })}</div>
                      <div className="mt-0.5 text-base font-black sm:mt-1 sm:text-xl lg:text-2xl">{whPerKm.toFixed(1)}</div>
                      <div className="text-[0.6rem] text-white/40 sm:text-xs">Wh/km</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-1.5 sm:rounded-2xl sm:p-2 lg:p-4">
                      <div className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-white/35">{copy.motor}</div>
                      <div className="mt-0.5 text-base font-black sm:mt-1 sm:text-xl lg:text-2xl">{legalMotorWatts}W</div>
                      <div className="text-[0.6rem] text-white/40 sm:text-xs">{tr({ sr: 'limit', en: 'limit', ru: 'лимит' })}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-1.5 sm:rounded-2xl sm:p-2 lg:p-4">
                      <div className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-white/35">{tr({ sr: 'Formula', en: 'Formula', ru: 'Формула' })}</div>
                      <div className="mt-0.5 text-xs font-black sm:mt-1 sm:text-base lg:text-lg">V x Ah</div>
                      <div className="text-[0.6rem] text-white/40 sm:text-xs">= Wh</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRangeCalculatorOpen(false);
                      openLeadModal('range-calculator-test-ride');
                    }}
                    className="mt-1.5 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-[0.7rem] font-black uppercase tracking-wider text-black transition-transform hover:scale-[1.015] active:scale-[0.98] hover:bg-white/90 sm:mt-3 sm:min-h-12 sm:text-sm"
                  >
                    <CalendarCheck className="size-4 sm:size-5" />
                    {copy.heroPrimary}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LeadContactModal
        isOpen={leadModalSource !== null}
        lang={lang}
        source={leadModalSource ?? 'unknown'}
        intent={leadModalSource?.startsWith('purchase-') ? 'purchase' : leadModalSource === 'specialist-contact' ? 'consultation' : 'test-ride'}
        whatsappHref={buildWhatsappLink(
          leadModalSource === 'specialist-contact'
            ? tr({
                sr: 'Zdravo, želeo/la bih da razgovaram sa Pogon stručnjakom.',
                en: 'Hi, I would like to speak with a Pogon specialist.',
                ru: 'Здравствуйте, я хотел(а) бы поговорить со специалистом Pogon.',
              })
            : leadModalSource?.startsWith('purchase-')
            ? tr({
                sr: `Zdravo, zanima me kupovina ${leadModalSource.replace('purchase-', '')} modela.`,
                en: `Hi, I am interested in buying the ${leadModalSource.replace('purchase-', '')} model.`,
                ru: `Здравствуйте, меня интересует покупка модели ${leadModalSource.replace('purchase-', '')}.`,
              })
            : tr({
                sr: 'Zdravo, želim da zakažem test vožnju.',
                en: 'Hi, I want to book a test ride.',
                ru: 'Здравствуйте, хочу записаться на тест-драйв.',
              })
        )}
        onClose={closeLeadModal}
      />
    </div>
  );
}
