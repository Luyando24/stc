import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plane, Ship, MapPin } from "lucide-react";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import AdminMilestoneForm from "@/components/admin/AdminMilestoneForm";
import AdminShipmentStatusForm from "@/components/admin/AdminShipmentStatusForm";
import AdminAssignMaerskForm from "@/components/admin/AdminAssignMaerskForm";
import { syncShipmentEvents } from "@/lib/tracking-utils";

export default async function AdminShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select("*, profiles(full_name, warehouse_code, role)")
    .eq("id", id)
    .single();

  if (!shipment) notFound();

  // Sync Maersk events using service client to write cache
  const serviceSupabase = createServiceClient();
  await syncShipmentEvents(serviceSupabase, shipment);

  const { data: events } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", id)
    .order("event_datetime", { ascending: false });

  const { data: parcelLinks } = await supabase
    .from("shipment_parcels")
    .select("parcel_id, parcels(*)")
    .eq("shipment_id", id);

  const { data: maerskBookings } = await supabase
    .from("shipments")
    .select("id, stc_tracking_number, mode, destination_country, maersk_carrier_booking_reference, maersk_transport_document_reference, maersk_equipment_reference, profiles!inner(role)")
    .eq("profiles.role", "admin")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <Link href="/admin/shipments" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to shipments
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">STC Tracking</p>
            <p className="text-2xl font-mono font-bold text-slate-900">{shipment.stc_tracking_number}</p>
            <p className="text-sm text-slate-500 mt-1">
              Customer: <span className="font-semibold text-slate-800">{(shipment.profiles as { full_name: string })?.full_name}</span>{" "}
              · <span className="font-mono">{(shipment.profiles as { warehouse_code: string })?.warehouse_code}</span>
            </p>
          </div>
          <span className={`badge-${shipment.status} text-sm px-3 py-1.5`}>{shipment.status.replace(/_/g, " ")}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2 text-slate-650">
            {shipment.mode === "sea" ? <Ship className="w-4 h-4 text-brand-600" /> : <Plane className="w-4 h-4 text-brand-600" />}
            <span className="capitalize text-slate-800 font-medium">{shipment.mode} freight</span>
          </div>
          <div className="flex items-center gap-2 text-slate-650">
            <MapPin className="w-4 h-4 text-accent-600" />
            <span className="text-slate-800 font-medium">{shipment.destination_country}</span>
          </div>
          {shipment.freight_cost && (
            <div className="text-slate-800 font-semibold">${Number(shipment.freight_cost).toFixed(2)} USD</div>
          )}
        </div>

        {/* Receiver Details */}
        {shipment.receiver_name && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">Receiver Details</p>
            <p className="font-medium text-slate-900">{shipment.receiver_name} · {shipment.receiver_phone}</p>
            <p className="font-sans leading-relaxed text-slate-700">{shipment.receiver_address}, {shipment.destination_country}</p>
          </div>
        )}

        {/* Maersk refs */}
        {(shipment.maersk_carrier_booking_reference || shipment.maersk_transport_document_reference || shipment.maersk_equipment_reference) && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-xs">
            <p className="text-slate-500 font-semibold mb-2">Maersk References</p>
            {shipment.maersk_carrier_booking_reference && (
              <p className="text-slate-700 font-mono">Booking: {shipment.maersk_carrier_booking_reference}</p>
            )}
            {shipment.maersk_transport_document_reference && (
              <p className="text-slate-700 font-mono">B/L: {shipment.maersk_transport_document_reference}</p>
            )}
            {shipment.maersk_equipment_reference && (
              <p className="text-slate-700 font-mono">Container: {shipment.maersk_equipment_reference}</p>
            )}
          </div>
        )}
      </div>

      {/* Assign to Maersk Booking (only for customer shipments) */}
      {shipment.profiles?.role !== "admin" && (
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Assign to Maersk Master Booking</h2>
          <AdminAssignMaerskForm
            shipmentId={id}
            currentTrackingNumber={shipment.stc_tracking_number}
            maerskBookings={(maerskBookings as any[]) ?? []}
          />
        </div>
      )}

      {/* Status update */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Update Status</h2>
        {shipment.maersk_carrier_booking_reference || shipment.maersk_transport_document_reference || shipment.maersk_equipment_reference ? (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed">
            Status of Maersk-linked shipments is managed automatically based on live tracking events and cannot be changed manually.
          </p>
        ) : (
          <AdminShipmentStatusForm shipmentId={id} currentStatus={shipment.status} />
        )}
      </div>

      {/* Add manual milestone */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Add Manual Milestone</h2>
        <AdminMilestoneForm shipmentId={id} />
      </div>

      {/* Tracking timeline */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Tracking Events</h2>
        <TrackingTimeline events={events ?? []} shipmentStatus={shipment.status} />
      </div>

      {/* Parcels */}
      {parcelLinks && parcelLinks.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Consolidated Parcels</h2>
          <div className="space-y-2">
            {parcelLinks.map((l) => {
              const p = l.parcels as unknown as { id: string; local_tracking_number: string; item_description: string | null; quantity: number; weight_kg: number | null };
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-sm">
                  <span className="font-mono text-slate-900 flex-1">{p.local_tracking_number}</span>
                  <span className="text-slate-500 text-xs">{p.item_description ?? "—"}</span>
                  {p.weight_kg && <span className="text-slate-500 text-xs">{p.weight_kg}kg</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
