import { createClient } from "@/lib/supabase/server";
import MarkArrivedForm from "@/components/admin/MarkArrivedForm";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminParcelsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("parcels")
    .select("*, profiles(full_name, warehouse_code)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    query = query.ilike("local_tracking_number", `%${q}%`);
  }

  const { data: rawParcels } = await query;

  // Filter in memory according to the rules
  const parcels = (rawParcels || []).filter((parcel) => {
    const hasDetails =
      parcel.item_description &&
      parcel.item_description.trim() !== "" &&
      parcel.declared_value !== null &&
      parcel.declared_value !== undefined;

    if (status === "pending") {
      // Show pre-alert pending (status = 'pending')
      // AND show newly added parcels without product info (status = 'arrived' but hasDetails is false)
      return parcel.status === "pending" || (parcel.status === "arrived" && !hasDetails);
    }

    if (status === "filled") {
      // Show arrived parcels with details but NOT submitted for shipping
      return parcel.status === "arrived" && hasDetails && !parcel.submitted_for_shipping;
    }
    
    if (status === "arrived") {
      // Show arrived parcels that have been submitted for shipping (Ready to Ship)
      return parcel.status === "arrived" && hasDetails && parcel.submitted_for_shipping;
    }

    if (status && status !== "all") {
      return parcel.status === status;
    }

    return true;
  });

  const tabConfig = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "filled", label: "Filled" },
    { id: "arrived", label: "Ready to Ship" },
    { id: "flagged", label: "Flagged" },
    { id: "consolidated", label: "Consolidated" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Parcels</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage customer parcels and mark arrivals
          </p>
        </div>
        <Link href="/admin/parcels/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Parcel
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabConfig.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/parcels${tab.id !== "all" ? `?status=${tab.id}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              (status ?? "all") === tab.id
                ? "bg-brand-50 text-brand-600 border-brand-200"
                : "text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mb-6">
        <input
          name="q"
          type="text"
          defaultValue={q}
          className="input max-w-sm"
          placeholder="Search tracking number…"
        />
      </form>

      {/* Parcels table */}
      <div className="space-y-4">
        {!parcels || parcels.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-slate-500">No parcels found.</p>
          </div>
        ) : (
          parcels.map((parcel) => (
            <div key={parcel.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <p className="font-mono text-slate-900 font-semibold">
                    {parcel.local_tracking_number}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(parcel.profiles as { full_name: string })?.full_name} ·{" "}
                    <span className="font-mono">
                      {(parcel.profiles as { warehouse_code: string })?.warehouse_code}
                    </span>
                  </p>
                </div>
                <span className={`badge-${parcel.status}`}>
                  {parcel.status === "arrived" && (!parcel.item_description || parcel.item_description.trim() === "" || parcel.declared_value === null || parcel.declared_value === undefined)
                    ? "arrived (pending info)"
                    : parcel.status === "arrived" && !parcel.submitted_for_shipping
                    ? "filled (unsubmitted)"
                    : parcel.status === "arrived"
                    ? "ready to ship"
                    : parcel.status}
                </span>
              </div>
               <div className="text-sm text-slate-700 mb-3 grid grid-cols-2 sm:grid-cols-7 gap-2">
                <div>
                  <span className="text-slate-500 text-xs">Supplier</span>
                  <p className="font-medium text-slate-800">{parcel.supplier_name ?? "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Description</span>
                  <p className="truncate font-medium text-slate-800">{parcel.item_description ?? "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Qty</span>
                  <p className="font-medium text-slate-800">{parcel.quantity}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Value</span>
                  <p className="font-medium text-slate-800">{parcel.declared_value ? `¥${parcel.declared_value}` : "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Weight</span>
                  <p className="font-medium text-slate-800">{parcel.weight_kg ? `${parcel.weight_kg} kg` : "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Dimensions</span>
                  <p className="font-medium text-slate-800">{parcel.dimensions ?? "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Est. Cost</span>
                  <p className="font-bold text-emerald-650">{parcel.shipping_cost ? `$${Number(parcel.shipping_cost).toFixed(2)}` : "—"}</p>
                </div>
              </div>
              {parcel.status === "pending" && (
                <MarkArrivedForm parcel={parcel} />
              )}
              {parcel.status === "arrived" && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-slate-500">
                    {parcel.weight_kg ? `${parcel.weight_kg}kg` : "Awaiting weight"} · {parcel.dimensions ?? "No dimensions"} · Arrived{" "}
                    {parcel.arrived_at ? new Date(parcel.arrived_at).toLocaleDateString() : "—"}
                  </p>
                  {parcel.item_description &&
                    parcel.item_description.trim() !== "" &&
                    parcel.declared_value !== null &&
                    parcel.declared_value !== undefined && (
                      <Link
                        href={`/admin/shipments/new?parcel_id=${parcel.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Quick Ship
                      </Link>
                    )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
