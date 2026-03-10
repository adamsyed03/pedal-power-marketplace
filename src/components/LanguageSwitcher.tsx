import React from "react";
import { useLanguage } from "../context/LanguageContext";

const languages = [
  { code: "en", name: "English" },
  { code: "sr", name: "Srpski" },
] as const;

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <div className="rounded-full border border-[#cfd8cf] bg-white/90 p-1 shadow-lg backdrop-blur">
        <div className="flex items-center gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as "en" | "sr")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                language === lang.code ? "bg-[#111613] text-white" : "text-[#2d3a33] hover:bg-[#eef3ee]"
              }`}
              title={lang.name}
            >
              {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
