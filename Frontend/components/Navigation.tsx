"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "#products" },
    { name: "Features", href: "#features" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-16 md:h-20 w-16 md:w-20 rounded-full overflow-hidden bg-transparent">
              <img
                src="/images/logo.png"
                alt="BoldTap Logo"
                className="h-full w-full object-cover"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors font-medium ${
                  isScrolled
                    ? "text-gray-700 hover:text-black"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`transition-colors font-medium ${
                    isScrolled
                      ? "text-gray-700 hover:text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className={`flex items-center space-x-2 transition-colors font-medium ${
                    isScrolled
                      ? "text-gray-700 hover:text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`transition-colors font-medium ${
                    isScrolled
                      ? "text-gray-700 hover:text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                    isScrolled
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  Get Card
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden transition-colors ${
              isScrolled ? "text-black" : "text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 space-y-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block transition-colors font-medium ${
                  isScrolled
                    ? "text-gray-700 hover:text-black"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block transition-colors font-medium ${
                    isScrolled
                      ? "text-gray-700 hover:text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center space-x-2 transition-colors font-medium ${
                    isScrolled
                      ? "text-gray-700 hover:text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`block transition-colors font-medium ${
                    isScrolled
                      ? "text-gray-700 hover:text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`block px-6 py-2.5 rounded-lg font-semibold transition-colors text-center ${
                    isScrolled
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Card
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
