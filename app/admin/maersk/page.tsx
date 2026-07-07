"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Ship, Plane, Plus, MapPin, Calendar, Anchor, ShieldCheck } from "lucide-react";

const AFRICA_COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Tanzania", "Uganda", "Ethiopia", "Zambia",
  "Zimbabwe", "South Africa", "Cameroon", "Côte d'Ivoire", "Senegal",
  "Rwanda", "Mozambique", "Angola", "DR Congo", "Somalia", "Sudan", "Liberia", "Other",
];

export default function AdminMaerskBookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  
  // Form state
  const [trackingRef, setTrackingRef] = useState("");
  const [refType, setRefType] = useState<"equipment" | "booking" | "transport_document">("equipment");
  const [mode, setMode] = useState<"sea" | "air">("sea");
  const [destination, setDestination] = useState("");
  const [eta, setEta] = useState("");
  const [notes, setNotes] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [fetchInfo, setFetchInfo] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setFetching(true);
    // Query shipments belonging to admin users
    const { data, error } = await supabase
      .from("shipments")
      .select("*, profiles!inner(role, full_name)")
      .eq("profiles.role", "admin")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setFetching(false);
  }

  async function fetchMaerskDetails() {
    if (!trackingRef) return;
    setFetchingDetails(true);
    setError(null);
    setFetchInfo(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/maersk/fetch?ref=${encodeURIComponent(trackingRef.trim())}&type=${refType}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch details from Maersk.");
      }

      if (data.destination_country) {
        setDestination(data.destination_country);
      }
      if (data.estimated_delivery_date) {
        setEta(data.estimated_delivery_date);
      }

      setFetchInfo(`Successfully fetched details! Destination: ${data.destination_country || "Other"}, ETA: ${data.estimated_delivery_date || "Unknown"}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch details from Maersk.");
    } finally {
      setFetchingDetails(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingRef || !destination) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in as an admin.");
        setLoading(false);
        return;
      }

      // Check if tracking number is unique in shipments table
      const { data: existing } = await supabase
        .from("shipments")
        .select("id")
        .eq("stc_tracking_number", trackingRef.toUpperCase())
        .maybeSingle();

      if (existing) {
        setError(`A shipment or booking with reference "${trackingRef.toUpperCase()}" is already registered.`);
        setLoading(false);
        return;
      }

      const insertData: any = {
        customer_id: user.id,
        stc_tracking_number: trackingRef.toUpperCase(),
        mode,
        destination_country: destination,
        status: "booked",
        estimated_delivery_date: eta || null,
        notes: notes || null,
      };

      if (refType === "equipment") {
        insertData.maersk_equipment_reference = trackingRef.toUpperCase();
      } else if (refType === "booking") {
        insertData.maersk_carrier_booking_reference = trackingRef.toUpperCase();
      } else {
        insertData.maersk_transport_document_reference = trackingRef.toUpperCase();
      }

      const { error: insertError } = await supabase
        .from("shipments")
        .insert(insertData);

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setTrackingRef("");
      setNotes("");
      loadBookings();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to register Maersk booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: List bookings */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Maersk Master Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Registered master tracking references from Maersk. Customers can be linked to these.
          </p>
        </div>

        <div className="card overflow-hidden">
          {fetching ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm bg-white">
              No registered Maersk bookings yet. Use the registration form to add one.
            </div>
          ) : (
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Tracking Ref</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Mode</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Destination</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => {
                    let typeLabel = "Container";
                    if (b.maersk_carrier_booking_reference) typeLabel = "Booking Ref";
                    if (b.maersk_transport_document_reference) typeLabel = "B/L";
                    
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-900 font-semibold">{b.stc_tracking_number}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs font-medium">{typeLabel}</td>
                        <td className="px-4 py-3 text-slate-700 capitalize flex items-center gap-1.5 pt-4">
                          {b.mode === "sea" ? <Ship className="w-3.5 h-3.5 text-brand-600" /> : <Plane className="w-3.5 h-3.5 text-brand-600" />}
                          {b.mode}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{b.destination_country}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {b.estimated_delivery_date ? new Date(b.estimated_delivery_date).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Col: Register new booking */}
      <div className="card p-5 bg-white h-fit">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-600" /> Register Maersk Booking
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Maersk Tracking Number / Reference</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingRef}
                onChange={(e) => setTrackingRef(e.target.value)}
                className="input font-mono text-sm uppercase flex-1"
                placeholder="e.g. TIIU5323016"
                required
              />
              <button
                type="button"
                onClick={fetchMaerskDetails}
                disabled={fetchingDetails || !trackingRef}
                className="btn bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 font-semibold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {fetchingDetails ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Fetch Details"
                )}
              </button>
            </div>
            {fetchInfo && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1.5 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                {fetchInfo}
              </p>
            )}
          </div>

          <div>
            <label className="label">Reference Type</label>
            <select
              value={refType}
              onChange={(e) => setRefType(e.target.value as any)}
              className="input text-sm"
              required
            >
              <option value="equipment">Container Number (Equipment Ref)</option>
              <option value="booking">Carrier Booking Reference</option>
              <option value="transport_document">Transport Document (B/L)</option>
            </select>
          </div>

          <div>
            <label className="label">Freight Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("sea")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-semibold transition-all ${
                  mode === "sea"
                    ? "border-brand-500/50 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-650 hover:bg-slate-50"
                }`}
              >
                <Ship className="w-3.5 h-3.5" /> Sea Freight
              </button>
              <button
                type="button"
                onClick={() => setMode("air")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-semibold transition-all ${
                  mode === "air"
                    ? "border-brand-500/50 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-650 hover:bg-slate-50"
                }`}
              >
                <Plane className="w-3.5 h-3.5" /> Air Freight
              </button>
            </div>
          </div>

          <div>
            <label className="label">Destination Country</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input text-sm"
              required
            >
              <option value="">Select country…</option>
              {AFRICA_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Estimated Delivery (ETA)</label>
            <input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="input text-sm"
            />
          </div>

          <div>
            <label className="label">Internal Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input text-sm h-20"
              placeholder="e.g. Booking details, suppliers, or status info"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-650 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Maersk booking registered successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !trackingRef || !destination}
            className="btn-primary w-full justify-center text-sm py-2 rounded-xl"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</>
            ) : (
              "Register Booking"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
