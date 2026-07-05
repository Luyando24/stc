import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getMaerskEvents } from "@/lib/maersk";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * GET /api/cron/sync-maersk
 * Called by Vercel Cron — refreshes Maersk events for all active sea shipments.
 * Secured with CRON_SECRET env var.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Fetch all active sea shipments with a Maersk reference
  const { data: shipments, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("mode", "sea")
    .not("status", "in", '("delivered","cancelled")')
    .or(
      "maersk_carrier_booking_reference.not.is.null,maersk_transport_document_reference.not.is.null,maersk_equipment_reference.not.is.null"
    );

  if (error) {
    console.error("Cron: failed to fetch shipments:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const results = { updated: 0, failed: 0, skipped: 0 };

  for (const shipment of shipments ?? []) {
    try {
      const maerskEvents = await getMaerskEvents({
        carrierBookingReference: shipment.maersk_carrier_booking_reference,
        transportDocumentReference: shipment.maersk_transport_document_reference,
        equipmentReference: shipment.maersk_equipment_reference,
      });

      if (maerskEvents.length === 0) {
        results.skipped++;
        continue;
      }

      // Replace Maersk events in cache
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

      results.updated++;
    } catch (err) {
      console.error(`Cron: failed to sync shipment ${shipment.stc_tracking_number}:`, err);
      results.failed++;
    }
  }

  console.log("Maersk cron sync complete:", results);
  return NextResponse.json({ ok: true, ...results });
}
