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
          <h1 className="text-2xl font-display font-bold text-slate-900">Pending Parcels</h1>
          <p className="text-slate-500 text-sm mt-1">
            All parcels you&apos;ve added to our China warehouse
          </p>
        </div>
        <Link href="/dashboard/pre-alert" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add parcel
        </Link>
      </div>

      {!parcels || parcels.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-10 h-10 text-slate-450 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No parcels yet</h3>
          <p className="text-slate-550 text-sm mb-6">
            Add a parcel when your supplier dispatches it.
          </p>
          <Link href="/dashboard/pre-alert" className="btn-primary">
            Add parcel
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile view: list of cards */}
          <div className="space-y-3 sm:hidden">
            {parcels.map((parcel: Parcel) => (
              <div key={parcel.id} className="card p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-slate-900 font-semibold text-sm truncate">
                      {parcel.local_tracking_number}
                    </p>
                    {parcel.supplier_name && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {parcel.supplier_name}
                      </p>
                    )}
                  </div>
                  <span className={`badge-${parcel.status} shrink-0`}>
                    {STATUS_LABELS[parcel.status]}
                  </span>
                </div>
                {(parcel.item_description || parcel.weight_kg) && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                    {parcel.item_description && <p>{parcel.item_description}</p>}
                    {parcel.weight_kg && <p className="mt-0.5 font-medium text-slate-600">Weight: {parcel.weight_kg}kg</p>}
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs text-slate-400">
                  <span>Added</span>
                  <span>{new Date(parcel.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view: Table */}
          <div className="hidden sm:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Tracking #</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium hidden sm:table-cell">Supplier</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Description</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parcels.map((parcel: Parcel) => (
                    <tr key={parcel.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-900 text-xs">
                          {parcel.local_tracking_number}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 hidden sm:table-cell">
                        {parcel.supplier_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700 hidden md:table-cell max-w-xs truncate">
                        {parcel.item_description ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge-${parcel.status}`}>
                          {STATUS_LABELS[parcel.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                        {new Date(parcel.created_at).toLocaleDateString()}
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
