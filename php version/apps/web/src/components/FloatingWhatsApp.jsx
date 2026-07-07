import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth entry after page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href="https://wa.me/8613434313227"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-fade-in-up group"
      aria-label="Chat with us on WhatsApp"
    >
      {/* Subtle pulse ring behind the icon */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-40 transition-opacity duration-300"></span>
      <MessageCircle className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
    </a>
  );
};

export default FloatingWhatsApp;