import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { Parcel } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  arrived: "Arrived",
  flagged: "Flagged",
  consolidated: "Consolidated",
  cancelled: "Cancelled",
};

export default async function ParcelsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: parcels } = await supabase
    .from("parcels")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Parcels</h1>
          <p className="text-slate-400 text-sm mt-1">
            All parcels you&apos;ve pre-alerted to our China warehouse
          </p>
        </div>
        <Link href="/dashboard/pre-alert" className="btn-primary">
          <Plus className="w-4 h-4" />
          Pre-alert parcel
        </Link>
      </div>

      {!parcels || parcels.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No parcels yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Submit a pre-alert when your supplier dispatches a parcel.
          </p>
          <Link href="/dashboard/pre-alert" className="btn-primary">
            Submit pre-alert
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Tracking #</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Supplier</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {parcels.map((parcel: Parcel) => (
                  <tr key={parcel.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-white text-xs">
                        {parcel.local_tracking_number}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">
                      {parcel.supplier_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300 hidden md:table-cell max-w-xs truncate">
                      {parcel.item_description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge-${parcel.status}`}>
                        {STATUS_LABELS[parcel.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden lg:table-cell text-xs">
                      {new Date(parcel.created_at).toLocaleDateString()}
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
