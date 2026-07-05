"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Globe } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services/air-freight", label: "Services & Solutions" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#contact", label: "Contact" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f4f5f6]/95 backdrop-blur-md border-b border-slate-200 h-14 flex items-center">
      <div className="page-container w-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center">
              <span className="text-[11px] font-black text-white tracking-widest pl-[1px]">STC</span>
            </div>
            <span className="font-display font-black text-slate-900 text-sm uppercase tracking-wider">Logistics</span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm text-slate-700 hover:text-slate-950 hover:font-semibold transition-all py-1.5"
                >
                  {link.label}
                  {active && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-red-650 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <button className="flex items-center gap-1 hover:text-slate-900">
              <Globe className="w-4 h-4" />
              <span>Africa / English</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300">|</span>
            <Link href="/login" className="hover:text-slate-900 font-medium">
              Log in / Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-950"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-14 left-0 right-0 bg-[#f4f5f6] border-b border-slate-200 py-4 px-4 shadow-lg md:hidden">
          <div className="space-y-1 mb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm text-slate-700 hover:text-slate-950 hover:bg-slate-200/50 rounded-lg transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
            <button className="flex items-center gap-2 text-sm text-slate-600 px-3">
              <Globe className="w-4 h-4" />
              <span>Africa / English</span>
            </button>
            <Link href="/login" className="btn-primary w-full justify-center text-sm py-2">
              Log in / Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
