import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getMaerskEvents } from "@/lib/maersk";
import { TrackingEvent } from "@/lib/types";

const CACHE_TTL_MINUTES = 30;

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

  if (hasMaerskRef) {
    // Check cache freshness
    const { data: cachedEvents } = await supabase
      .from("tracking_events")
      .select("*")
      .eq("shipment_id", shipment.id)
      .eq("source", "maersk")
      .order("event_datetime", { ascending: false })
      .limit(1);

    const newest = cachedEvents?.[0];
    const cacheAge = newest
      ? (Date.now() - new Date(newest.created_at).getTime()) / 60000
      : Infinity;

    if (cacheAge < CACHE_TTL_MINUTES) {
      // Serve from cache
      source = "cache";
    } else {
      // Call Maersk API
      try {
        const maerskEvents = await getMaerskEvents({
          carrierBookingReference: shipment.maersk_carrier_booking_reference,
          transportDocumentReference: shipment.maersk_transport_document_reference,
          equipmentReference: shipment.maersk_equipment_reference,
        });

        if (maerskEvents.length > 0) {
          // Delete old Maersk events and upsert fresh ones
          await supabase
            .from("tracking_events")
            .delete()
            .eq("shipment_id", shipment.id)
            .eq("source", "maersk");

          await supabase.from("tracking_events").insert(
            maerskEvents.map((e) => ({
              shipment_id: shipment.id,
              source: "maersk" as const,
              event_type: e.eventType,
              description: e.eventDescription ?? e.eventType,
              location: e.location?.locationName ?? null,
              event_datetime: e.eventDateTime,
              raw_payload: e,
            }))
          );

          source = "live";
        } else {
          source = "cache";
        }
      } catch (err) {
        console.error("Maersk API error, falling back to manual events:", err);
        source = "manual";
      }
    }
  }

  // Fetch all events (Maersk + manual) merged
  const { data: allEvents } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", shipment.id)
    .order("event_datetime", { ascending: false });

  events = allEvents ?? [];

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
  });
}
