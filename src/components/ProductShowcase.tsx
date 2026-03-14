import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type ModelKey = "glide-1" | "compact-1" | "core" | "cargo";

type ProductModel = {
  key: ModelKey;
  name: { en: string; sr: string };
  tag: { en: string; sr: string };
  description: { en: string; sr: string };
  price: string;
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
    tag: { en: "Model", sr: "Model" },
    description: {
      en: "A city electric bike designed for comfortable, reliable everyday movement.",
      sr: "Gradski električni bicikl za udobnu i pouzdanu svakodnevnu vožnju.",
    },
    price: "170,000 RSD",
    image: { src: "/Excellent 1.png", alt: "Glide bike" },
    points: [
      { en: "Rear hub motor", sr: "Motor u zadnjem točku" },
      { en: "Hydraulic brakes", sr: "Hidraulične kočnice" },
      { en: "Lithium battery", sr: "Litijumska baterija" },
      { en: "110kg capacity", sr: "Nosivost 110 kg" },
    ],
    whatsappMessage: {
      en: "Hello, I'm interested in the Pogon Glide.",
      sr: "Zdravo, zainteresovan sam za Pogon Glide.",
    },
  },
  {
    key: "compact-1",
    name: { en: "Compact", sr: "Compact" },
    tag: { en: "Model", sr: "Model" },
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
  {
    key: "core",
    name: { en: "Core", sr: "Core" },
    tag: { en: "Model", sr: "Model" },
    description: {
      en: "Fat-tire urban model built for comfort and control.",
      sr: "Fat-tire gradski model za više udobnosti i kontrole.",
    },
    price: "170,000 RSD",
    image: { src: "/Core Codifice.png", alt: "Core bike" },
    points: [
      { en: "Max speed: 25 km/h", sr: "Maks. brzina 25 km/h" },
      { en: "Range: 85 km", sr: "Domet: 85 km" },
      { en: "Motor power: 250W", sr: "Snaga 250 W" },
      { en: "Max load: 120 kg", sr: "Nosivost 120 kg" },
    ],
    whatsappMessage: {
      en: "Hello, I'm interested in the Pogon Core.",
      sr: "Zdravo, zainteresovan sam za Pogon Core.",
    },
  },
  {
    key: "cargo",
    name: { en: "Cargo", sr: "Cargo" },
    tag: { en: "Model", sr: "Model" },
    description: {
      en: "Compact fat-tire work bike for urban hauling and delivery.",
      sr: "Kompaktan fat-tire model za gradski transport i dostavu.",
    },
    price: "170,000 RSD",
    image: { src: "/CargoCodifice.png", alt: "Cargo bike" },
    points: [
      { en: "Max speed: 25 km/h", sr: "Maks. brzina 25 km/h" },
      { en: "Range: 80 km", sr: "Domet: 80 km" },
      { en: "Motor power: 250W", sr: "Snaga 250 W" },
      { en: "Max load: 120 kg", sr: "Nosivost 120 kg" },
    ],
    whatsappMessage: {
      en: "Hello, I'm interested in the Pogon Cargo.",
      sr: "Zdravo, zainteresovan sam za Pogon Cargo.",
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
    () => (initialModel === "compact-1" || initialModel === "glide-1" ? initialModel : "glide-1"),
    [initialModel],
  );

  const initialIndex = useMemo(() => {
    const index = productModels.findIndex((model) => model.key === focusModel);
    return index >= 0 ? index : 0;
  }, [focusModel]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
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
    buy: lang === "sr" ? "Javi nam se" : "Talk to us",
    price: lang === "sr" ? "Cena" : "Price",
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
    <section id="bikes" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-4">
        <h2 className="text-3xl font-black leading-none tracking-[-0.045em] text-[#111613] sm:text-4xl">{copy.title}</h2>
        <p className="mt-2 max-w-3xl text-sm font-medium tracking-[-0.02em] text-[#415047] sm:text-base">{copy.subtitle}</p>
      </div>

      <div className="mx-auto max-w-[48rem]">
        <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button
            type="button"
            onClick={previousSlide}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#cad3cc] bg-white/95 px-3 py-2 text-sm font-medium text-[#25332b] shadow-sm transition hover:bg-[#f2f5f2] sm:-left-5"
            aria-label={copy.prev}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#cad3cc] bg-white/95 px-3 py-2 text-sm font-medium text-[#25332b] shadow-sm transition hover:bg-[#f2f5f2] sm:-right-5"
            aria-label={copy.next}
          >
            <ChevronRight size={16} />
          </button>

          <div className="relative overflow-hidden rounded-3xl">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(calc(${18 - activeIndex * 64}%))` }}>
            {productModels.map((model) => {
              const isActive = model.key === productModels[activeIndex].key;
              const modelMessage = model.whatsappMessage[lang];
              const isCoreOrCargo = model.key === "core" || model.key === "cargo";
              const isCompactSoldOut = model.key === "compact-1";

              return (
                <div key={model.key} className="w-[64%] shrink-0 px-2">
                  <article className={`mx-auto flex h-[500px] w-full flex-col rounded-3xl border border-[#e1e5e1] bg-white p-3 shadow-[0_10px_20px_rgba(17,22,18,0.06)] transition duration-500 ${isActive ? "opacity-100" : "opacity-55"}`}>
                    <div className="rounded-2xl bg-white p-2.5">
                      <div className="mb-2 flex items-center justify-end">
                        <span className="rounded-md border border-[#ccd2cc] bg-white px-2.5 py-1 text-[11px] font-bold tracking-[-0.02em] text-[#111613]">{model.tag[lang]}</span>
                        {model.soldOut ? (
                          <span className="ml-2 rounded-md border border-[#e0b8b8] bg-[#fff1f1] px-2 py-1 text-[11px] font-bold tracking-[-0.02em] text-[#8f3f3f]">
                            {copy.soldOut}
                          </span>
                        ) : null}
                      </div>

                      {model.image ? (
                        <img
                          src={model.image.src}
                          alt={model.image.alt}
                          className="h-[150px] w-full object-contain sm:h-[168px]"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (model.key === "core") target.src = "/Excellent 3.png";
                            if (model.key === "cargo") target.src = "/PogonXstanding.png";
                          }}
                        />
                      ) : (
                        <div className="flex h-[150px] w-full items-center justify-center rounded-xl border border-dashed border-[#c8cec8] bg-[#ecefec] text-sm font-semibold text-[#66736b] sm:h-[168px]">
                          {copy.comingSoon}
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex grow flex-col">
                      <h3 className="text-[2rem] font-black leading-none tracking-[-0.05em] text-[#111613]">{model.name[lang]}</h3>

                      <div className="relative">
                        <div className={isCoreOrCargo || isCompactSoldOut ? "pointer-events-none select-none blur-[3px] opacity-55" : ""}>
                          <p className="mt-2 text-[13px] font-medium leading-[1.35] tracking-[-0.02em] text-[#424f47]">{model.description[lang]}</p>

                          {model.points.length > 0 ? (
                            <ul className="mt-3 space-y-1 text-[13px] font-medium tracking-[-0.02em] text-[#121a16]">
                              {model.points.map((point) => (
                                <li key={point.en} className="flex items-start gap-2">
                                  <Check size={13} className="mt-0.5 shrink-0 text-[#111613]" />
                                  <span>{point[lang]}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          <p className="mt-3 mb-6 text-[13px] font-medium tracking-[-0.02em] text-[#111613]">
                            <span className="mr-2 font-medium text-[#5a665f]">{copy.price}:</span>
                            <span className="font-black tracking-[-0.03em]">{model.price}</span>
                          </p>
                        </div>

                        {isCoreOrCargo || isCompactSoldOut ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded-full border border-[#cfd5cf] bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.03em] text-[#3d4a42]">
                              {isCompactSoldOut ? copy.soldOut : copy.comingSoon}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <a
                        href={getWhatsAppHref(modelMessage)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex w-fit min-w-[200px] max-w-full self-center items-center justify-center gap-2 rounded-xl bg-[#020706] px-5 py-2 text-sm font-black uppercase tracking-[0.02em] text-white transition hover:bg-[#111613]"
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

        <div className="mt-4 flex items-center justify-center gap-2" aria-label="Carousel pagination">
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
    </section>
  );
}
