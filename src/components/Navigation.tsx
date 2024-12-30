import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
        modelsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-gray-100 text-gray-900 shadow-lg" 
            : "bg-gray-200/95 text-gray-900"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div 
              onClick={() => handleNavClick('/')} 
              className="flex-shrink-0 font-bold text-2xl tracking-wider cursor-pointer"
            >
              POGON
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={scrollToModels} className="hover:opacity-75 transition-opacity">Models</button>
              <button 
                onClick={() => handleNavClick('/about-us')} 
                className="hover:opacity-75 transition-opacity"
              >
                About Us
              </button>
              <button 
                onClick={() => handleNavClick('/dealers')}
                className="hover:opacity-75 transition-opacity"
              >
                Find Dealer
              </button>
              <button 
                onClick={() => handleNavClick('/contact')}
                className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors px-4 py-2 rounded-md"
              >
                Contact Us
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] md:hidden">
          <div 
            className={`fixed right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-end p-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
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
              <div className="flex flex-col p-6 space-y-4">
                <button
                  onClick={scrollToModels}
                  className="text-left px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Models
                </button>
                <button
                  onClick={() => handleNavClick('/about-us')}
                  className="text-left px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  About Us
                </button>
                <button
                  onClick={() => handleNavClick('/dealers')}
                  className="text-left px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Find Dealer
                </button>
                <button
                  onClick={() => handleNavClick('/contact')}
                  className="text-left px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 