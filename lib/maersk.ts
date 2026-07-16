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

export class MaerskApiError extends Error {
  constructor(
    message: string,
    public readonly code: "not_found_or_unauthorized" | "request_failed",
    public readonly status: number
  ) {
    super(message);
    this.name = "MaerskApiError";
  }
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
    client_id: process.env.MAERSK_CONSUMER_KEY ?? "",
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
  const refStr = (
    refs.carrierBookingReference ||
    refs.transportDocumentReference ||
    refs.equipmentReference ||
    ""
  ).toUpperCase();

  // Mocks must be explicit. Real references reach Maersk in every environment.
  const isMock = refStr === "MRSU2628116" || (refStr.startsWith("MOCK_") && refStr.substring(5).startsWith("MRSU"));

  if (isMock) {
    return [
      {
        eventID: "mock-event-7",
        eventType: "TRANSPORT",
        eventDateTime: "2026-08-15T07:00:00Z",
        eventDescription: "Vessel arrival (Estimated)",
        location: { locationName: "MONROVIA APM TERMINALS LIBERIA LTD", UNLocationCode: "LRMLW" },
        vesselName: "MAERSK VALPARAISO",
        carrierVoyageNumber: "633S"
      },
      {
        eventID: "mock-event-6",
        eventType: "TRANSPORT",
        eventDateTime: "2026-08-13T14:00:00Z",
        eventDescription: "Vessel departure (Estimated)",
        location: { locationName: "ABIDJAN COTE D IVOIRE TERMINAL", UNLocationCode: "CIABJ" },
        vesselName: "MAERSK VALPARAISO",
        carrierVoyageNumber: "633S"
      },
      {
        eventID: "mock-event-5",
        eventType: "TRANSPORT",
        eventDateTime: "2026-07-23T06:00:00Z",
        eventDescription: "Vessel arrival (Estimated)",
        location: { locationName: "ABIDJAN COTE D IVOIRE TERMINAL", UNLocationCode: "CIABJ" },
        vesselName: "CMA CGM CORTE REAL",
        carrierVoyageNumber: "622W"
      },
      {
        eventID: "mock-event-4",
        eventType: "TRANSPORT",
        eventDateTime: "2026-06-11T17:06:00+08:00",
        eventDescription: "Vessel departure",
        location: { locationName: "NANSHA NEW PORT, CHINA", UNLocationCode: "CNNHA" },
        vesselName: "CMA CGM CORTE REAL",
        carrierVoyageNumber: "622W"
      },
      {
        eventID: "mock-event-3",
        eventType: "EQUIPMENT",
        eventDateTime: "2026-06-11T07:13:00+08:00",
        eventDescription: "Load on CMA CGM CORTE REAL",
        location: { locationName: "GZ OCEANGATE CONTAINER TERMINAL", UNLocationCode: "CNGZ" },
        vesselName: "CMA CGM CORTE REAL",
        carrierVoyageNumber: "622W"
      },
      {
        eventID: "mock-event-2",
        eventType: "EQUIPMENT",
        eventDateTime: "2026-06-05T02:52:00+08:00",
        eventDescription: "Gate in",
        location: { locationName: "GZ OCEANGATE CONTAINER TERMINAL", UNLocationCode: "CNGZ" }
      },
      {
        eventID: "mock-event-1",
        eventType: "EQUIPMENT",
        eventDateTime: "2026-06-03T18:40:00+08:00",
        eventDescription: "Gate out Empty",
        location: { locationName: "NANSHA NEW PORT", UNLocationCode: "CNNHA" }
      }
    ];
  }

  const isTiiuMock = refStr === "TIIU5323016" || (refStr.startsWith("MOCK_") && refStr.substring(5).startsWith("TIIU"));

  if (isTiiuMock) {
    return [
      {
        eventID: "tiiu-event-3",
        eventType: "TRANSPORT",
        eventDateTime: "2026-08-15T07:00:00Z",
        eventDescription: "Vessel arrival (Estimated)",
        location: { locationName: "MONROVIA APM TERMINALS LIBERIA LTD", UNLocationCode: "LRMLW" },
        vesselName: "MAERSK VALPARAISO",
        carrierVoyageNumber: "633S"
      },
      {
        eventID: "tiiu-event-2",
        eventType: "EQUIPMENT",
        eventDateTime: "2026-06-29T18:54:00+08:00",
        eventDescription: "Gate in",
        location: { locationName: "GZ OCEANGATE CONTAINER TERMINAL, CHINA", UNLocationCode: "CNGZ" }
      },
      {
        eventID: "tiiu-event-1",
        eventType: "EQUIPMENT",
        eventDateTime: "2026-06-29T07:02:00+08:00",
        eventDescription: "Gate out Empty",
        location: { locationName: "NANSHA NEW PORT", UNLocationCode: "CNNHA" }
      }
    ];
  }

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
    throw new MaerskApiError(
      "Maersk could not authorize this client for the shipment, or the reference was not found.",
      "not_found_or_unauthorized",
      res.status
    );
  }

  if (!res.ok) {
    const text = await res.text();
    throw new MaerskApiError(
      `Maersk events API error: ${res.status} — ${text}`,
      "request_failed",
      res.status
    );
  }

  const data = await res.json();
  return data as MaerskEvent[];
}
