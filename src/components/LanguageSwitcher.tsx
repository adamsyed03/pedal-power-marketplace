import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
] as const;

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30 p-1 hover:bg-white/30 transition-all duration-300">
        <div className="flex space-x-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as any)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                language === lang.code
                  ? 'bg-white/90 text-gray-900 shadow-md backdrop-blur-sm'
                  : 'text-white/80 hover:bg-white/20 hover:text-white hover:backdrop-blur-sm'
              }`}
              title={lang.name}
            >
              <span className="mr-1">{lang.flag}</span>
              <span className="hidden sm:inline">{lang.name}</span>
              <span className="sm:hidden">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
