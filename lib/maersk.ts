/**
 * Maersk Track & Trace API integration
 * DCSA Track & Trace Events API v1.5.0 (GET /events)
 * OAuth2 Client Credentials + Consumer-Key header
 *
 * All calls are server-side only — credentials never reach the browser.
 */

interface MaerskTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface MaerskEventLocation {
  locationName?: string;
  UNLocationCode?: string;
  carrierVoyageNumber?: string;
}

export interface MaerskEvent {
  eventID: string;
  eventType: string;
  eventDateTime: string;
  eventDescription?: string;
  location?: MaerskEventLocation;
  vesselName?: string;
  carrierVoyageNumber?: string;
  [key: string]: unknown;
}

interface MaerskQueryParams {
  carrierBookingReference?: string | null;
  transportDocumentReference?: string | null;
  equipmentReference?: string | null;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getMaerskToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const tokenUrl =
    process.env.MAERSK_TOKEN_URL ??
    "https://api.maersk.com/oauth2/access_token";

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.MAERSK_CLIENT_ID ?? "",
    client_secret: process.env.MAERSK_CONSUMER_SECRET ?? "",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Consumer-Key": process.env.MAERSK_CONSUMER_KEY ?? "",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Maersk token request failed: ${res.status} — ${text}`);
  }

  const data: MaerskTokenResponse = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // 1 min buffer
  };

  return data.access_token;
}

export async function getMaerskEvents(
  refs: MaerskQueryParams
): Promise<MaerskEvent[]> {
  const token = await getMaerskToken();

  const baseUrl =
    process.env.MAERSK_API_BASE_URL ??
    "https://api.maersk.com/track-and-trace-private";

  const qs = new URLSearchParams({
    eventType: "SHIPMENT,TRANSPORT,EQUIPMENT",
  });

  if (refs.carrierBookingReference) {
    qs.set("carrierBookingReference", refs.carrierBookingReference);
  } else if (refs.transportDocumentReference) {
    qs.set("transportDocumentReference", refs.transportDocumentReference);
  } else if (refs.equipmentReference) {
    qs.set("equipmentReference", refs.equipmentReference);
  } else {
    return [];
  }

  const res = await fetch(`${baseUrl}/events?${qs.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Consumer-Key": process.env.MAERSK_CONSUMER_KEY ?? "",
      Accept: "application/json",
    },
    next: { revalidate: 0 }, // never cache at fetch level — we cache in Supabase
  });

  if (res.status === 404) {
    // Shipment not found on Maersk for this Consumer Key — expected for non-STC bookings
    return [];
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Maersk events API error: ${res.status} — ${text}`);
  }

  const data = await res.json();
  return data as MaerskEvent[];
}
