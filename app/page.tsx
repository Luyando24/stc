"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Plane,
  Ship,
  ArrowRight,
  Star,
  CheckCircle,
  Globe,
  Clock,
  Shield,
  FileText,
  Building,
  UserCheck,
  Heart,
  ChevronRight,
  TrendingUp,
  MapPin,
  Anchor,
  HelpCircle,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import FloatingWidget from "@/components/FloatingWidget";

const STEPS = [
  {
    step: "01",
    title: "Get Your Warehouse Code",
    description:
      "Register instantly to receive your unique STC-CN warehouse code — your delivery address in Guangzhou, China.",
  },
  {
    step: "02",
    title: "Shop & Pre-Alert",
    description:
      "Instruct your suppliers to label packages with your code. When shipped, log into your dashboard to pre-alert the tracking number.",
  },
  {
    step: "03",
    title: "We Consolidate",
    description:
      "Parcels are received, measured, and consolidated securely at our Guangzhou facility to optimize shipping rates.",
  },
  {
    step: "04",
    title: "Ship & Track",
    description:
      "Choose air or sea freight, pay your invoice, and monitor your cargo's live journey right from our homepage.",
  },
];

const TESTIMONIALS = [
  {
    name: "Amara Diallo",
    location: "Dakar, Senegal",
    text: "STC Logistics transformed my import business. The warehouse code system means I never worry about delivery mistakes from Chinese suppliers.",
    rating: 5,
  },
  {
    name: "Kwame Mensah",
    location: "Accra, Ghana",
    text: "Tracking is so easy. One number, full visibility. My cargo arrived on time and undamaged. Will definitely use again.",
    rating: 5,
  },
  {
    name: "Fatima Al-Hassan",
    location: "Nairobi, Kenya",
    text: "Best freight company I've worked with for China imports. Professional team, competitive rates, and real-time updates.",
    rating: 5,
  },
];

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
            <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all flex-shrink-0">
              Track
            </button>
          </form>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm sm:text-base font-bold text-slate-200">
            <Link href="/login" className="hover:text-red-500 transition-colors">Ship Now</Link>
            <span className="text-slate-800">|</span>
            <a href="#contact" className="hover:text-red-500 transition-colors">Our Warehouses</a>
            <span className="text-slate-800">|</span>
            <a href="/services/air-freight" className="hover:text-red-500 transition-colors">Rates & Transit Time</a>
          </div>
        </div>
      </div>

      {/* ── Integrated Services Section ── */}
      <section className="py-20 page-container">
        <div className="text-left mb-10 border-b border-slate-200 pb-4">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
            Integrated Logistics Supply Chain Service
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Individual Services */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <h3 className="text-xl font-display font-bold text-slate-900 relative">
                  Individual Services
                  <div className="absolute -bottom-[9px] left-0 w-12 h-[3px] bg-red-650 rounded-full" />
                </h3>
                <span className="text-xs text-red-650 font-semibold px-2 py-0.5 bg-red-50 rounded-full">B2C forwarding</span>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "Guangzhou Warehouse Code", desc: "Instantly assigned address for shopping on Taobao, 1688, etc." },
                  { name: "Pre-Alert Tracking", desc: "Easily notify our warehouse when your individual parcels ship." },
                  { name: "Secure Inspection", desc: "Photos taken on arrival, with damage control alerts." },
                  { name: "Cargo Consolidation", desc: "Repackaging multiple parcels into a single box to cut volume weight." },
                  { name: "Pan-Africa Express Deliveries", desc: "Customized air cargo delivery to your doorstep." },
                ].map((s, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-650 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8">
              <Link href="/signup" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-650 hover:text-red-700">
                Get Started Now <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Enterprise Services */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <h3 className="text-xl font-display font-bold text-slate-900 relative">
                  Enterprise Services
                  <div className="absolute -bottom-[9px] left-0 w-12 h-[3px] bg-red-650 rounded-full" />
                </h3>
                <span className="text-xs text-slate-650 font-semibold px-2 py-0.5 bg-slate-100 rounded-full">FCL / LCL cargo</span>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "Bulk Ocean Freight", desc: "Full Container Load (FCL) or Less than Container Load (LCL) options." },
                  { name: "Vessel Tracking API", desc: "Live integration with Maersk APIs for ocean container transit milestones." },
                  { name: "African Customs Brokerage", desc: "Full customs document clearing in Nigeria, Ghana, Kenya, and more." },
                  { name: "Bulk Consolidation", desc: "Combining manufacturer shipments into designated export containers." },
                  { name: "Specialized Cargo Support", desc: "Support for batteries, machinery, liquids, and oversized cargo." },
                ].map((s, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-650 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8">
              <a href="#contact" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-650 hover:text-red-700">
                Get Enterprise Quote <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">How STC Logistics Works</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
              Follow these simple steps to import cargo from Chinese factories to your destination in Africa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-[#f4f5f6] border border-slate-200 rounded-2xl p-6 h-full transition-all group-hover:bg-white group-hover:border-red-200 group-hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-display font-black text-red-100 group-hover:text-red-250 transition-colors">
                      {s.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-xs">
                      <CheckCircle className="w-4 h-4 text-red-650" />
                    </div>
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-sm mb-2">{s.title}</h4>
                  <p className="text-slate-650 text-xs leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sustainability & Values Grid ── */}
      <section className="py-20 page-container">
        <div className="grid lg:grid-cols-12 gap-8 items-start mb-12">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900">
              Sustainability
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Through every package we deliver, every item we carry, STC Logistics makes an impact. It is our responsibility to balance the economy, environment, and society with business growth. The work we do is more than just delivering goods – we elevate delivery&apos;s value to drive meaningful change.
            </p>
            <div className="pt-2">
              <a href="#contact" className="inline-flex items-center gap-1 text-xs font-bold text-red-650 hover:underline">
                Read Our Impact Report <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4 w-full">
            {/* Zero Carbon Future */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-between min-h-[180px] shadow-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center border border-green-100">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Zero Carbon Future</h4>
                <p className="text-slate-500 text-xs">Implementing routing optimizations and carbon offsets for African delivery routes.</p>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-4">Carbon Neutrality Target</span>
            </div>

            {/* Talents & Partnership */}
            <div className="bg-red-650 text-white rounded-3xl p-6 flex flex-col justify-between min-h-[180px] shadow-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-bold text-white">Talents &amp; Partnership</h4>
                <p className="text-white/80 text-xs">Empowering logistics teams and building strong regional clearing partnerships.</p>
              </div>
              <span className="text-[10px] text-white/60 font-semibold mt-4">Creating Infinite Possibilities</span>
            </div>

            {/* Governance */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-between min-h-[180px] shadow-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-250">
                  <Building className="w-4 h-4 text-slate-700" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Governance</h4>
                <p className="text-slate-500 text-xs">Strict compliance monitoring, anti-corruption, and safe warehouse operations.</p>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-4">High-quality Development</span>
            </div>

            {/* Social Care */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-between min-h-[180px] shadow-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                  <Heart className="w-4 h-4 text-red-650" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Social Care</h4>
                <p className="text-slate-500 text-xs">Providing disaster logistics assistance and supporting communities in importing markets.</p>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-4">Building Community Trust</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">Trusted by Importers Across Africa</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-[#f4f5f6] border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-650 text-sm leading-relaxed mb-4">
                  &quot;{t.text}&quot;
                </p>
                <div>
                  <p className="text-slate-900 font-bold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote / Contact Form ── */}
      <section id="contact" className="py-20 page-container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">Get a Shipping Quote</h2>
            <p className="text-slate-500 text-sm mt-1">
              Give us details about your shipment and our coordinators will contact you.
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Your Name</label>
                  <input type="text" className="input" placeholder="John Doe" />
                </div>
                <div>
                  <label className="label">Email / WhatsApp</label>
                  <input type="text" className="input" placeholder="+233 xx xxx xxxx" />
                </div>
              </div>
              <div>
                <label className="label">Origin City (China)</label>
                <input type="text" className="input" placeholder="e.g. Guangzhou, Yiwu, Shenzhen" />
              </div>
              <div>
                <label className="label">Destination Country (Africa)</label>
                <input type="text" className="input" placeholder="e.g. Ghana" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Cargo Type</label>
                  <input type="text" className="input" placeholder="e.g. Electronics, Clothing" />
                </div>
                <div>
                  <label className="label">Estimated Weight (kg)</label>
                  <input type="number" className="input" placeholder="e.g. 50" />
                </div>
              </div>
              <div>
                <label className="label">Message (optional)</label>
                <textarea className="input h-24 resize-none" placeholder="Any special requirements or questions…" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                Request Quote
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Inspo Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo Info */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[11px] font-black text-slate-950 tracking-widest pl-[1px]">STC</span>
                </div>
                <span className="font-display font-black text-white text-sm uppercase tracking-wider">Logistics</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                We deliver cargo as promised, linking manufacturers in Guangzhou, China with import businesses across Africa.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-650" /> Express Delivery
              </h5>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/services/air-freight" className="hover:text-white">Air Cargo Service</Link></li>
                <li><Link href="/services/sea-freight" className="hover:text-white">Ocean Container Freight</Link></li>
                <li><Link href="/track" className="hover:text-white">Milestone Tracking</Link></li>
                <li><a href="#how-it-works" className="hover:text-white">Warehouse Network</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-650" /> Service &amp; Support
              </h5>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#contact" className="hover:text-white">Customs Assistance</a></li>
                <li><Link href="/login" className="hover:text-white">Warehouse Codes</Link></li>
                <li><a href="#contact" className="hover:text-white">Rates Inquiry</a></li>
                <li><a href="#contact" className="hover:text-white">Claims Support</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-650" /> Sustainability
              </h5>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#sustainability" className="hover:text-white">Zero Carbon Future</a></li>
                <li><a href="#sustainability" className="hover:text-white">Social Care</a></li>
                <li><a href="#sustainability" className="hover:text-white">Governance</a></li>
                <li><a href="#sustainability" className="hover:text-white">Talents &amp; Partners</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright bottom */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} STC Logistics Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#contact" className="hover:text-white">Privacy Policy</a>
              <span>·</span>
              <a href="#contact" className="hover:text-white">Terms of Service</a>
              <span>·</span>
              <a href="#contact" className="hover:text-white">Guangzhou Hub Status</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating vertical sidebar pill widget */}
      <FloatingWidget />
    </div>
  );
}
