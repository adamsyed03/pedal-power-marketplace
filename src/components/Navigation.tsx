import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const navLabels = {
  en: {
    bikes: "Bikes",
    lifestyle: "Lifestyle",
    delivery: "Delivery",
    about: "About",
    contact: "Contact",
    cta: "Talk to Us",
  },
  sr: {
    bikes: "Bicikli",
    lifestyle: "Lifestyle",
    delivery: "Dostava",
    about: "O nama",
    contact: "Kontakt",
    cta: "Kontakt",
  },
} as const;

const trustPoints = {
  en: [
    "2-year warranty",
    "Delivery across Serbia",
    "Service and support network",
    "Flexible payment inquiry",
  ],
  sr: [
    "2 godine garancije",
    "Isporuka sirom Srbije",
    "Servis i podrska",
    "Fleksibilan upit za placanje",
  ],
} as const;

const languages = [
  { code: "en", label: "EN" },
  { code: "sr", label: "SR" },
] as const;

type HomeAnchor = "bikes" | "lifestyle" | "delivery";

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash || location.pathname !== "/") {
      return;
    }

    const target = document.getElementById(hash);
    if (target) {
      const navOffset = 112;
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [location]);

  const labels = useMemo(() => (language === "sr" ? navLabels.sr : navLabels.en), [language]);
  const strip = useMemo(() => (language === "sr" ? trustPoints.sr : trustPoints.en), [language]);

  const goHomeAnchor = (id: HomeAnchor) => {
    if (location.pathname === "/") {
      const target = document.getElementById(id);
      if (target) {
        const navOffset = 112;
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      navigate(`/#${id}`);
    }
    setIsMobileMenuOpen(false);
  };

  const baseNavClass =
    location.pathname === "/" && !isScrolled
      ? "bg-[#0f1412]/35 text-[#f7f8f4] border-white/15"
      : "bg-[#f4f5f1]/90 text-[#111613] border-[#d4d9d3] shadow-[0_8px_26px_rgba(16,22,18,0.08)]";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="h-8 border-b border-white/10 bg-[#111613] text-[11px] font-medium text-[#e7ece5] backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-2 overflow-x-auto px-4 lg:px-8">
          {strip.map((item, index) => (
            <div key={item} className="flex shrink-0 items-center gap-2">
              {index > 0 ? <span className="text-[#6a746f]">*</span> : null}
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <nav className={`border-b transition-all duration-300 ${baseNavClass}`} aria-label="Primary">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/Logo.png" alt="Pogon" className="h-10 w-auto" loading="eager" />
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <button onClick={() => goHomeAnchor("bikes")} className="text-sm tracking-wide hover:opacity-70">
              {labels.bikes}
            </button>
            <button onClick={() => goHomeAnchor("lifestyle")} className="text-sm tracking-wide hover:opacity-70">
              {labels.lifestyle}
            </button>
            <button onClick={() => goHomeAnchor("delivery")} className="text-sm tracking-wide hover:opacity-70">
              {labels.delivery}
            </button>
            <Link to="/about-us" className="text-sm tracking-wide hover:opacity-70">
              {labels.about}
            </Link>
            <Link to="/contact" className="text-sm tracking-wide hover:opacity-70">
              {labels.contact}
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full border border-current/25 px-3 py-1.5 text-xs font-semibold"
                aria-label="Select language"
              >
                {language === "sr" ? "SR" : "EN"}
                <ChevronDown size={14} />
              </button>
              {isLangOpen ? (
                <div className="absolute right-0 mt-2 w-20 overflow-hidden rounded-xl border border-[#d4d9d3] bg-white text-[#111613] shadow-lg">
                  {languages.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => {
                        setLanguage(option.code as "en" | "sr");
                        setIsLangOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-[#edf1eb]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Link
              to="/contact"
              className="rounded-full bg-[#5f7f67] px-4 py-2 text-sm font-semibold text-[#f3f5f2] transition hover:bg-[#4d6954]"
            >
              {labels.cta}
            </Link>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-md p-2 lg:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-current/15 bg-[#f4f5f1] px-4 py-4 text-[#111613] lg:hidden">
            <div className="flex flex-col gap-3">
              <button onClick={() => goHomeAnchor("bikes")} className="text-left text-sm">
                {labels.bikes}
              </button>
              <button onClick={() => goHomeAnchor("lifestyle")} className="text-left text-sm">
                {labels.lifestyle}
              </button>
              <button onClick={() => goHomeAnchor("delivery")} className="text-left text-sm">
                {labels.delivery}
              </button>
              <Link to="/about-us" onClick={() => setIsMobileMenuOpen(false)} className="text-sm">
                {labels.about}
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm">
                {labels.contact}
              </Link>
              <div className="mt-2 flex items-center gap-2">
                {languages.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => setLanguage(option.code as "en" | "sr")}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      language === option.code ? "border-[#111613] bg-[#111613] text-white" : "border-[#c7cdc5]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 rounded-full bg-[#5f7f67] px-4 py-2 text-center text-sm font-semibold text-[#f3f5f2]"
              >
                {labels.cta}
              </Link>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
};
