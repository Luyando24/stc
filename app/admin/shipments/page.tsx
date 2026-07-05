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
          <h1 className="text-2xl font-display font-bold text-white">Shipments</h1>
          <p className="text-slate-400 text-sm mt-1">All international shipments</p>
        </div>
        <Link href="/admin/shipments/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Build Shipment
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Tracking #</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Mode / Dest</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shipments?.map((s) => (
                <tr key={s.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-white text-xs">{s.stc_tracking_number}</td>
                  <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">
                    <p>{(s.profiles as { full_name: string })?.full_name ?? "—"}</p>
                    <p className="text-xs text-slate-500 font-mono">{(s.profiles as { warehouse_code: string })?.warehouse_code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300 hidden md:table-cell">
                    <span className="capitalize">{s.mode}</span> · {s.destination_country}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge-${s.status}`}>{s.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden lg:table-cell text-xs">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/shipments/${s.id}`} className="text-brand-400 hover:text-brand-300">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!shipments || shipments.length === 0) && (
            <div className="text-center py-12 text-slate-400">No shipments yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
