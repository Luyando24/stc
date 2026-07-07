import { SupabaseClient } from "@supabase/supabase-js";

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
