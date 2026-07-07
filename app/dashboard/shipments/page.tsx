import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plane, Plus } from "lucide-react";

export default async function ShipmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">All Shipments</h1>
          <p className="text-slate-500 text-sm mt-1">Track all your international shipments</p>
        </div>
        <Link href="/dashboard/ship" className="btn-primary">
          <Plus className="w-4 h-4" /> Ship Parcel
        </Link>
      </div>

      {!shipments || shipments.length === 0 ? (
        <div className="card p-12 text-center">
          <Plane className="w-10 h-10 text-slate-450 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No shipments yet</h3>
          <p className="text-slate-555 text-sm mb-6">Once your parcels arrive at our warehouse, you can ship them.</p>
          <Link href="/dashboard/ship" className="btn-primary">Ship parcel</Link>
        </div>
      ) : (
        <>
          {/* Mobile view: list of cards */}
          <div className="space-y-3 sm:hidden">
            {shipments.map((s) => (
              <Link key={s.id} href={`/dashboard/shipments/${s.id}`} className="card p-4 block hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-slate-900 font-semibold text-sm truncate">
                      {s.stc_tracking_number}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">
                      {s.mode} freight · {s.destination_country}
                    </p>
                  </div>
                  <span className={`badge-${s.status} shrink-0`}>
                    {s.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between items-center text-xs text-slate-400">
                  <span>Created</span>
                  <span>{new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop view: Table */}
          <div className="hidden sm:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Tracking #</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium hidden sm:table-cell">Mode</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Destination</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-900 text-xs">{s.stc_tracking_number}</td>
                      <td className="px-4 py-3 text-slate-700 capitalize hidden sm:table-cell">{s.mode}</td>
                      <td className="px-4 py-3 text-slate-700 hidden md:table-cell">{s.destination_country}</td>
                      <td className="px-4 py-3">
                        <span className={`badge-${s.status}`}>{s.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                        {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/shipments/${s.id}`} className="text-brand-600 hover:text-brand-700 text-xs font-medium">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
