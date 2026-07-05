import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
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
            All parcels registered to your delivery code at our China warehouse.
          </p>
        </div>
      </div>

      {!parcels || parcels.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-10 h-10 text-slate-450 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No parcels yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Share your unique delivery code with your suppliers. Once they send packages to our warehouse, we will register them under your account and they will appear here.
          </p>
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
                      <p className="text-xs text-slate-500 mt-0.5 font-sans">
                        Supplier: {parcel.supplier_name}
                      </p>
                    )}
                  </div>
                  <span className={`badge-${parcel.status} shrink-0`}>
                    {STATUS_LABELS[parcel.status]}
                  </span>
                </div>
                
                <div className="text-xs text-slate-705 bg-slate-50 p-2.5 rounded-lg space-y-1 font-sans">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Description:</span>
                    <span className="font-semibold text-slate-800">
                      {parcel.item_description ?? "Not specified"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-semibold text-slate-800">{parcel.quantity}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Value (RMB):</span>
                    <span className="font-semibold text-slate-800">
                      {parcel.declared_value ? `¥${parcel.declared_value}` : "Not specified"}
                    </span>
                  </p>
                  {parcel.weight_kg && (
                    <p className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                      <span className="text-slate-400">Weight:</span>
                      <span className="font-medium text-slate-800">{parcel.weight_kg}kg</span>
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-400">{new Date(parcel.created_at).toLocaleDateString()}</span>
                  <Link
                    href={`/dashboard/parcels/${parcel.id}`}
                    className={`font-semibold transition-colors px-3 py-1.5 rounded-lg ${
                      !parcel.item_description
                        ? "text-white bg-brand-600 hover:bg-brand-700"
                        : "text-slate-650 bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    {!parcel.item_description ? "Fill Details" : "Edit Details"}
                  </Link>
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
                    <th className="text-left px-4 py-3 text-slate-500 font-medium hidden lg:table-cell">Value (RMB)</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">Actions</th>
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
                      <td className="px-4 py-3 text-slate-700 hidden lg:table-cell font-mono">
                        {parcel.declared_value ? `¥${parcel.declared_value}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge-${parcel.status}`}>
                          {STATUS_LABELS[parcel.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/parcels/${parcel.id}`}
                          className={`text-xs font-semibold transition-colors px-2.5 py-1.5 rounded-lg inline-block ${
                            !parcel.item_description
                              ? "text-white bg-brand-600 hover:bg-brand-700"
                              : "text-slate-650 bg-slate-100 hover:bg-slate-200"
                          }`}
                        >
                          {!parcel.item_description ? "Fill Details" : "Edit Details"}
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
