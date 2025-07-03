import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex space-x-2">
      <button
        onClick={() => setLanguage('sr')}
        className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
          language === 'sr' ? 'border-white' : 'border-transparent'
        }`}
        aria-label="Serbian"
      >
        <img 
          src="/images/serbian-flag.svg" 
          alt="Serbian" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image doesn't load
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjY2LjciIGZpbGw9IiNjNjI4MmIiLz48cmVjdCB5PSI2Ni43IiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjY2LjciIGZpbGw9IiMwMDMyYTAiLz48cmVjdCB5PSIxMzMuMyIgd2lkdGg9IjMwMCIgaGVpZ2h0PSI2Ni43IiBmaWxsPSIjZmZmIi8+PC9zdmc+';
          }}
        />
      </button>
      
      <button
        onClick={() => setLanguage('en')}
        className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
          language === 'en' ? 'border-white' : 'border-transparent'
        }`}
        aria-label="English"
      >
        <img 
          src="/images/english-flag.svg" 
          alt="English" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image doesn't load
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMjQ3ZCIvPjxwYXRoIGQ9Ik0wLDAgTDMwMCwyMDAgTTMwMCwwIEwwLDIwMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQwIi8+PHBhdGggZD0iTTAsMCBMMzAwLDIwMCBNMzAwLDAgTDAsMjAwIiBzdHJva2U9IiNjZjE0MmIiIHN0cm9rZS13aWR0aD0iMjAiLz48cmVjdCB4PSIxMDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeT0iNzUiIHdpZHRoPSIzMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIxMDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjY2YxNDJiIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMTMuNCIvPjxyZWN0IHk9Ijc1IiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjY2YxNDJiIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMTMuNCIvPjwvc3ZnPg==';
          }}
        />
      </button>
    </div>
  );
} 