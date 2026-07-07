import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/95 backdrop-blur-sm shadow-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" onClick={closeMenus} className="flex items-center gap-3">
            <div className="text-2xl font-extrabold text-primary tracking-tight flex items-center">
              <span className="text-secondary mr-1">STC</span> Logistics
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-secondary' : 'text-primary hover:text-secondary'}`}>
              Home
            </Link>
            
            <div 
              className="relative group"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className={`flex items-center gap-1 text-sm font-semibold transition-colors ${['/air-cargo', '/sea-cargo-liberia', '/china-africa', '/procurement'].includes(location.pathname) ? 'text-secondary' : 'text-primary hover:text-secondary'}`}>
                Services <ChevronDown className="w-4 h-4" />
              </button>
              
              {servicesOpen && (
                <div className="absolute top-full left-0 w-56 pt-4">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                    <Link to="/air-cargo" onClick={closeMenus} className="px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50 hover:text-secondary border-b border-gray-50 transition-colors">Air Cargo</Link>
                    <Link to="/sea-cargo-liberia" onClick={closeMenus} className="px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50 hover:text-secondary border-b border-gray-50 transition-colors">Sea Cargo</Link>
                    <Link to="/china-africa" onClick={closeMenus} className="px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50 hover:text-secondary border-b border-gray-50 transition-colors">Door-to-Door Delivery</Link>
                    <Link to="/procurement" onClick={closeMenus} className="px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50 hover:text-secondary border-b border-gray-50 transition-colors">Procurement Services</Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/track" className={`text-sm font-semibold transition-colors ${isActive('/track') ? 'text-secondary' : 'text-primary hover:text-secondary'}`}>Track Shipment</Link>
            <Link to="/blog" className={`text-sm font-semibold transition-colors ${isActive('/blog') ? 'text-secondary' : 'text-primary hover:text-secondary'}`}>Blog</Link>
            <Link to="/about" className={`text-sm font-semibold transition-colors ${isActive('/about') ? 'text-secondary' : 'text-primary hover:text-secondary'}`}>About</Link>
            <Link to="/contact" className={`text-sm font-semibold transition-colors ${isActive('/contact') ? 'text-secondary' : 'text-primary hover:text-secondary'}`}>Contact</Link>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Button asChild variant="secondary">
              <Link to="/track">Track Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-6 flex flex-col gap-4">
            <Link to="/" onClick={closeMenus} className="text-base font-semibold text-primary">Home</Link>
            
            <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-100">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Services</span>
              <Link to="/air-cargo" onClick={closeMenus} className="text-base font-medium text-primary">Air Cargo</Link>
              <Link to="/sea-cargo-liberia" onClick={closeMenus} className="text-base font-medium text-primary">Sea Cargo</Link>
              <Link to="/china-africa" onClick={closeMenus} className="text-base font-medium text-primary">Door-to-Door Delivery</Link>
              <Link to="/procurement" onClick={closeMenus} className="text-base font-medium text-primary">Procurement Services</Link>
            </div>

            <Link to="/track" onClick={closeMenus} className="text-base font-semibold text-primary">Track Shipment</Link>
            <Link to="/blog" onClick={closeMenus} className="text-base font-semibold text-primary">Blog</Link>
            <Link to="/about" onClick={closeMenus} className="text-base font-semibold text-primary">About</Link>
            <Link to="/contact" onClick={closeMenus} className="text-base font-semibold text-primary">Contact</Link>
            
            <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/track" onClick={closeMenus}>Track Shipment</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;