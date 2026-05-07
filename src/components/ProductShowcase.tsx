import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, MessageCircle, X, ZoomIn } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type ModelKey = "glide-1" | "compact-1" | "core" | "cargo";

type ProductModel = {
  key: ModelKey;
  name: { en: string; sr: string };
  description: { en: string; sr: string };
  price: string;
  originalPrice?: string;
  salePrice?: string;
  soldOut?: boolean;
  comingSoon?: boolean;
  image?: { src: string; alt: string };
  points: { en: string; sr: string }[];
  whatsappMessage: { en: string; sr: string };
};

const WHATSAPP_BASE = "https://wa.me/381631505003";

const productModels: ProductModel[] = [
  {
    key: "glide-1",
    name: { en: "Glide", sr: "Glide" },
    description: {
      en: "A city electric bike designed for comfortable, reliable everyday movement.",
      sr: "Gradski električni bicikl za udobnu i pouzdanu svakodnevnu vožnju.",
    },
    price: "170,000 RSD",
    image: { src: "/Excellent 1.png", alt: "Glide bike" },
    points: [
      { en: "Motor in rear wheel", sr: "Motor u zadnjem točku" },
      { en: "Aluminium frame", sr: "Aluminijumski ram" },
      { en: "Hydraulic brakes", sr: "Hidraulične kočnice" },
      { en: "110kg capacity", sr: "Nosivost 110 kg" },
      { en: "Up to 70km range", sr: "Domet do 70 km" },
      { en: "GPS safety features", sr: "GPS sigurnosne funkcije" },
    ],
    whatsappMessage: {
      en: "Hello, I'm interested in the Pogon Glide.",
      sr: "Zdravo, zainteresovan sam za Pogon Glide.",
    },
  },
  {
    key: "core",
    name: { en: "Core", sr: "Core" },
    description: {
      en: "Foldable fat-tire urban model built for comfort and control.",
      sr: "Sklopivi fat-tire gradski model za više udobnosti i kontrole.",
    },
    price: "160,000 RSD",
    originalPrice: "160,000 RSD",
    salePrice: "105,000 RSD",
    image: { src: "/Core Codifice.png", alt: "Core bike" },
    points: [
      { en: "Motor in rear wheel", sr: "Motor u zadnjem točku" },
      { en: "Foldable steel frame", sr: "Sklopivi čelični ram" },
      { en: "Hydraulic brakes", sr: "Hidraulične kočnice" },
      { en: "Dual battery setup up to 90km range", sr: "Dve baterije, domet do 90 km" },
      { en: "Fat tyre", sr: "Fat tyre gume" },
      { en: "GPS safety features", sr: "GPS sigurnosne funkcije" },
    ],
    whatsappMessage: {
      en: "Hello, I'm interested in the Pogon Core.",
      sr: "Zdravo, zainteresovan sam za Pogon Core.",
    },
  },
  {
    key: "cargo",
    name: { en: "Cargo", sr: "Cargo" },
    description: {
      en: "Compact fat-tire work bike for urban hauling and delivery.",
      sr: "Kompaktan fat-tire model za gradski transport i dostavu.",
    },
    price: "140,000 RSD",
    image: { src: "/CargoCodifice.png", alt: "Cargo bike" },
    points: [
      { en: "Motor in rear wheel", sr: "Motor u zadnjem točku" },
      { en: "Steel frame", sr: "Čelični ram" },
      { en: "Hydraulic brakes", sr: "Hidraulične kočnice" },
      { en: "Dual battery setup up to 90km range", sr: "Dve baterije, domet do 90 km" },
      { en: "Fat tyre", sr: "Fat tyre gume" },
      { en: "GPS safety features", sr: "GPS sigurnosne funkcije" },
    ],
    whatsappMessage: {
      en: "Hello, I'm interested in the Pogon Cargo.",
      sr: "Zdravo, zainteresovan sam za Pogon Cargo.",
    },
  },
  {
    key: "compact-1",
    name: { en: "Compact", sr: "Compact" },
    description: {
      en: "Compact urban e-bike for practical daily city riding.",
      sr: "Kompaktan gradski e-bike za praktičnu svakodnevnu vožnju.",
    },
    price: "72,999 RSD",
    soldOut: true,
    image: { src: "/ebike111.png", alt: "Compact bike" },
    points: [
      { en: "Max speed: 25 km/h", sr: "Maks. brzina 25 km/h" },
      { en: "Range: 70 km", sr: "Domet: 70 km" },
      { en: "Motor power: 250W", sr: "Snaga 250 W" },
      { en: "Max load: 110 kg", sr: "Nosivost 110 kg" },
    ],
    whatsappMessage: {
      en: "Hello, I'm interested in the Pogon Compact.",
      sr: "Zdravo, zainteresovan sam za Pogon Compact.",
    },
  },
];

