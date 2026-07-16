"use client";

import { useState, useEffect, Suspense } from "react";
import { Search, Loader2, Package2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import { ShipmentStatus } from "@/lib/types";
import SiteNav from "@/components/SiteNav";

interface TrackingResult {
  shipment: {
    stc_tracking_number: string;
    mode: string;
    destination_country: string;
    status: ShipmentStatus;
    estimated_delivery_date: string | null;
  };
  events: {
    id: string;
    source: "maersk" | "manual";
    event_type: string | null;
    description: string | null;
    location: string | null;
    event_datetime: string | null;
    shipment_id: string;
    raw_payload: Record<string, unknown> | null;
    created_at: string;
  }[];
  source: "cache" | "live" | "manual";
  tracking_sync:
    | { status: "skipped" | "cache" }
    | { status: "synced"; eventCount: number }
    | { status: "not_found_or_unauthorized" | "error"; message: string };
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function triggerTrack(trackingCode: string) {
    const trimmed = trackingCode.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(trimmed)}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Tracking number not found. Please check and try again.");
        setLoading(false);
        return;
      }

      setResult(json);
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching tracking details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    await triggerTrack(query);
  }

  // Auto-run search if 'q' search param is present
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      triggerTrack(q);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav />

      <div className="page-container py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="section-heading mb-3">Track Your Shipment</h1>
            <p className="text-slate-600">
              Enter your STC tracking number to get real-time updates on your cargo.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleTrack} className="relative mb-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  id="tracking-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input pl-12 text-base h-14 font-mono"
                  placeholder="e.g. STC23586765"
                  autoCapitalize="characters"
                  autoCorrect="off"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-primary px-6 h-14"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Track"
                )}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="card p-4 border-red-500/20 bg-red-50 text-red-650 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {(result.tracking_sync.status === "not_found_or_unauthorized" ||
                result.tracking_sync.status === "error" ||
                (result.tracking_sync.status === "synced" && result.tracking_sync.eventCount === 0)) && (
                <div className="card p-4 border-amber-500/20 bg-amber-50 text-amber-800 text-sm">
                  {result.tracking_sync.status === "not_found_or_unauthorized"
                    ? "Live Maersk tracking is unavailable because this shipment reference was not found or is not authorized for our Maersk account."
                    : result.tracking_sync.status === "error"
                      ? "Live Maersk tracking could not be refreshed right now."
                      : "Maersk returned no live tracking events for this shipment."}
                </div>
              )}
              {/* Shipment summary */}
              <div className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      Tracking Number
                    </p>
                    <p className="text-xl font-mono font-bold text-slate-900">
                      {result.shipment.stc_tracking_number}
                    </p>
                  </div>
                  <span className={`badge-${result.shipment.status} text-sm px-3 py-1.5`}>
                    {result.shipment.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-650">
                  <span>
                    <span className="text-slate-900 font-medium capitalize">{result.shipment.mode}</span>{" "}
                    Freight
                  </span>
                  <span>→ {result.shipment.destination_country}</span>
                  {result.shipment.estimated_delivery_date && (
                    <span>
                      ETA:{" "}
                      <span className="text-slate-900">
                        {new Date(result.shipment.estimated_delivery_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="card p-5">
                <TrackingTimeline
                  events={result.events}
                  shipmentStatus={result.shipment.status}
                />
              </div>

              <p className="text-center text-xs text-slate-600">
                Need help?{" "}
                <Link href="/#contact" className="text-brand-600 hover:underline">
                  Contact our team
                </Link>
              </p>
            </div>
          )}

          {/* Empty state prompt */}
          {!result && !error && !loading && (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Package2 className="w-8 h-8 mx-auto mb-3 text-slate-400" />
              Your tracking information will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
