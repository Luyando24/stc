import { Metadata } from "next";
import Link from "next/link";
import { Ship, Clock, Shield, Globe, CheckCircle, ArrowRight, Anchor } from "lucide-react";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Sea Freight from China to Africa",
  description:
    "Cost-effective FCL and LCL sea freight from China to Africa. Live Maersk tracking, competitive rates, and 25–40 day transit times.",
};

const FEATURES = [
  { icon: Clock, title: "25–40 Day Transit", desc: "Reliable ocean freight from Chinese ports to African destinations." },
  { icon: Shield, title: "Live Maersk Tracking", desc: "Real-time vessel tracking powered by Maersk's DCSA-compliant API." },
  { icon: Anchor, title: "FCL & LCL Options", desc: "Full Container Load or Less than Container Load — we handle both." },
  { icon: Globe, title: "Major African Ports", desc: "We ship to major ports including Lagos, Mombasa, Durban, and more." },
];

export default function SeaFreightPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav />
      <div className="page-container pt-28 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center">
              <Ship className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <p className="text-accent-500 text-sm font-medium">STC Logistics Services</p>
              <h1 className="text-3xl font-display font-bold text-slate-900">Sea Freight</h1>
            </div>
          </div>

          <p className="text-slate-600 text-lg mb-10">
            Our sea freight service is ideal for bulk cargo and cost-sensitive shipments. 
            We consolidate your goods from our Guangzhou warehouse and ship to major African ports 
            with live Maersk vessel tracking.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-5">
                <f.icon className="w-5 h-5 text-accent-500 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="card p-6 mb-6" style={{ borderColor: "rgba(249,115,22,0.1)", backgroundColor: "rgba(249,115,22,0.05)" }}>
            <h2 className="font-display font-bold text-slate-900 text-lg mb-2">How Our Sea Freight Works</h2>
            <ul className="space-y-3">
              {[
                "Goods arrive at our Guangzhou warehouse using your warehouse code",
                "We inspect, weigh, and photograph all parcels",
                "Once you request a shipment, we book with Maersk or partner carriers",
                "An STC tracking number is generated — enter it on our site for live updates",
                "Cargo arrives at your African port; local delivery arranged upon request",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5 mb-10">
            <p className="text-xs text-slate-500 font-medium mb-2">TRACKING TRANSPARENCY</p>
            <p className="text-slate-600 text-sm">
              For Maersk-booked shipments, our platform calls the Maersk Track &amp; Trace API every 30 minutes 
              and surfaces the latest vessel position, port events, and ETAs directly in your dashboard. 
              You never need to visit Maersk&apos;s website.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/signup" className="btn-primary">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/#contact" className="btn-secondary">Get a Quote</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
