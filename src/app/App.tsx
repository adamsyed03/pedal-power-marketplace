import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './components/ImageWithFallback';
import { Battery, Zap, Gauge, Shield, ArrowRight, Star, MapPin, Clock, Instagram, ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { motion } from 'motion/react';
import { ScrollyCanvas } from './components/ScrollyCanvas';
import { Overlay } from './components/Overlay';

const homeCopyEn = {
  heroTitle: 'Get moving',
  heroSub: 'Electric bikes for city commutes and plans that don’t wait.',
  heroPrimary: 'View models',
  heroSecondary: 'Book a test ride',
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
  heroPrimary: 'Pogledaj modele',
  heroSecondary: 'Zakaži test vožnju',
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

export default function App() {
  const [lang, setLang] = useState<'en' | 'sr'>('sr');
  const [activeSpecs, setActiveSpecs] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState(0);
  const [activeTechnologyCard, setActiveTechnologyCard] = useState<number | null>(null);
  const [activeGalleryImages, setActiveGalleryImages] = useState<Record<string, number>>({});
  const [activeLightboxProduct, setActiveLightboxProduct] = useState<string | null>(null);
  const [isLightboxZoomed, setIsLightboxZoomed] = useState(false);
  const productScrollRef = useRef<HTMLDivElement | null>(null);
  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const scrollLockTimeout = useRef<number | null>(null);
  const pageScrollTimeout = useRef<number | null>(null);
  const copy = lang === 'sr' ? homeCopySr : homeCopyEn;
  const ui = lang === 'sr'
    ? {
        navModels: 'Modeli',
        navTechnology: 'Tehnologija',
        navReviews: 'Iskustva',
        specs: 'Specifikacije',
        innovation: 'Inovacija',
        technologyTitle: 'Tehnologija Koja Pokreće',
        technologyCards: [
          { title: 'Napredna Baterija', body: 'Samsung SDI ćelije sa inteligentnim BMS sistemom za optimalnu autonomiju' },
          { title: 'Bafang Motor', body: 'Premium mid-drive motor sa 160Nm obrtnog momenta' },
          { title: 'Smart Kontrola', body: 'Kolor displej sa GPS navigacijom i praćenjem performansi' },
          { title: 'Sigurnost', body: 'Shimano hidraulične kočnice i integrisani LED svetlosni sistem' },
        ],
        reviewsEyebrow: 'Iskustva',
        lifestyleCards: [
          { title: 'Urbana Avantura', body: 'Grad je tvoj teren za igru' },
          { title: 'Sloboda Pokreta', body: 'Bez granica, bez kompromisa' },
        ],
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
      }
    : {
        navModels: 'Models',
        navTechnology: 'Technology',
        navReviews: 'Reviews',
        specs: 'Specifications',
        innovation: 'Innovation',
        technologyTitle: 'Technology That Moves You',
        technologyCards: [
          { title: 'Advanced Battery', body: 'Samsung SDI cells with an intelligent BMS system for optimal range' },
          { title: 'Bafang Motor', body: 'Premium mid-drive motor with 160Nm of torque' },
          { title: 'Smart Control', body: 'Color display with GPS navigation and performance tracking' },
          { title: 'Safety', body: 'Shimano hydraulic brakes and an integrated LED lighting system' },
        ],
        reviewsEyebrow: 'Reviews',
        lifestyleCards: [
          { title: 'Urban Adventure', body: 'The city is your terrain' },
          { title: 'Freedom of Movement', body: 'No limits, no compromises' },
        ],
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
      };
  const whatsappNumber = '381631505003';
  const buildWhatsappLink = (text: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  const footerSupportMessages = lang === 'sr'
    ? [
        'Zdravo, želim da zakažem test vožnju.',
        'Zdravo, zanima me servis za Pogon bicikl.',
        'Zdravo, imam pitanje oko garancije za Pogon.',
      ]
    : [
        'Hi, I want to book a test ride.',
        'Hi, I have a question about Pogon service.',
        'Hi, I have a question about the Pogon warranty.',
      ];
  const footerCompanyMessages = lang === 'sr'
    ? [
        'Zdravo, želim da saznam više o Pogonu.',
        'Zdravo, želim da kontaktiram Pogon tim.',
        'Zdravo, zanima me karijera u Pogonu.',
        'Zdravo, zanima me Pogon blog.',
      ]
    : [
        'Hi, I want to learn more about Pogon.',
        'Hi, I want to contact the Pogon team.',
        'Hi, I am interested in careers at Pogon.',
        'Hi, I am interested in the Pogon blog.',
      ];
  const reviews = [
    {
      name: 'Vuk Rankovic',
      location: 'Beograd',
      rating: 5,
      text: {
        sr: 'Ovaj Pogon model je totalno promenio moje gradske vožnje — tiho, snažno i pouzdano.',
        en: 'This Pogon model totally changed my city rides — quiet, powerful and reliable.',
      },
    },
    {
      name: 'Andreas Spanoudis',
      location: 'Beograd',
      rating: 5,
      text: {
        sr: 'Brza dostava, sjajan osećaj na putu i odlična podrška. Preporučujem svima.',
        en: 'Fast delivery, great ride feel and excellent support. I recommend it to everyone.',
      },
    },
    {
      name: 'Ana Sunjka',
      location: 'Novi Sad',
      rating: 5,
      text: {
        sr: 'Savršeno uklopljen u gradski ritam, dobro drži put i baterija traje dugo.',
        en: 'Perfectly matched to the city rhythm, handles well and the battery lasts long.',
      },
    },
    {
      name: 'Aleksa Djuraskovic',
      location: 'Niš',
      rating: 5,
      text: {
        sr: 'Mekano ubrzanje, stabilnost i lep dizajn. Najbolja kupovina ove godine.',
        en: 'Smooth acceleration, stability and great design. Best purchase this year.',
      },
    },
    {
      name: 'Matija Ilic',
      location: 'Novi Sad',
      rating: 5,
      text: {
        sr: 'Vožnja je sada zabavna, bez gužvi i bez stresa. Pogon je odličan izbor.',
        en: 'Riding is fun now, no traffic lines and no stress. Pogon is an excellent choice.',
      },
    },
    {
      name: 'Marko Jovanovic',
      location: 'Beograd',
      rating: 5,
      text: {
        sr: 'Odličan odnos cene i kvaliteta. Svaki dan sa osmehom idem na posao.',
        en: 'Great value for money. Now I go to work with a smile every day.',
      },
    },
    {
      name: 'Matija Jovovic',
      location: 'Niš',
      rating: 4,
      text: {
        sr: 'Vozilo je veoma stabilno, samo bi voleo da ima još jedan mod vožnje.',
        en: 'The bike is very stable, I just wish it had one more riding mode.',
      },
    },
    {
      name: 'Marija Antic',
      location: 'Novi Sad',
      rating: 4,
      text: {
        sr: 'Bicikl je odličan, samo je malo teži za žene pri nošenju uz stepenice.',
        en: 'The bike is excellent, just a bit heavy for women when carrying it up stairs.',
      },
    },
    {
      name: 'Elena Nikolaou',
      location: 'Beograd',
      rating: 4,
      text: {
        sr: 'Dizajn je fenomenalan, a komponente solidne. Jedino je sedište moglo biti mekše.',
        en: 'The design is phenomenal and components are solid. Only the seat could be softer.',
      },
    },
    {
      name: 'Luka Maric',
      location: 'Zemun',
      rating: 4,
      text: {
        sr: 'Lagan za upravljanje i brz. Malo je težak za nošenje stepenicama.',
        en: 'Easy to handle and fast. A bit heavy for carrying up stairs.',
      },
    },
  ];

  const reviewLoop = [...reviews, ...reviews];

  const reviewText = (review: { text: { sr: string; en: string } }) => (lang === 'sr' ? review.text.sr : review.text.en);

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

  const bikeModels = [
    {
      key: 'glide',
      name: 'Glide',
      badgeKey: 'bestSeller' as const,
      badgeClass: 'bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase',
      image: { src: '/Glide%20main.png', alt: 'Pogon Glide electric bike main product photo' },
      gallery: [
        { src: '/Glide%20main.png', alt: 'Pogon Glide main product photo' },
        { src: '/Glide%201.png', alt: 'Pogon Glide product photo 1' },
        { src: '/Glide%202.png', alt: 'Pogon Glide product photo 2' },
        { src: '/Glide%204.png', alt: 'Pogon Glide product photo 4' },
      ],
      description: copy.glideDescription,
      monthlyPrice: '17,000 RSD',
      price: '170,000 RSD',
      mobileSpecs: { range: '65km', power: 'od 250W', battery: '1200Wh' },
      points: lang === 'sr'
        ? [
            'Motor u zadnjem točku',
            'Aluminijumski ram',
            'Hidraulične kočnice',
            'Nosivost 110 kg',
            'Domet do 70 km',
            'GPS sigurnosne funkcije',
          ]
        : [
            'Rear hub motor',
            'Aluminum frame',
            'Hydraulic brakes',
            '110 kg load capacity',
            'Up to 70 km range',
            'GPS security features',
          ],
    },
    {
      key: 'core',
      name: 'Core',
      badgeKey: 'recommended' as const,
      badgeClass: 'bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs font-bold uppercase',
      image: { src: '/Cargo%20Main.png', alt: 'Pogon Core electric bike main product photo' },
      gallery: [
        { src: '/Cargo%20Main.png', alt: 'Pogon Core main product photo' },
        { src: '/Cargo%20fold.png', alt: 'Pogon Core folded product photo' },
        { src: '/Cargo%201.png', alt: 'Pogon Core product photo 1' },
        { src: '/Cargo%202.png', alt: 'Pogon Core product photo 2' },
      ],
      description: copy.coreDescription,
      monthlyPrice: '14,000 RSD',
      price: '140,000 RSD',
      mobileSpecs: { range: '+90km', power: 'od 250W', battery: '1512Wh' },
      points: lang === 'sr'
        ? [
            'Motor u zadnjem točku',
            'Sklopivi čelični ram',
            'Hidraulične kočnice',
            'Dve baterije, domet preko 90 km',
            'Fat tyre gume',
            'GPS sigurnosne funkcije',
          ]
        : [
            'Rear hub motor',
            'Foldable steel frame',
            'Hydraulic brakes',
            'Two batteries — up to 90 km range',
            'Fat tyre wheels',
            'GPS security features',
          ],
      isFeatured: true,
    },
    {
      key: 'cargo',
      name: 'Cargo',
      badgeKey: 'newBadge' as const,
      badgeClass: 'bg-card text-foreground px-3 py-1 rounded-full text-xs font-bold uppercase border border-border',
      image: { src: '/Core%20main.png', alt: 'Pogon Cargo electric bike main product photo' },
      gallery: [
        { src: '/Core%20main.png', alt: 'Pogon Cargo main product photo' },
        { src: '/Core%201.png', alt: 'Pogon Cargo product photo 1' },
        { src: '/Core%202.png', alt: 'Pogon Cargo product photo 2' },
        { src: '/Core%203.png', alt: 'Pogon Cargo product photo 3' },
      ],
      description: copy.cargoDescription,
      monthlyPrice: '12,000 RSD',
      price: '120,000 RSD',
      mobileSpecs: { range: '+90km', power: 'od 250W', battery: '1512Wh' },
      points: lang === 'sr'
        ? [
            'Motor u zadnjem točku',
            'Čelični ram',
            'Hidraulične kočnice',
            'Dve baterije, domet preko 90 km',
            'Fat tyre gume',
            'GPS sigurnosne funkcije',
          ]
        : [
            'Rear hub motor',
            'Steel frame',
            'Hydraulic brakes',
            'Two batteries — up to 90 km range',
            'Fat tyre wheels',
            'GPS security features',
          ],
    },
  ];

  const lightboxModel = bikeModels.find((model) => model.key === activeLightboxProduct);
  const lightboxGallery = lightboxModel && 'gallery' in lightboxModel ? lightboxModel.gallery : undefined;
  const lightboxIndex = lightboxModel ? activeGalleryImages[lightboxModel.key] ?? 0 : 0;
  const lightboxImage = lightboxGallery?.[lightboxIndex];
  const setLightboxImage = (index: number) => {
    if (!lightboxModel || !lightboxGallery) return;
    setActiveGalleryImages((current) => ({ ...current, [lightboxModel.key]: index }));
    setIsLightboxZoomed(false);
  };
  const closeLightbox = () => {
    setActiveLightboxProduct(null);
    setIsLightboxZoomed(false);
  };

  return (
    <div ref={pageRootRef} className="min-h-screen bg-background overflow-x-hidden sm:overflow-x-visible px-4 sm:px-0">
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
        @keyframes swipe-hint {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(0.9rem); opacity: 1; }
        }
        .swipe-hint-dot {
          animation: swipe-hint 1.25s ease-in-out infinite;
        }
        @media (max-width: 639px) {
          .review-card {
            min-width: min(20rem, calc(100vw - 4rem));
            max-width: min(20rem, calc(100vw - 4rem));
          }
        }
      `}</style>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-2.5 [@media_(orientation:landscape)_and_(max-height:520px)]:py-1.5">
          <div className="w-full flex h-8 items-center justify-between gap-2 rounded-full border border-black/10 bg-white/90 px-2 shadow-[0_15px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:h-auto sm:py-1.5 [@media_(orientation:landscape)_and_(max-height:520px)]:h-9 [@media_(orientation:landscape)_and_(max-height:520px)]:py-0.5">
            <a href="#top" aria-label="Back to home" className="inline-flex items-center rounded-full bg-white px-3 py-1 shadow-sm transition-transform hover:-translate-y-0.5 sm:px-4 sm:py-1.5 [@media_(orientation:landscape)_and_(max-height:520px)]:py-0.5">
              <div className="flex items-center justify-center">
                <img src="/Logo.png" alt="POGON" className="h-7 w-auto opacity-100 sm:h-9 lg:h-10 [@media_(orientation:landscape)_and_(max-height:520px)]:h-6" />
              </div>
            </a>

            <div className="hidden md:flex flex-1 items-center justify-center gap-4 text-xs uppercase tracking-wider text-black/65">
              <a href="#modeli" className="transition-colors hover:text-black">{ui.navModels}</a>
              <a href="#tehnologija" className="transition-colors hover:text-black">{ui.navTechnology}</a>
              <a href="#iskustva" className="transition-colors hover:text-black">{ui.navReviews}</a>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <button className="inline-flex items-center justify-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-black/75 transition-all hover:bg-black/10">{copy.buyNow}</button>
              <button onClick={() => setLang('sr')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'sr' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>SR</button>
              <button onClick={() => setLang('en')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'en' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>EN</button>
            </div>

            <div className="flex items-center md:hidden gap-1">
              <button onClick={() => setLang('sr')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'sr' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>SR</button>
              <button onClick={() => setLang('en')} className={`rounded-full border px-1.5 py-0.5 text-xs ${lang === 'en' ? 'bg-black text-white border-black' : 'bg-transparent text-black/65 border-black/10 hover:text-black'}`}>EN</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="hidden lg:block">
        <ScrollyCanvas frameCount={60}>
          <Overlay copy={copy} buildWhatsappLink={buildWhatsappLink} />
        </ScrollyCanvas>
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-auto items-center justify-center overflow-hidden pt-10 sm:pt-14 lg:hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.05)_0%,transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 text-center lg:text-left max-w-xl mx-auto lg:mx-0"
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
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight">
                    Pokreni{' '}
                    <span className="relative inline-block pb-2">
                      se
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

              <div className="flex flex-wrap gap-3 pt-5 justify-center lg:justify-start">
                <a href="#modeli" className="w-full sm:w-auto group bg-primary text-primary-foreground px-6 sm:px-8 py-3 rounded-full hover:bg-primary/90 transition-all hover:scale-105 text-xs sm:text-sm uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-2">
                  {copy.heroPrimary}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href={buildWhatsappLink('Zanima me test vožnja za Pogon.')}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-border px-6 sm:px-8 py-3 rounded-full hover:bg-accent transition-all text-xs sm:text-sm uppercase tracking-wider font-semibold"
                >
                  {copy.heroSecondary}
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-10 border-t border-border/50">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight">90<span className="text-lg sm:text-2xl text-foreground/40">km</span></div>
                  <div className="text-[0.65rem] sm:text-xs uppercase tracking-wider text-foreground/50 mt-1">{copy.range}</div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-end gap-1 text-black justify-center">
                    <span className="text-[0.7rem] lowercase tracking-[0.18em] text-foreground/60">{copy.fromText}</span>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground/40">250w</span>
                  </div>
                  <div className="text-[0.65rem] sm:text-xs uppercase tracking-wider text-foreground/50 mt-1">{copy.power}</div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-end gap-1 text-black justify-center">
                    <span className="text-[0.7rem] lowercase tracking-[0.18em] text-foreground/60">{copy.fromText}</span>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground/40">25km/h</span>
                  </div>
                  <div className="text-[0.65rem] sm:text-xs uppercase tracking-wider text-foreground/50 mt-1">{copy.topSpeed}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent rounded-[3rem] blur-3xl"></div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
                <ImageWithFallback
                  src="/Excellent4.jpeg"
                  alt="POGON e-bicikl"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badges */}
              <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Star className="size-6 fill-primary stroke-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">4.9</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="modeli" className="relative overflow-hidden bg-background pt-12 pb-24 text-foreground sm:pt-16 sm:pb-28 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-accent/20"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-block px-4 py-1 bg-primary/10 rounded-full text-xs uppercase tracking-widest font-semibold mb-4">{copy.premiumSeries}</div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">{copy.heroPrimary}</h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto font-light">
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
              <span>{lang === 'sr' ? 'Prevuci' : 'Drag'}</span>
            </div>
          </div>

          <div className="relative">
            <div
              ref={productScrollRef}
              onScroll={handleProductScroll}
              className="grid grid-flow-col auto-cols-[minmax(calc(100vw-5rem),calc(78vw))] gap-4 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid-cols-3 lg:grid-flow-row lg:auto-cols-auto lg:overflow-visible lg:gap-8 snap-x snap-mandatory overscroll-contain"
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
                    setIsLightboxZoomed(false);
                    return;
                  }

                  setActiveSpecs(activeSpecs === model.key ? null : model.key);
                };

                return (
                <div
                  key={model.key}
                  className={`group snap-center sm:snap-start min-w-[calc(66vw)] sm:min-w-[18rem] lg:min-w-auto overflow-hidden rounded-3xl transition-all duration-300 ${model.isFeatured ? 'bg-primary text-primary-foreground border-2 border-primary shadow-2xl hover:-translate-y-2 hover:shadow-2xl' : 'bg-card border-2 border-border hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2'}`}
              >
                <div className="relative overflow-hidden rounded-t-3xl">
                  {model.isFeatured ? <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80"></div> : null}
                  <div
                    className="aspect-[3/2] lg:aspect-[4/3] overflow-hidden relative bg-black cursor-pointer group"
                    onClick={handleImagePanelClick}
                  >
                    <ImageWithFallback
                      src={selectedImage.src}
                      alt={selectedImage.alt}
                      loading="lazy"
                      className="relative z-10 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
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
                          setIsLightboxZoomed(false);
                        }}
                        className="absolute bottom-4 right-4 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/65 sm:inline-flex"
                      >
                        <ZoomIn className="size-5" />
                      </button>
                    ) : null}
                    <div className={`absolute top-4 right-4 z-20 ${model.badgeClass}`}>
                      {copy[model.badgeKey]}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white lg:hidden">
                      <div className="text-2xl font-black leading-none">{model.name}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                        {gallery ? `${selectedGalleryIndex + 1} / ${gallery.length}` : copy.clickSpecs}
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
                    <div className="relative z-40 hidden sm:flex gap-2 overflow-x-auto border-t border-border bg-white p-2.5 shadow-inner">
                      {gallery.map((image, index) => (
                        <button
                          key={image.src}
                          type="button"
                          aria-label={`Show ${model.name} photo ${index + 1}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setGalleryImage(index);
                          }}
                          className={`aspect-square w-16 flex-none overflow-hidden rounded-2xl border bg-white p-1 shadow-sm ring-offset-2 ring-offset-white transition-all sm:w-20 ${
                            selectedGalleryIndex === index ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/60 hover:ring-2 hover:ring-primary/30'
                          }`}
                        >
                          <ImageWithFallback
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            className="h-full w-full rounded-xl object-cover object-center transition-transform duration-300 hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className={`hidden lg:block text-2xl font-bold mb-2 ${model.isFeatured ? 'text-primary-foreground' : 'text-foreground'}`}>{model.name}</h3>
                  <ul className="hidden lg:block space-y-3 mb-6 text-sm list-disc pl-5">
                    {model.points.map((point, index) => (
                      <li key={index} className={model.isFeatured ? 'text-primary-foreground/80' : 'text-foreground/60'}>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className={`pt-2 lg:pt-6 lg:border-t ${model.isFeatured ? 'lg:border-white/20' : 'lg:border-border'}`}>
                    <div className={`hidden lg:block text-5xl font-black mb-1 ${model.isFeatured ? 'text-primary-foreground' : ''}`}>{model.monthlyPrice}</div>
                    <div className={`hidden lg:block text-xs uppercase tracking-wider mb-3 ${model.isFeatured ? 'text-white/80' : 'text-foreground/50'}`}>{copy.perMonth}</div>
                    <div className={`hidden lg:block text-sm mb-4 ${model.isFeatured ? 'text-primary-foreground/80' : 'text-foreground/60'}`}>{model.price}</div>
                    <div className="mb-4 grid grid-cols-3 gap-2 lg:hidden">
                      {[
                        { value: model.mobileSpecs.range, label: copy.range },
                        { value: model.mobileSpecs.power, label: copy.power },
                        { value: model.mobileSpecs.battery, label: lang === 'sr' ? 'Baterija' : 'Battery' },
                      ].map((spec) => (
                        <div
                          key={`${model.key}-${spec.label}`}
                          className={`rounded-2xl border px-2 py-3 text-center ${
                            model.isFeatured ? 'border-white/25 bg-white/10' : 'border-border bg-background/80'
                          }`}
                        >
                          <div className={`text-base font-black leading-none ${model.isFeatured ? 'text-primary-foreground' : 'text-foreground'}`}>{spec.value}</div>
                          <div className={`mt-1 text-[0.5rem] uppercase tracking-wider ${model.isFeatured ? 'text-white/70' : 'text-foreground/45'}`}>{spec.label}</div>
                        </div>
                      ))}
                    </div>
                    <a
                      href={buildWhatsappLink(`Zanima me kupovina ${model.name} modela.`)}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full transition-all font-semibold uppercase text-[0.65rem] sm:text-sm tracking-wider ${model.isFeatured ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90 lg:bg-primary-foreground lg:text-primary' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                    >
                      {copy.buyNow}
                      <ArrowRight className="size-3 lg:hidden" />
                    </a>
                    <a
                      href={buildWhatsappLink('Zanima me test vožnja za Pogon.')}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-2 w-full inline-flex items-center justify-center rounded-full border py-3 text-[0.65rem] font-semibold uppercase tracking-wider lg:hidden ${
                        model.isFeatured ? 'border-white/35 text-primary-foreground' : 'border-border text-foreground'
                      }`}
                    >
                      {copy.heroSecondary}
                    </a>
                  </div>
                </div>
              </div>
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

      {/* Technology Section */}
      <section id="tehnologija" className="py-20 sm:py-28 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
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
      <section id="iskustva" className="py-24 sm:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block px-4 py-1 bg-primary/10 rounded-full text-xs uppercase tracking-widest font-semibold mb-4">{ui.reviewsEyebrow}</div>
            <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black mb-5 sm:mb-6 tracking-tight">{copy.customerReviews}</h2>
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

      {/* Lifestyle Gallery */}
      <section className="py-24 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative rounded-3xl overflow-hidden group aspect-[4/3]">
              <ImageWithFallback
                src="/Excellent%202.png"
                alt="Urban ride"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">{ui.lifestyleCards[0].title}</h3>
                  <p className="text-white/80">{ui.lifestyleCards[0].body}</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden group aspect-[4/3]">
              <ImageWithFallback
                src="/Excellent%203.png"
                alt="Freedom of movement"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">{ui.lifestyleCards[1].title}</h3>
                  <p className="text-white/80">{ui.lifestyleCards[1].body}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 sm:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="size-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{ui.services[0].title}</h3>
              <p className="text-foreground/60 text-sm">
                {ui.services[0].body}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="size-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{ui.services[1].title}</h3>
              <p className="text-foreground/60 text-sm">
                {ui.services[1].body}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="size-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{ui.services[2].title}</h3>
              <p className="text-foreground/60 text-sm">
                {ui.services[2].body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-28 relative overflow-hidden">
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

            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-none">{copy.finalTitle}</h2>

            <p className="text-xl md:text-2xl text-foreground/60 mb-12 max-w-3xl mx-auto font-light leading-relaxed">{copy.finalBody}</p>

            <div className="flex flex-wrap gap-6 justify-center mb-12">
              <a href="#modeli" className="group bg-primary text-primary-foreground px-12 py-5 rounded-full hover:bg-primary/90 transition-all hover:scale-105 text-base uppercase tracking-wider font-bold flex items-center gap-3 shadow-lg shadow-primary/20">
                {copy.finalPrimary}
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href={buildWhatsappLink('Zdravo, zainteresovan sam za dodatne informacije o Pogonu.')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center border-2 border-border px-12 py-5 rounded-full hover:bg-accent transition-all text-base uppercase tracking-wider font-bold"
              >
                {copy.finalSecondary}
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary"></div>
                {ui.ctaBullets[0]}
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary"></div>
                {ui.ctaBullets[1]}
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary"></div>
                {ui.ctaBullets[2]}
              </div>
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
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsLightboxZoomed((current) => !current);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label={isLightboxZoomed ? 'Reset zoom' : 'Zoom image'}
              >
                <ZoomIn className="size-5" />
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
                setIsLightboxZoomed((current) => !current);
              }}
              className={`flex h-full w-full items-center justify-center overflow-auto rounded-2xl ${isLightboxZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              aria-label={isLightboxZoomed ? 'Reset zoom' : 'Zoom image'}
            >
              <ImageWithFallback
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                className={`h-full w-full object-cover object-center transition-transform duration-300 ${isLightboxZoomed ? 'scale-150' : 'scale-100'}`}
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
                  <img src="/Logo.png" alt="POGON" className="h-12 w-auto sm:h-20" />
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
                <li><a href="#" className="hover:text-foreground transition-colors">POGON Urban</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">POGON Pro</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">POGON Sport</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{ui.footerCompare}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">{ui.footerSupport}</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-foreground/60">
                {ui.footerSupportLinks.map((item, index) => (
                  <li key={item}>
                    <a href={buildWhatsappLink(footerSupportMessages[index])} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                      {item}
                    </a>
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
    </div>
  );
}
