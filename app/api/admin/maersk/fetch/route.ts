import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMaerskEvents } from "@/lib/maersk";
import { determineShipmentStatus } from "@/lib/tracking-utils";

// Map common country codes to dropdown values
const COUNTRY_CODE_MAP: Record<string, string> = {
  NG: "Nigeria",
  GH: "Ghana",
  KE: "Kenya",
  TZ: "Tanzania",
  UG: "Uganda",
  ET: "Ethiopia",
  ZM: "Zambia",
  ZW: "Zimbabwe",
  ZA: "South Africa",
  CM: "Cameroon",
  CI: "Côte d'Ivoire",
  SN: "Senegal",
  RW: "Rwanda",
  MZ: "Mozambique",
  AO: "Angola",
  CD: "DR Congo",
  SO: "Somalia",
  SD: "Sudan",
  LR: "Liberia",
};

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "warehouse_staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const ref = searchParams.get("ref");
  const type = searchParams.get("type") || "equipment";

  if (!ref) {
    return NextResponse.json({ error: "Reference parameter 'ref' is required." }, { status: 400 });
  }

  try {
    const queryParams: any = {};
    if (type === "equipment") {
      queryParams.equipmentReference = ref.toUpperCase();
    } else if (type === "booking") {
      queryParams.carrierBookingReference = ref.toUpperCase();
    } else {
      queryParams.transportDocumentReference = ref.toUpperCase();
    }

    const events = await getMaerskEvents(queryParams);

    if (!events || events.length === 0) {
      return NextResponse.json({ error: "No tracking events found for this reference on Maersk." }, { status: 404 });
    }

    // Sort events by datetime ascending to find the final event
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime()
    );

    // Find the latest arrival event or just the latest event overall
    const arrivalEvents = sortedEvents.filter(
      (e) => e.eventType === "TRANSPORT" && e.eventDescription?.toLowerCase().includes("arrival")
    );
    const finalEvent = arrivalEvents.length > 0 ? arrivalEvents[arrivalEvents.length - 1] : sortedEvents[sortedEvents.length - 1];

    let destinationCountry = "";
    let etaDate = "";

    // 1. Determine ETA from the latest arrival/transport event
    if (finalEvent) {
      etaDate = new Date(finalEvent.eventDateTime).toISOString().split("T")[0];
    }

    // 2. Determine Destination Country from final event location
    if (finalEvent && finalEvent.location) {
      const loc = finalEvent.location;
      
      // Try using UNLocationCode country prefix (first 2 characters)
      if (loc.UNLocationCode && loc.UNLocationCode.length >= 2) {
        const countryCode = loc.UNLocationCode.substring(0, 2).toUpperCase();
        destinationCountry = COUNTRY_CODE_MAP[countryCode] || "";
      }

      // Fallback: check locationName contents
      if (!destinationCountry && loc.locationName) {
        const locNameLower = loc.locationName.toLowerCase();
        for (const [code, name] of Object.entries(COUNTRY_CODE_MAP)) {
          if (locNameLower.includes(name.toLowerCase())) {
            destinationCountry = name;
            break;
          }
        }
        // Additional mapping for Cote d'Ivoire / Abidjan variants
        if (!destinationCountry && (locNameLower.includes("cote d'ivoire") || locNameLower.includes("côte d'ivoire") || locNameLower.includes("abidjan"))) {
          destinationCountry = "Côte d'Ivoire";
        }
      }
    }

    // Calculate derived status based on occurred events
    const derivedStatus = determineShipmentStatus(events);

    return NextResponse.json({
      destination_country: destinationCountry || "Other",
      estimated_delivery_date: etaDate || null,
      derived_status: derivedStatus,
      parsed_from: {
        event_description: finalEvent?.eventDescription || finalEvent?.eventType,
        location: finalEvent?.location?.locationName || "Unknown",
        datetime: finalEvent?.eventDateTime
      }
    });

  } catch (err: any) {
    console.error("Maersk fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch from Maersk" }, { status: 500 });
  }
}
