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
          <h1 className="text-2xl font-display font-bold text-white">My Shipments</h1>
          <p className="text-slate-400 text-sm mt-1">Track all your international shipments</p>
        </div>
        <Link href="/dashboard/shipments/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Request Shipment
        </Link>
      </div>

      {!shipments || shipments.length === 0 ? (
        <div className="card p-12 text-center">
          <Plane className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No shipments yet</h3>
          <p className="text-slate-400 text-sm mb-6">Once your parcels arrive at our warehouse, you can request a shipment.</p>
          <Link href="/dashboard/shipments/new" className="btn-primary">Request shipment</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Tracking #</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Mode</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Destination</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-mono text-white text-xs">{s.stc_tracking_number}</td>
                    <td className="px-4 py-3 text-slate-300 capitalize hidden sm:table-cell">{s.mode}</td>
                    <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{s.destination_country}</td>
                    <td className="px-4 py-3">
                      <span className={`badge-${s.status}`}>{s.status.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden lg:table-cell text-xs">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/shipments/${s.id}`} className="text-brand-400 hover:text-brand-300 text-xs font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
