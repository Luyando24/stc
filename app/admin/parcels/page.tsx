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
    .limit(50);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (q) {
    query = query.ilike("local_tracking_number", `%${q}%`);
  }

  const { data: parcels } = await query;

  const statuses = ["all", "pending", "arrived", "flagged", "consolidated"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Parcels</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage pre-alerts and mark arrivals
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/parcels${s !== "all" ? `?status=${s}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (status ?? "all") === s
                ? "bg-brand-500/15 text-brand-300 border border-brand-500/30"
                : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
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
            <p className="text-slate-400">No parcels found.</p>
          </div>
        ) : (
          parcels.map((parcel) => (
            <div key={parcel.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <p className="font-mono text-white font-semibold">
                    {parcel.local_tracking_number}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(parcel.profiles as { full_name: string })?.full_name} ·{" "}
                    <span className="font-mono">
                      {(parcel.profiles as { warehouse_code: string })?.warehouse_code}
                    </span>
                  </p>
                </div>
                <span className={`badge-${parcel.status}`}>{parcel.status}</span>
              </div>
              <div className="text-sm text-slate-300 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-slate-500 text-xs">Supplier</span>
                  <p>{parcel.supplier_name ?? "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Description</span>
                  <p className="truncate">{parcel.item_description ?? "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Qty</span>
                  <p>{parcel.quantity}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Value</span>
                  <p>{parcel.declared_value ? `$${parcel.declared_value}` : "—"}</p>
                </div>
              </div>
              {parcel.status === "pending" && (
                <MarkArrivedForm parcel={parcel} />
              )}
              {parcel.status === "arrived" && parcel.weight_kg && (
                <p className="text-xs text-slate-400">
                  {parcel.weight_kg}kg · {parcel.dimensions ?? "No dimensions"} · Arrived{" "}
                  {parcel.arrived_at ? new Date(parcel.arrived_at).toLocaleDateString() : "—"}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
