import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { syncShipmentEvents, ShipmentSyncResult } from "@/lib/tracking-utils";
import { TrackingEvent } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stcNumber: string }> }
) {
  const { stcNumber } = await params;
  const supabase = createServiceClient();

  // 1. Look up shipment by STC tracking number
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("*")
    .eq("stc_tracking_number", stcNumber.toUpperCase())
    .single();

  if (shipmentError || !shipment) {
    return NextResponse.json(
      { error: "Tracking number not found." },
      { status: 404 }
    );
  }

  const hasMaerskRef =
    shipment.maersk_transport_document_reference ||
    shipment.maersk_carrier_booking_reference ||
    shipment.maersk_equipment_reference;

  let events: TrackingEvent[] = [];
  let source: "cache" | "live" | "manual" = "manual";
  let trackingSync: ShipmentSyncResult = { status: "skipped" };

  if (hasMaerskRef) {
    trackingSync = await syncShipmentEvents(supabase, shipment);
    source = trackingSync.status === "synced" ? "live" : "cache";
  }

  // Fetch all events (Maersk + manual) merged
  const { data: allEvents } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", shipment.id)
    .order("event_datetime", { ascending: false });

  const liveRefreshReturnedNoData =
    trackingSync.status === "not_found_or_unauthorized" ||
    trackingSync.status === "error" ||
    (trackingSync.status === "synced" && trackingSync.eventCount === 0);

  // Never substitute cached or manual events when a live Maersk refresh
  // explicitly failed or returned no events.
  events = liveRefreshReturnedNoData ? [] : (allEvents ?? []);

  return NextResponse.json({
    shipment: {
      stc_tracking_number: shipment.stc_tracking_number,
      mode: shipment.mode,
      destination_country: shipment.destination_country,
      status: shipment.status,
      estimated_delivery_date: shipment.estimated_delivery_date,
    },
    events,
    source,
    tracking_sync: trackingSync,
  });
}
