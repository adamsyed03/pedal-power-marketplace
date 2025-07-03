import React, { useState, useEffect } from "react";
import { useLanguage } from '../context/LanguageContext';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-neutral-200 text-neutral-900 shadow-lg" 
            : "bg-neutral-200/95 text-neutral-900"
        }`}
        style={{ zIndex: 1000 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="text-2xl font-bold">
              POGON
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="/models" className="hover:text-neutral-600 transition-colors">
                {t('nav.models')}
              </a>
              <a href="/bout-us" className="hover:text-neutral-600 transition-colors">
                {t('nav.about')}
              </a>
              <a href="/join" className="hover:text-neutral-600 transition-colors">
                {t('nav.join')}
              </a>
              <a href="/contact" className="hover:text-neutral-600 transition-colors">
                {t('nav.contact')}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-neutral-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-neutral-200 py-4">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              <a
                href="/models"
                className="hover:text-neutral-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.models')}
              </a>
              <a
                href="/bout-us"
                className="hover:text-neutral-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.about')}
              </a>
              <a
                href="/join"
                className="hover:text-neutral-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.join')}
              </a>
              <a
                href="/contact"
                className="hover:text-neutral-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.contact')}
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
} 