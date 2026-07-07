"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plane,
  Ship,
  Package,
  ArrowRight,
  Globe,
  Truck,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import FloatingWidget from "@/components/FloatingWidget";

export default function HomePage() {
  const [trackingNo, setTrackingNo] = useState("");

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNo.trim()) return;
    window.location.href = `/track?q=${encodeURIComponent(trackingNo.trim().toUpperCase())}`;
  };

  return (
    <div className="min-h-screen bg-[#f4f5f6]">
      <SiteNav />

      {/* ── Hero Section ── */}
      <section 
        className="relative h-[320px] sm:h-[500px] lg:h-[620px] bg-cover bg-center border-b border-slate-200"
        style={{ backgroundImage: "url('/hero.png')" }}
      />

      {/* ── Dark Quick Action Tracking Bar ── */}
      <div className="page-container relative z-20 -mt-10">
        <div className="bg-slate-950 text-white rounded-3xl lg:rounded-full p-5 lg:py-4 lg:px-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 max-w-6xl mx-auto border border-slate-800">
          {/* Tracking form */}
          <form onSubmit={handleQuickTrack} className="w-full lg:w-[460px] flex-shrink-0 flex items-center bg-white rounded-full p-1.5 border border-slate-700">
            <Search className="w-5 h-5 text-slate-400 ml-4 mr-2 flex-shrink-0" />
            <input
              id="quick-tracking-input"
              type="text"
              placeholder="Enter your tracking number(s)..."
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none font-mono py-1 px-1"
            />
            <button type="submit" className="bg-brand-650 hover:bg-accent-600 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all flex-shrink-0">
              Track
            </button>
          </form>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm sm:text-base font-bold text-slate-200">
            <Link href="/login" className="hover:text-red-500 transition-colors">Ship Now</Link>
            <span className="text-slate-800">|</span>
            <a href="#how-it-works" className="hover:text-red-500 transition-colors">Our Warehouses</a>
            <span className="text-slate-800">|</span>
            <a href="/services/air-freight" className="hover:text-red-500 transition-colors">Rates & Transit Time</a>
          </div>
        </div>
      </div>

      {/* ── Our Core Services Section ── */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="page-container">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3.5xl font-display font-black text-brand-600 tracking-tight">
              Our Core Services
            </h2>
            <div className="w-16 h-[3px] bg-brand-650 mt-4 rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Air Cargo",
                description: "Fast, reliable air freight for urgent and high-value shipments to global destinations.",
                icon: Plane,
                href: "/services/air-freight"
              },
              {
                title: "Sea Cargo",
                description: "Cost-effective ocean freight for large volumes, handling both FCL and LCL shipments.",
                icon: Ship,
                href: "/services/sea-freight"
              },
              {
                title: "Warehousing",
                description: "Secure storage, consolidation, and inventory management in our Guangzhou facilities.",
                icon: Package,
                href: "/login"
              },
              {
                title: "Door-to-Door",
                description: "End-to-end logistics solutions delivering straight to your business or home.",
                icon: Truck,
                href: "/login"
              }
            ].map((s, idx) => (
              <div key={idx} className="bg-[#f4f5f6] border border-slate-100 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-xs mb-6">
                    <s.icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-display font-black text-brand-600 mb-3">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{s.description}</p>
                </div>
                <Link href={s.href} className="inline-flex items-center gap-1 text-sm font-bold text-brand-650 hover:text-accent-600 transition-colors mt-auto">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-24 bg-[#f4f5f6] border-y border-slate-200">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-3.5xl font-display font-black text-brand-600 tracking-tight">How It Works</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              From purchase to delivery, our streamlined process ensures your cargo is handled professionally at every step.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical center line (hidden on mobile, centered on desktop) */}
            <div className="absolute left-8 lg:left-1/2 top-4 bottom-4 w-px bg-slate-200 lg:-translate-x-1/2" />

            <div className="space-y-12">
              {[
                {
                  num: 1,
                  title: "Client Buys Goods",
                  description: "You purchase your goods from suppliers in China.",
                },
                {
                  num: 2,
                  title: "Delivery to STC",
                  description: "Supplier delivers the goods to our Guangzhou warehouse.",
                },
                {
                  num: 3,
                  title: "Receiving & Checking",
                  description: "Warehouse checks the goods and issues a Receiving Bill.",
                },
                {
                  num: 4,
                  title: "Labeling",
                  description: "Invoice Number is securely placed on the package.",
                },
                {
                  num: 5,
                  title: "Loading",
                  description: "Cargo is consolidated and loaded for air or sea shipment.",
                },
                {
                  num: 6,
                  title: "Invoicing & Tracking",
                  description: "Client receives the invoice and continuous tracking updates.",
                },
                {
                  num: 7,
                  title: "Arrival & Delivery",
                  description: "Cargo arrives at the destination and is delivered to you.",
                },
              ].map((step, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <div key={idx} className="flex flex-col lg:flex-row items-start lg:items-center relative">
                    {/* Timeline bubble */}
                    <div className="absolute left-2 lg:left-1/2 lg:-translate-x-1/2 z-10 w-12 h-12 rounded-full bg-brand-600 border-4 border-white flex items-center justify-center text-white font-bold text-base shadow-sm">
                      {step.num}
                    </div>

                    {/* Card container */}
                    <div className={`w-full lg:w-1/2 pl-16 lg:pl-0 ${isEven ? "lg:order-2 lg:pl-12" : "lg:pr-12 lg:text-right"}`}>
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <h4 className="font-display font-black text-brand-600 text-sm mb-2">{step.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {/* Empty spacer for desktop layout balance */}
                    <div className="hidden lg:block w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-brand-600 text-slate-200 py-16 border-t border-slate-800">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-1 font-display font-black text-lg tracking-tight">
                <span className="text-brand-650">STC</span>
                <span className="text-white">Logistics</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                Your trusted partner for global logistics, specializing in secure, fast, and reliable cargo transport from China to Africa and the Americas.
              </p>
              <div className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>

            {/* Contact Us */}
            <div className="space-y-4">
              <h5 className="text-white text-sm font-bold tracking-wider uppercase">Contact Us</h5>
              <ul className="space-y-3 text-xs text-slate-350">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand-650 flex-shrink-0" />
                  <span>+86 134 3431 3227</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-650 flex-shrink-0" />
                  <a href="mailto:sales@stc-logistics.com" className="hover:text-white transition-colors">sales@stc-logistics.com</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-brand-650 flex-shrink-0" />
                  <span>STC Logistics</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-650 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Warehouse:<br />
                    610, Simbo Sports City,<br />
                    No. 202, Huanshi West Road,<br />
                    Yuexiu District, Guangzhou
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h5 className="text-white text-sm font-bold tracking-wider uppercase">Quick Links</h5>
              <ul className="space-y-2.5 text-xs text-slate-350">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><Link href="/track" className="hover:text-white transition-colors">Track Shipment</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Latest Updates</a></li>
              </ul>
            </div>

            {/* Our Services */}
            <div className="space-y-4">
              <h5 className="text-white text-sm font-bold tracking-wider uppercase">Our Services</h5>
              <ul className="space-y-2.5 text-xs text-slate-350">
                <li><Link href="/services/air-freight" className="hover:text-white transition-colors">Air Cargo Services</Link></li>
                <li><Link href="/services/sea-freight" className="hover:text-white transition-colors">Sea Cargo Logistics</Link></li>
                <li><Link href="/services/sea-freight" className="hover:text-white transition-colors">China to Africa Routes</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Warehousing</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 STC Logistics. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#how-it-works" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating vertical sidebar pill widget */}
      <FloatingWidget />
    </div>
  );
}
