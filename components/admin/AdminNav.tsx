"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import {
  Package2,
  LayoutDashboard,
  Package,
  Plane,
  Users,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Settings,
  Ship,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/parcels", label: "Parcels", icon: Package },
  { href: "/admin/shipments", label: "Shipments", icon: Plane },
  { href: "/admin/maersk", label: "Maersk Bookings", icon: Ship },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminNav({
  role,
  fullName,
}: {
  role: string;
  fullName: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Package2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-slate-900 text-sm">STC Logistics</span>
        </Link>
        <div className="flex items-center gap-1.5 mt-3 px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs text-amber-700 font-medium capitalize">{role}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {(role === "admin" ? [...NAV_ITEMS, { href: "/admin/settings", label: "Settings", icon: Settings }] : NAV_ITEMS).map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-55 bg-brand-50 text-brand-600 border border-brand-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-slate-200 pt-4">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-slate-900 truncate">{fullName ?? "Admin"}</p>
        </div>
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          Customer view
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0 bg-slate-50 border-r border-slate-200 z-30">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Package2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-slate-900 text-sm">STC Logistics</span>
          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-semibold uppercase">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-600 hover:text-slate-900"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-45 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-slate-50 border-r border-slate-200 z-50">
            <NavContent />
          </aside>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-40 px-3 py-2">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={clsx(
              "flex flex-col items-center gap-1 p-1.5 transition-colors",
              pathname === "/admin" ? "text-brand-600" : "text-slate-500 hover:text-slate-950"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>

          {/* Parcels */}
          <Link
            href="/admin/parcels"
            className={clsx(
              "flex flex-col items-center gap-1 p-1.5 transition-colors",
              pathname.startsWith("/admin/parcels") ? "text-brand-600" : "text-slate-500 hover:text-slate-950"
            )}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-medium">Parcels</span>
          </Link>

          {/* Shipments */}
          <Link
            href="/admin/shipments"
            className={clsx(
              "flex flex-col items-center gap-1 p-1.5 transition-colors",
              pathname.startsWith("/admin/shipments") ? "text-brand-600" : "text-slate-500 hover:text-slate-950"
            )}
          >
            <Plane className="w-5 h-5" />
            <span className="text-[10px] font-medium">Shipments</span>
          </Link>

          {/* Customers */}
          <Link
            href="/admin/customers"
            className={clsx(
              "flex flex-col items-center gap-1 p-1.5 transition-colors",
              pathname.startsWith("/admin/customers") ? "text-brand-600" : "text-slate-500 hover:text-slate-950"
            )}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Customers</span>
          </Link>

          {/* Menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 text-slate-500 hover:text-slate-955"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile top padding spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