function getWhatsAppHref(message: string) {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export function ProductShowcase({ initialModel }: { initialModel?: string }) {
  const { language } = useLanguage();
  const lang = language === "sr" ? "sr" : "en";

  const focusModel = useMemo<ModelKey>(
    () =>
      initialModel === "compact-1" || initialModel === "glide-1" || initialModel === "core" || initialModel === "cargo"
        ? initialModel
        : "core",
    [initialModel],
  );

  const initialIndex = useMemo(() => {
    const index = productModels.findIndex((model) => model.key === focusModel);
    return index >= 0 ? index : 0;
  }, [focusModel]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string; name: string } | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  const copy = {
    title: lang === "sr" ? "Modeli za kupovinu" : lang === "ru" ? "Modeli dlya pokupki" : "Bike Buying Experience",
    subtitle:
      lang === "sr"
        ? "Pogledaj modele, uporedi detalje i javi nam se direktno."
        : "Premium inline product presentation with practical specs and a direct path to our team.",
    soldOut: lang === "sr" ? "Rasprodato" : "Sold Out",
    comingSoon: lang === "sr" ? "Uskoro" : "Coming Soon",
    buy: lang === "sr" ? "Javite se" : "Talk to us",
    price: lang === "sr" ? "Cena" : "Price",
    salePrice: lang === "sr" ? "Akcijska cena" : "Sale price",
    imagePreview: lang === "sr" ? "Uvećaj sliku" : "Open larger image",
    moreInfo: lang === "sr" ? "Za više informacija i slika, javite se porukom." : "Message us for more information and pictures.",
    closePreview: lang === "sr" ? "Zatvori prikaz slike" : "Close image preview",
    prev: lang === "sr" ? "Prethodni model" : "Previous model",
    next: lang === "sr" ? "Sledeći model" : "Next model",
  };

  const previousSlide = () => setActiveIndex((prev) => (prev === 0 ? productModels.length - 1 : prev - 1));
  const nextSlide = () => setActiveIndex((prev) => (prev === productModels.length - 1 ? 0 : prev + 1));

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(deltaX) < 45) return;
    if (deltaX > 0) nextSlide();
    if (deltaX < 0) previousSlide();
  };

  return (
    <section id="bikes" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8 lg:py-6">
      <div className="mb-6 text-center">
        <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-bold leading-tight text-[#111613]">{copy.title}</h2>
        <p className="mx-auto mt-2 max-w-3xl text-sm font-medium text-[#415047] sm:text-base">{copy.subtitle}</p>
      </div>

      <div className="mx-auto max-w-[48rem] lg:max-h-[calc(100vh-140px)] lg:max-w-none">
        <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button
            type="button"
            onClick={previousSlide}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#cad3cc] bg-white/95 px-3 py-2 text-sm font-medium text-[#25332b] shadow-sm transition hover:bg-[#f2f5f2] sm:-left-5 lg:hidden"
            aria-label={copy.prev}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#cad3cc] bg-white/95 px-3 py-2 text-sm font-medium text-[#25332b] shadow-sm transition hover:bg-[#f2f5f2] sm:-right-5 lg:hidden"
            aria-label={copy.next}
          >
            <ChevronRight size={16} />
          </button>

          <div className="relative overflow-hidden rounded-3xl lg:overflow-visible">
          <div className="flex transition-transform duration-500 ease-out lg:!transform-none lg:grid lg:grid-cols-4 lg:gap-4 lg:transition-none" style={{ transform: `translateX(calc(${18 - activeIndex * 64}%))` }}>
            {productModels.map((model) => {
              const isActive = model.key === productModels[activeIndex].key;
              const modelMessage = model.whatsappMessage[lang];
              const isComingSoon = Boolean(model.comingSoon);
              const isCompactSoldOut = model.key === "compact-1";

              return (
                <div key={model.key} className="w-[64%] shrink-0 px-2 lg:w-auto lg:px-0">
                  <article className={`mx-auto flex h-[540px] max-h-[540px] w-full flex-col overflow-hidden rounded-2xl border border-[#e1e5e1] bg-white p-4 shadow-[0_10px_20px_rgba(17,22,18,0.06)] transition duration-500 lg:h-[min(540px,calc(100vh-140px))] ${isActive ? "opacity-100" : "opacity-55 lg:opacity-100"}`}>
                    <div className="relative mb-3 flex h-[160px] w-full shrink-0 items-center justify-center overflow-hidden">
                      {model.image ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ src: model.image!.src, alt: model.image!.alt, name: model.name[lang] })}
                          className="group relative flex h-full w-full items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5f7f67]"
                          aria-label={`${copy.imagePreview}: ${model.name[lang]}`}
                        >
                          <img
                            src={model.image.src}
                            alt={model.image.alt}
                            className="mx-auto block max-h-[150px] w-auto max-w-[80%] object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (model.key === "core") target.src = "/Excellent 3.png";
                              if (model.key === "cargo") target.src = "/PogonXstanding.png";
                            }}
                          />
                          <span className="absolute bottom-1.5 right-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7ded6] bg-white/90 text-[#111613] opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                            <ZoomIn size={15} />
                          </span>
                        </button>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#66736b]">
                          {copy.comingSoon}
                        </div>
                      )}
                      {model.soldOut ? (
                        <span className="absolute right-3 top-3 rounded-md border border-[#e0b8b8] bg-[#fff1f1] px-2 py-1 text-[11px] font-bold text-[#8f3f3f]">
                          {copy.soldOut}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex min-h-0 grow flex-col">
                      <h3 className="text-[1.4rem] font-bold leading-tight text-[#111613]">{model.name[lang]}</h3>

                      <div className="relative">
                        <div className={isComingSoon || isCompactSoldOut ? "pointer-events-none select-none blur-[3px] opacity-55" : ""}>
                          <p className="mt-2 text-[13px] font-medium leading-tight text-[#666]">{model.description[lang]}</p>

                          {model.points.length > 0 ? (
                            <ul className="mt-2 space-y-0.5 text-[12px] font-medium leading-[1.5] text-[#121a16]">
                              {model.points.map((point) => (
                                <li key={point.en} className="flex items-start gap-2">
                                  <Check size={12} className="mt-0.5 shrink-0 text-[#111613]" />
                                  <span>{point[lang]}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          {model.salePrice ? (
                            <p className="mt-3 mb-2 text-center leading-tight text-[#111613]">
                              <span className="block text-[12px] font-medium text-[#888]">
                                {copy.price}: <span className="line-through">{model.originalPrice ?? model.price}</span>
                              </span>
                              <span className="mb-0 block text-[12px] font-medium text-[#888]">{copy.salePrice}:</span>
                              <span className="block text-[22px] font-bold">{model.salePrice}</span>
                            </p>
                          ) : (
                            <p className="mt-3 mb-2 text-center leading-tight text-[#111613]">
                              <span className="mb-0 block text-[12px] font-medium text-[#888]">{copy.price}:</span>
                              <span className="block text-[22px] font-bold">{model.price}</span>
                            </p>
                          )}
                        </div>

                        {isComingSoon || isCompactSoldOut ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded-full border border-[#cfd5cf] bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.03em] text-[#3d4a42]">
                              {isCompactSoldOut ? copy.soldOut : copy.comingSoon}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <p className="mt-auto text-center text-[11px] font-medium leading-tight text-[#607067]">{copy.moreInfo}</p>

                      <a
                        href={getWhatsAppHref(modelMessage)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex h-10 w-fit min-w-[200px] max-w-full shrink-0 self-center items-center justify-center gap-2 rounded-xl bg-[#5f7f67] px-5 text-[13px] font-semibold text-white transition hover:bg-[#4f6a56]"
                      >
                        <MessageCircle size={16} />
                        {copy.buy}
                      </a>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 lg:hidden" aria-label="Carousel pagination">
          {productModels.map((model, index) => (
            <button
              key={model.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${index === activeIndex ? "bg-[#111613]" : "bg-[#c5cec7] hover:bg-[#9ca9a1]"}`}
              aria-label={`${model.name[lang]} slide`}
            />
          ))}
        </div>
      </div>

      {previewImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d120f]/88 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={previewImage.name}>
          <button type="button" className="absolute inset-0 cursor-default" aria-label={copy.closePreview} onClick={() => setPreviewImage(null)} />
          <div className="relative z-10 flex max-h-full w-full max-w-5xl flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="mb-3 self-end rounded-full border border-white/25 bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label={copy.closePreview}
            >
              <X size={20} />
            </button>
            <div className="w-full rounded-3xl bg-white p-4 shadow-2xl">
              <img src={previewImage.src} alt={previewImage.alt} className="max-h-[78vh] w-full object-contain" />
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-white">{previewImage.name}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
