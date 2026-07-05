"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Package2,
  LayoutDashboard,
  Package,
  Plane,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/parcels", label: "My Parcels", icon: Package },
  { href: "/dashboard/shipments", label: "My Shipments", icon: Plane },
];

export default function DashboardNav({ profile }: { profile: Profile | null }) {
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
          <span className="font-display font-bold text-slate-900">STC Logistics</span>
        </Link>
      </div>

      {/* Warehouse code chip */}
      {profile?.warehouse_code && (
        <div className="mx-3 mt-4 p-3 rounded-xl bg-brand-50 border border-brand-100">
          <p className="text-xs text-brand-600 font-medium">Your warehouse code</p>
          <p className="text-sm font-mono font-bold text-brand-700 mt-0.5">
            {profile.warehouse_code}
          </p>
        </div>
      )}

      {/* Quick action */}
      <div className="px-3 mt-4">
        <Link
          href="/dashboard/pre-alert"
          className="btn-primary w-full justify-center text-xs py-2"
          onClick={() => setMobileOpen(false)}
        >
          <Plus className="w-3.5 h-3.5" />
          Pre-alert parcel
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-50 text-brand-600 border border-brand-100"
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
          <p className="text-sm font-medium text-slate-900 truncate">
            {profile?.full_name ?? "My Account"}
          </p>
          <p className="text-xs text-slate-600 truncate mt-0.5">
            {profile?.role ?? "customer"}
          </p>
        </div>
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
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-slate-50 border-r border-slate-200 z-30">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Package2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-slate-900 text-sm">STC Logistics</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-600 hover:text-slate-900"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-slate-50 border-r border-slate-200 z-50">
            <NavContent />
          </aside>
        </>
      )}

      {/* Mobile top padding spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
