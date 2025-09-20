import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from '../context/LanguageContext';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToModels = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToModels: true } });
    } else {
      const modelsSection = document.getElementById('models');
      if (modelsSection) {
        const headerOffset = 80; // Account for fixed header
        const elementPosition = modelsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-neutral-200 text-neutral-900 shadow-lg" 
            : "bg-neutral-200/95 text-neutral-900"
        }`}
      >
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between h-16 sm:h-20">
                {/* Logo */}
                <div 
                  onClick={() => handleNavClick('/')} 
                  className="flex-shrink-0 font-bold text-xl sm:text-2xl tracking-wider cursor-pointer text-neutral-900"
                >
                  POGON
                </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={scrollToModels} className="text-neutral-700 hover:text-neutral-900 transition-colors">{t('nav.models')}</button>
              <button 
                onClick={() => handleNavClick('/about-us')} 
                className="text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                {t('nav.about')}
              </button>
              <button 
                onClick={() => handleNavClick('/contact')} 
                className="text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                {t('nav.contact')}
              </button>
            </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-neutral-800 p-2"
                    aria-label="Toggle menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                      />
                    </svg>
                  </Button>
                </div>
          </div>
        </div>
      </nav>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-neutral-900/50 z-[100] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div 
                className={`fixed right-0 top-0 h-full w-72 sm:w-80 bg-neutral-200 shadow-xl transform transition-transform duration-300 ease-in-out ${
                  isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-end p-4 border-b border-neutral-300">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-neutral-800 p-2"
                      aria-label="Close menu"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>
                  <div className="flex flex-col p-6 space-y-2">
                    <button
                      onClick={scrollToModels}
                      className="text-left px-4 py-4 text-neutral-700 hover:bg-neutral-300 rounded-lg transition-colors text-lg font-medium"
                    >
                      {t('nav.models')}
                    </button>
                    <button
                      onClick={() => handleNavClick('/about-us')}
                      className="text-left px-4 py-4 text-neutral-700 hover:bg-neutral-300 rounded-lg transition-colors text-lg font-medium"
                    >
                      {t('nav.about')}
                    </button>
                    <button
                      onClick={() => handleNavClick('/contact')}
                      className="text-left px-4 py-4 text-neutral-700 hover:bg-neutral-300 rounded-lg transition-colors text-lg font-medium"
                    >
                      {t('nav.contact')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </>
  );
}; 