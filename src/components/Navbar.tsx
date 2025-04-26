import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return router.pathname === path || 
      (path === '/bout-us' && (
        router.pathname === '/about' || 
        router.pathname === '/aboutus' || 
        router.pathname === '/about-us'
      ));
  };

  return (
    <nav className="bg-black/60 backdrop-blur-md text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          POGON
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-8">
          <Link
            href="/"
            className={`hover:text-gray-300 ${
              isActive("/") ? "border-b-2 border-white" : ""
            }`}
          >
            Početna
          </Link>
          <Link
            href="/bout-us"
            className={`hover:text-gray-300 ${
              isActive("/bout-us") ? "border-b-2 border-white" : ""
            }`}
          >
            O Nama
          </Link>
          <Link
            href="/products"
            className={`hover:text-gray-300 ${
              isActive("/products") ? "border-b-2 border-white" : ""
            }`}
          >
            Proizvodi
          </Link>
          <Link
            href="/contact"
            className={`hover:text-gray-300 ${
              isActive("/contact") ? "border-b-2 border-white" : ""
            }`}
          >
            Kontakt
          </Link>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-md z-50">
            <div className="flex flex-col items-center py-4 space-y-4">
              <Link
                href="/"
                className={`hover:text-gray-300 ${
                  isActive("/") ? "border-b-2 border-white" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Početna
              </Link>
              <Link
                href="/bout-us"
                className={`hover:text-gray-300 ${
                  isActive("/bout-us") ? "border-b-2 border-white" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                O Nama
              </Link>
              <Link
                href="/products"
                className={`hover:text-gray-300 ${
                  isActive("/products") ? "border-b-2 border-white" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Proizvodi
              </Link>
              <Link
                href="/contact"
                className={`hover:text-gray-300 ${
                  isActive("/contact") ? "border-b-2 border-white" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};