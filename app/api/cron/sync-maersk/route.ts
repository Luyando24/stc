import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { syncShipmentEvents } from "@/lib/tracking-utils";

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

  const results = { updated: 0, failed: 0 };

  for (const shipment of shipments ?? []) {
    try {
      // Force sync to bypass the cache age check during scheduled cron execution
      const syncResult = await syncShipmentEvents(supabase, shipment, true);
      if (syncResult.status === "synced") {
        results.updated++;
      } else if (syncResult.status === "error" || syncResult.status === "not_found_or_unauthorized") {
        console.error(`Cron: failed to sync shipment ${shipment.stc_tracking_number}: ${syncResult.message}`);
        results.failed++;
      }
    } catch (err) {
      console.error(`Cron: failed to sync shipment ${shipment.stc_tracking_number}:`, err);
      results.failed++;
    }
  }

  console.log("Maersk cron sync complete:", results);
  return NextResponse.json({ ok: true, ...results });
}
