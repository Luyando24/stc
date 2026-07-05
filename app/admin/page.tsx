import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, Plane, Users, Clock, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: pendingParcels },
    { count: arrivedParcels },
    { count: activeShipments },
    { count: totalCustomers },
    { data: recentParcels },
  ] = await Promise.all([
    supabase.from("parcels").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("parcels").select("*", { count: "exact", head: true }).eq("status", "arrived"),
    supabase.from("shipments").select("*", { count: "exact", head: true }).not("status", "in", '("delivered","cancelled")'),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("parcels").select("*, profiles(full_name, warehouse_code)").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Operations overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Pre-Alerts", value: pendingParcels ?? 0, icon: Clock, color: "text-amber-600", href: "/admin/parcels?status=pending" },
          { label: "Arrived at Warehouse", value: arrivedParcels ?? 0, icon: Package, color: "text-blue-600", href: "/admin/parcels?status=arrived" },
          { label: "Active Shipments", value: activeShipments ?? 0, icon: Plane, color: "text-brand-600", href: "/admin/shipments" },
          { label: "Total Customers", value: totalCustomers ?? 0, icon: Users, color: "text-emerald-600", href: "/admin/customers" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="card-hover p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-2xl font-display font-bold text-slate-900">{stat.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/admin/parcels" className="card-hover p-5 flex items-center gap-3">
          <Package className="w-5 h-5 text-brand-600" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm">Manage Parcels</p>
            <p className="text-slate-500 text-xs">Mark arrivals, add weight</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
        <Link href="/admin/shipments/new" className="card-hover p-5 flex items-center gap-3">
          <Plane className="w-5 h-5 text-accent-600" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm">Build Shipment</p>
            <p className="text-slate-550 text-xs">Create & assign tracking</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
        <Link href="/admin/customers" className="card-hover p-5 flex items-center gap-3">
          <Users className="w-5 h-5 text-emerald-600" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm">Customers</p>
            <p className="text-slate-550 text-xs">View all accounts</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Recent pre-alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Recent Pre-Alerts</h2>
          <Link href="/admin/parcels" className="text-sm text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Tracking #</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium hidden sm:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentParcels?.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-900 text-xs">{parcel.local_tracking_number}</td>
                    <td className="px-4 py-3 text-slate-700 hidden sm:table-cell">
                      <div>
                        <p>{(parcel.profiles as { full_name: string })?.full_name ?? "—"}</p>
                        <p className="text-xs text-slate-500 font-mono">{(parcel.profiles as { warehouse_code: string })?.warehouse_code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 hidden md:table-cell max-w-xs truncate">
                      {parcel.item_description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge-${parcel.status}`}>{parcel.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-550 hidden lg:table-cell text-xs">
                      {new Date(parcel.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
