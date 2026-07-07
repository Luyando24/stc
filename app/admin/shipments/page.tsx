import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plane, Plus, ArrowRight } from "lucide-react";

export default async function AdminShipmentsPage() {
  const supabase = await createClient();

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*, profiles(full_name, warehouse_code)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Shipments</h1>
          <p className="text-slate-500 text-sm mt-1">All international shipments</p>
        </div>
        <Link href="/admin/shipments/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Build Shipment
        </Link>
      </div>

      <div className="space-y-3 sm:hidden">
        {shipments?.map((s) => (
          <Link key={s.id} href={`/admin/shipments/${s.id}`} className="card p-4 block hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="font-mono text-slate-900 font-semibold text-sm truncate">
                  {s.stc_tracking_number}
                </p>
                <p className="text-xs text-slate-700 mt-1 font-medium">
                  {(s.profiles as { full_name: string })?.full_name ?? "—"} ({(s.profiles as { warehouse_code: string })?.warehouse_code})
                </p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">
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
        {(!shipments || shipments.length === 0) && (
          <div className="card p-8 text-center text-slate-500 text-sm">No shipments yet.</div>
        )}
      </div>

      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Mode / Dest</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden lg:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-900 text-xs">{s.stc_tracking_number}</td>
                  <td className="px-4 py-3 text-slate-700 hidden sm:table-cell">
                    <p className="font-medium text-slate-800">{(s.profiles as { full_name: string })?.full_name ?? "—"}</p>
                    <p className="text-xs text-slate-500 font-mono">{(s.profiles as { warehouse_code: string })?.warehouse_code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700 hidden md:table-cell">
                    <span className="capitalize">{s.mode}</span> · {s.destination_country}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge-${s.status}`}>{s.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/shipments/${s.id}`} className="text-brand-600 hover:text-brand-700">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!shipments || shipments.length === 0) && (
            <div className="text-center py-12 text-slate-500">No shipments yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
