import { Metadata } from "next";
import Link from "next/link";
import { Plane, Clock, Shield, Globe, CheckCircle, ArrowRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Air Freight from China to Africa",
  description:
    "Fast and reliable air freight services from China to Africa in 7–12 days. Door-to-door tracking, competitive rates, and real-time updates.",
};

const FEATURES = [
  { icon: Clock, title: "7–12 Day Transit", desc: "Express air cargo from major Chinese airports to Africa." },
  { icon: Shield, title: "Secure Handling", desc: "Every shipment is insured and handled with care." },
  { icon: Globe, title: "40+ Destinations", desc: "We serve airports across 40+ African countries." },
  { icon: Plane, title: "Full Tracking", desc: "Real-time milestone updates from pickup to delivery." },
];

export default function AirFreightPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav />
      <div className="page-container pt-28 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <Plane className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <p className="text-brand-600 text-sm font-medium">STC Logistics Services</p>
              <h1 className="text-3xl font-display font-bold text-slate-900">Air Freight</h1>
            </div>
          </div>

          <p className="text-slate-600 text-lg mb-10">
            When speed matters, our air freight service gets your cargo from China to Africa in 7–12 days.
            Ideal for high-value goods, perishables, and urgent orders.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-5">
                <f.icon className="w-5 h-5 text-brand-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="card p-6 border-brand-500/10 bg-brand-500/5 mb-10">
            <h2 className="font-display font-bold text-slate-900 text-lg mb-2">How Our Air Freight Works</h2>
            <ul className="space-y-3">
              {[
                "Share your STC warehouse code with your China supplier",
                "Submit a pre-alert on your dashboard when goods are dispatched",
                "Our team picks up and consolidates your cargo",
                "We book with major airlines and provide your STC tracking number",
                "Track real-time milestones until delivery in Africa",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {step}
                </li>
              ))}
            </ul>
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
