import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plane, Ship, MapPin, Calendar, Package } from "lucide-react";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: shipment } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .single();

  if (!shipment) notFound();

  const { data: events } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", id)
    .order("event_datetime", { ascending: false });

  const { data: parcelLinks } = await supabase
    .from("shipment_parcels")
    .select("parcel_id, parcels(*)")
    .eq("shipment_id", id);

  type ParcelSummary = { id: string; local_tracking_number: string; item_description: string | null; quantity: number };
  const parcels = (parcelLinks?.map((l: { parcels: unknown }) => l.parcels as ParcelSummary) ?? []) as ParcelSummary[];

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/shipments" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to shipments
      </Link>

      {/* Shipment Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">STC Tracking Number</p>
            <p className="text-2xl font-mono font-bold text-slate-900">{shipment.stc_tracking_number}</p>
          </div>
          <span className={`badge-${shipment.status} text-sm px-3 py-1.5`}>
            {shipment.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            {shipment.mode === "air" ? (
              <Plane className="w-4 h-4 text-brand-600" />
            ) : (
              <Ship className="w-4 h-4 text-brand-600" />
            )}
            <span className="text-slate-800 capitalize">{shipment.mode} freight</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="w-4 h-4 text-accent-600" />
            <span className="text-slate-800">{shipment.destination_country}</span>
          </div>
          {shipment.estimated_delivery_date && (
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-800">
                {new Date(shipment.estimated_delivery_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {shipment.freight_cost && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">Freight Cost</p>
            <p className="text-lg font-semibold text-slate-900">
              ${Number(shipment.freight_cost).toFixed(2)} USD
            </p>
          </div>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Tracking Timeline</h2>
        <TrackingTimeline events={events ?? []} shipmentStatus={shipment.status} />
      </div>

      {/* Parcels in this shipment */}
      {parcels.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Parcels in this shipment
          </h2>
          <div className="space-y-2">
            {parcels.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-slate-900">{p.local_tracking_number}</p>
                  <p className="text-xs text-slate-500">{p.item_description ?? "No description"} · Qty {p.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
