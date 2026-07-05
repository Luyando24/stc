"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Package2,
  LayoutDashboard,
  Package,
  Plane,
  Users,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/parcels", label: "Parcels", icon: Package },
  { href: "/admin/shipments", label: "Shipments", icon: Plane },
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0 bg-slate-50 border-r border-slate-200 z-30">
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
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
