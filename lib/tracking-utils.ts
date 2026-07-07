import { SupabaseClient } from "@supabase/supabase-js";
import { getMaerskEvents } from "./maersk";

const CACHE_TTL_MINUTES = 30;

/**
 * Generates a unique STC tracking number in the format: STC + 8 random digits (e.g. STC23586765).
 * Queries the shipments table to prevent collisions.
 */
export async function generateSTCTrackingNumber(supabase: SupabaseClient): Promise<string> {
  let attempts = 0;
  while (attempts < 100) {
    const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
    const trackingNumber = `STC${random8}`;
    
    // Check if it already exists
    const { data, error } = await supabase
      .from("shipments")
      .select("id")
      .eq("stc_tracking_number", trackingNumber)
      .maybeSingle();
      
    if (!data && !error) {
      return trackingNumber;
    }
    attempts++;
  }
  throw new Error("Failed to generate a unique STC tracking number after 100 attempts");
}

/**
 * Derives the current shipment status based on the chronological Maersk events
 * that have occurred (i.e. whose datetime is in the past).
 */
export function determineShipmentStatus(events: any[]): string {
  if (!events || events.length === 0) return "booked";

  const now = Date.now();

  // Sort events chronologically (ascending) to trace the journey
  const sorted = [...events].sort(
    (a, b) => new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime()
  );

  let hasDeparted = false;
  let hasArrived = false;
  let hasDelivered = false;

  for (const e of sorted) {
    const desc = (e.eventDescription || e.eventType || "").toLowerCase();
    const eventTime = new Date(e.eventDateTime).getTime();
    const isPast = eventTime <= now;

    if (isPast) {
      if (desc.includes("departure") || desc.includes("gate in") || desc.includes("load on")) {
        hasDeparted = true;
      }
      if (desc.includes("arrival")) {
        hasArrived = true;
      }
      if (desc.includes("delivered") || desc.includes("empty return") || desc.includes("gate out empty")) {
        // Only count gate out empty as delivered if it happened AFTER arrival at destination
        if (hasArrived) {
          hasDelivered = true;
        }
      }
    }
  }

  if (hasDelivered) return "delivered";
  if (hasArrived) return "customs"; // Once vessel arrives at destination port, status is 'customs'
  if (hasDeparted) return "in_transit";
  return "booked";
}

/**
 * Syncs tracking events from the Maersk API for a shipment and caches them in the database.
 * Auto-calculates and updates the shipment status and triggers notifications if it changed.
 */
export async function syncShipmentEvents(
  supabase: SupabaseClient,
  shipment: {
    id: string;
    maersk_carrier_booking_reference: string | null;
    maersk_transport_document_reference: string | null;
    maersk_equipment_reference: string | null;
  }
): Promise<void> {
  const hasMaerskRef =
    shipment.maersk_transport_document_reference ||
    shipment.maersk_carrier_booking_reference ||
    shipment.maersk_equipment_reference;

  if (!hasMaerskRef) return;

  // Check cache freshness
  const { data: cachedEvents } = await supabase
    .from("tracking_events")
    .select("created_at")
    .eq("shipment_id", shipment.id)
    .eq("source", "maersk")
    .order("event_datetime", { ascending: false })
    .limit(1);

  const newest = cachedEvents?.[0];
  const cacheAge = newest
    ? (Date.now() - new Date(newest.created_at).getTime()) / 60000
    : Infinity;

  if (cacheAge >= CACHE_TTL_MINUTES) {
    try {
      const maerskEvents = await getMaerskEvents({
        carrierBookingReference: shipment.maersk_carrier_booking_reference,
        transportDocumentReference: shipment.maersk_transport_document_reference,
        equipmentReference: shipment.maersk_equipment_reference,
      });

      if (maerskEvents && maerskEvents.length > 0) {
        // Delete old Maersk events and insert fresh ones
        await supabase
          .from("tracking_events")
          .delete()
          .eq("shipment_id", shipment.id)
          .eq("source", "maersk");

        const { error: insertError } = await supabase
          .from("tracking_events")
          .insert(
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

        if (insertError) {
          console.error("Failed to insert cached Maersk events:", insertError.message);
        }

        // Calculate the status based on events
        const derivedStatus = determineShipmentStatus(maerskEvents);

        // Fetch current status to check for updates and notifications
        const { data: currentShipment } = await supabase
          .from("shipments")
          .select("status, customer_id, stc_tracking_number")
          .eq("id", shipment.id)
          .single();

        if (currentShipment && currentShipment.status !== derivedStatus) {
          // Update database status
          await supabase
            .from("shipments")
            .update({ status: derivedStatus })
            .eq("id", shipment.id);

          console.log(`Auto-updated shipment ${currentShipment.stc_tracking_number} status to ${derivedStatus}`);

          // Trigger email notification for status change
          try {
            const { data: customerProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", currentShipment.customer_id)
              .single();

            const { data: authUser } = await supabase.auth.admin.getUserById(currentShipment.customer_id);

            if (authUser?.user?.email) {
              const { notifyShipmentStatusChanged } = require("@/lib/resend");
              await notifyShipmentStatusChanged(
                authUser.user.email,
                customerProfile?.full_name ?? "",
                currentShipment.stc_tracking_number,
                derivedStatus
              );
            }
          } catch (notifyErr) {
            console.error("Failed to notify user about auto status update:", notifyErr);
          }
        }
      }
    } catch (err) {
      console.error("Maersk API sync error in utility:", err);
    }
  }
}
