
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Globe, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & About */}
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight flex items-center mb-6">
              <span className="text-secondary mr-1">STC</span> Logistics
            </div>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-6">
              Your trusted partner for global logistics, specializing in secure, fast, and reliable cargo transport from China to Africa and the Americas.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors" aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-blue-100/90 text-sm">+86 134 3431 3227</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-blue-100/90 text-sm">sales@stc-logistics.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-blue-100/90 text-sm">STC Logistics</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-blue-100/90 text-sm leading-relaxed">
                  Warehouse:<br />
                  610, Simbo Sports City,<br />
                  No. 202, Huanshi West Road,<br />
                  Yuexiu District, Guangzhou
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-blue-100/80 hover:text-secondary text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-blue-100/80 hover:text-secondary text-sm transition-colors">Contact Support</Link></li>
              <li><Link to="/track" className="text-blue-100/80 hover:text-secondary text-sm transition-colors">Track Shipment</Link></li>
              <li><Link to="/blog" className="text-blue-100/80 hover:text-secondary text-sm transition-colors">Latest Updates</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Our Services</h3>
            <ul className="space-y-3">
              <li><Link to="/air-cargo" className="text-blue-100/80 hover:text-secondary text-sm transition-colors">Air Cargo Services</Link></li>
              <li><Link to="/sea-cargo-liberia" className="text-blue-100/80 hover:text-secondary text-sm transition-colors">Sea Cargo Logistics</Link></li>
              <li><Link to="/china-africa" className="text-blue-100/80 hover:text-secondary text-sm transition-colors">China to Africa Routes</Link></li>
              <li><Link to="/contact" className="text-blue-100/80 hover:text-secondary text-sm transition-colors">Warehousing</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-100/60 text-sm">
            &copy; {currentYear} STC Logistics. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-blue-100/60 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-blue-100/60 hover:text-white text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
