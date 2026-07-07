"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services/air-freight", label: "Services", hasDropdown: true },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function getAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function getProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      setProfile(data);
    }
    if (user) {
      getProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user]);

  const dashboardUrl =
    profile?.role === "admin" || profile?.role === "warehouse_staff"
      ? "/admin"
      : "/dashboard";

  const parcelsUrl =
    profile?.role === "admin" || profile?.role === "warehouse_staff"
      ? "/admin/parcels"
      : "/dashboard/parcels";

  // Build nav links dynamically
  const links = [...NAV_LINKS];
  if (user) {
    links.push({ href: parcelsUrl, label: "My Parcels" });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 h-14 flex items-center">
      <div className="page-container w-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 font-display font-black text-lg tracking-tight">
            <span className="text-brand-650">STC</span>
            <span className="text-brand-600">Logistics</span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <div key={link.label} className="flex items-center gap-1">
                  <Link
                    href={link.href}
                    className={`text-sm font-semibold transition-colors ${
                      active ? "text-brand-650" : "text-brand-600/90 hover:text-brand-650"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 text-brand-600/70" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Links (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-600">
            <button className="flex items-center gap-1 hover:text-brand-650 transition-colors">
              <Globe className="w-4 h-4" />
              <span>Africa / English</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300">|</span>
            {user ? (
              <Link href={dashboardUrl} className="bg-brand-650 hover:bg-accent-600 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md transition-all">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-brand-650 hover:bg-accent-600 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md transition-all">
                Log in / Register
              </Link>
            )}
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
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 py-4 px-4 shadow-lg md:hidden">
          <div className="space-y-1 mb-4">
            {links.map((link) => (
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
            {user ? (
              <Link href={dashboardUrl} onClick={() => setOpen(false)} className="bg-brand-650 hover:bg-accent-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg shadow-md text-center transition-all">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="bg-brand-650 hover:bg-accent-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg shadow-md text-center transition-all">
                Log in / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
