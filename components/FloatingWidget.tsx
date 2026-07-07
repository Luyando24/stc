"use client";

import { MessageSquare, PhoneCall, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingWidget() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="fixed right-4 bottom-10 sm:right-6 sm:bottom-16 z-50 flex flex-col items-center gap-2">
      {/* Container widget */}
      <div className="bg-blue-500 border border-slate-200 shadow-xl rounded-full py-4 px-3 flex flex-col items-center gap-5">
        {/* Support */}
        <a
          href="https://wa.me/message/XATUQK2ALIUEI1"
          className="flex flex-col items-center text-center text-slate-500 hover:text-red-650 group transition-all"
          title="Online Customer Service"
          target="_blank"
        >
          <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
            <MessageSquare className="w-4 h-4 text-blue-500 group-hover:text-red-650" />
          </div>
          <span className="text-[9px] text-white font-semibold mt-1 max-w-[50px] leading-tight hidden sm:block">Talk to us</span>
        </a>
        {/* Top Button */}
        {showTop && (
          <button
            onClick={scrollToTop}
            className="flex flex-col items-center text-center text-slate-500 hover:text-red-650 group transition-all pt-2 border-t border-slate-100 w-full"
            title="Scroll to Top"
          >
            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
              <ArrowUp className="w-4 h-4 text-blue-500 group-hover:text-red-650" />
            </div>
            <span className="text-[9px] text-white font-semibold mt-1 hidden sm:block">Top</span>
          </button>
        )}
      </div>
    </div>
  );
}
