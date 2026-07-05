import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Calendar } from "lucide-react";

export default async function DeliveredParcelsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all shipments marked as delivered for this customer
  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, stc_tracking_number, updated_at")
    .eq("customer_id", user.id)
    .eq("status", "delivered");

  const shipmentMap = new Map<string, { stc_tracking_number: string; delivered_at: string }>();
  const shipmentIds: string[] = [];

  if (shipments) {
    shipments.forEach((s) => {
      shipmentIds.push(s.id);
      shipmentMap.set(s.id, {
        stc_tracking_number: s.stc_tracking_number,
        delivered_at: s.updated_at,
      });
    });
  }

  type DeliveredParcel = {
    id: string;
    local_tracking_number: string;
    supplier_name: string | null;
    item_description: string | null;
    quantity: number;
    declared_value: number | null;
    weight_kg: number | null;
    shipment_id: string;
    shipment_tracking: string;
    delivered_at: string;
  };

  let deliveredParcels: DeliveredParcel[] = [];

  if (shipmentIds.length > 0) {
    const { data: links } = await supabase
      .from("shipment_parcels")
      .select("shipment_id, parcels(*)")
      .in("shipment_id", shipmentIds);

    if (links) {
      deliveredParcels = links
        .map((link) => {
          const p = link.parcels as Record<string, any>;
          if (!p) return null;
          const sInfo = shipmentMap.get(link.shipment_id);
          return {
            id: p.id,
            local_tracking_number: p.local_tracking_number,
            supplier_name: p.supplier_name,
            item_description: p.item_description,
            quantity: p.quantity,
            declared_value: p.declared_value,
            weight_kg: p.weight_kg,
            shipment_id: link.shipment_id,
            shipment_tracking: sInfo?.stc_tracking_number ?? "",
            delivered_at: sInfo?.delivered_at ?? "",
          };
        })
        .filter((item): item is DeliveredParcel => item !== null);
    }
  }

  // Sort by delivery date descending
  deliveredParcels.sort((a, b) => new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
          Delivered Parcels
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Parcels that have successfully arrived at your delivery address.
        </p>
      </div>

      {deliveredParcels.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-10 h-10 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No delivered parcels</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Parcels will appear here once their respective shipments are marked as delivered.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile view: list of cards */}
          <div className="space-y-3 sm:hidden">
            {deliveredParcels.map((parcel) => (
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
                  <span className="badge-delivered shrink-0">Delivered</span>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg space-y-1 font-sans">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Description:</span>
                    <span className="font-semibold text-slate-800">
                      {parcel.item_description ?? "—"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-semibold text-slate-800">{parcel.quantity}</span>
                  </p>
                  {parcel.weight_kg && (
                    <p className="flex justify-between">
                      <span className="text-slate-400">Weight:</span>
                      <span className="font-medium text-slate-800">{parcel.weight_kg}kg</span>
                    </p>
                  )}
                  <p className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                    <span className="text-slate-400">Shipment:</span>
                    <Link
                      href={`/dashboard/shipments/${parcel.shipment_id}`}
                      className="font-mono font-semibold text-brand-600 hover:underline flex items-center gap-0.5"
                    >
                      {parcel.shipment_tracking} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Delivered: {new Date(parcel.delivered_at).toLocaleDateString()}
                  </span>
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
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Supplier</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Description</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Weight</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Shipment</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Delivered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveredParcels.map((parcel) => (
                    <tr key={parcel.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-900 text-xs">
                          {parcel.local_tracking_number}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {parcel.supplier_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                        {parcel.item_description ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {parcel.weight_kg ? `${parcel.weight_kg} kg` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/shipments/${parcel.shipment_id}`}
                          className="font-mono font-semibold text-brand-600 hover:underline flex items-center gap-0.5 text-xs"
                        >
                          {parcel.shipment_tracking} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-550 text-xs">
                        {new Date(parcel.delivered_at).toLocaleDateString()}
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
