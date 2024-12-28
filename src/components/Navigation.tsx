import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Add scroll event listener
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (path: string) => {
    if (location.pathname === path) {
      scrollToTop();
    } else {
      navigate(path);
    }
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
  };

  return (
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

          {/* Centered Navigation and Actions */}
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
            <Button variant="ghost" size="icon">
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 