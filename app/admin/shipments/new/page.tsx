"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Ship, Plane, CheckSquare, Square, Plus } from "lucide-react";
import { Parcel } from "@/lib/types";

const AFRICA_COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Tanzania", "Uganda", "Ethiopia", "Zambia",
  "Zimbabwe", "South Africa", "Cameroon", "Côte d'Ivoire", "Senegal",
  "Rwanda", "Mozambique", "Angola", "DR Congo", "Somalia", "Sudan", "Other",
];

export default function AdminNewShipmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [arrivedParcels, setArrivedParcels] = useState<(Parcel & { profiles: { full_name: string; warehouse_code: string } | null })[]>([]);
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);
  const [mode, setMode] = useState<"air" | "sea">("sea");
  const [destination, setDestination] = useState("");
  const [freightCost, setFreightCost] = useState("");
  const [eta, setEta] = useState("");
  const [maerskRef, setMaerskRef] = useState({ booking: "", tdRef: "", equipment: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("parcels")
      .select("*, profiles(full_name, warehouse_code)")
      .eq("status", "arrived")
      .order("arrived_at", { ascending: false })
      .then(({ data }) => {
        setArrivedParcels((data as typeof arrivedParcels) ?? []);
        setFetching(false);
      });
  }, []);

  function toggleParcel(id: string) {
    setSelectedParcels((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedParcels.length === 0 || !destination) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcel_ids: selectedParcels,
        mode,
        destination_country: destination,
        freight_cost: freightCost ? Number(freightCost) : null,
        estimated_delivery_date: eta || null,
        maersk_carrier_booking_reference: maerskRef.booking || null,
        maersk_transport_document_reference: maerskRef.tdRef || null,
        maersk_equipment_reference: maerskRef.equipment || null,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Failed to create shipment.");
      setLoading(false);
      return;
    }

    router.push(`/admin/shipments/${json.shipment_id}`);
  }

  if (fetching) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-900">Build Shipment</h1>
        <p className="text-slate-500 text-sm mt-1">Consolidate arrived parcels into a new shipment.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parcel selection */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Select Arrived Parcels ({selectedParcels.length})</h2>
          {arrivedParcels.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">No arrived parcels available.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {arrivedParcels.map((p) => {
                const selected = selectedParcels.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => toggleParcel(p.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selected ? "border-brand-500/50 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    {selected ? <CheckSquare className="w-4 h-4 text-brand-600 flex-shrink-0" /> : <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-slate-900 font-medium">{p.local_tracking_number}</p>
                      <p className="text-xs text-slate-500">
                        {p.profiles?.full_name} · <span className="font-mono">{p.profiles?.warehouse_code}</span> · {p.item_description ?? "No desc"} · Qty {p.quantity}
                      </p>
                    </div>
                    {p.weight_kg && <span className="text-xs text-slate-500">{p.weight_kg}kg</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mode + destination */}
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Freight Mode</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["sea", "air"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${mode === m ? "border-brand-500/50 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  {m === "sea" ? <Ship className="w-4 h-4 text-brand-600" /> : <Plane className="w-4 h-4 text-brand-600" />}
                  <span className="text-sm text-slate-800 font-semibold">{m === "sea" ? "Sea Freight" : "Air Freight"}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Destination Country</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="input" required>
              <option value="">Select country…</option>
              {AFRICA_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Freight Cost (USD)</label>
              <input type="number" value={freightCost} onChange={(e) => setFreightCost(e.target.value)} className="input" placeholder="0.00" step="0.01" />
            </div>
            <div>
              <label className="label">Estimated Delivery</label>
              <input type="date" value={eta} onChange={(e) => setEta(e.target.value)} className="input" />
            </div>
          </div>
        </div>

        {/* Maersk references (sea only) */}
        {mode === "sea" && (
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Maersk References (optional)</h2>
            <p className="text-xs text-slate-500">Fill in whichever reference you have from the Maersk booking.</p>
            <div>
              <label className="label">Carrier Booking Reference</label>
              <input type="text" value={maerskRef.booking} onChange={(e) => setMaerskRef((p) => ({ ...p, booking: e.target.value }))} className="input font-mono text-sm" placeholder="e.g. 123456789" />
            </div>
            <div>
              <label className="label">Transport Document Reference (B/L)</label>
              <input type="text" value={maerskRef.tdRef} onChange={(e) => setMaerskRef((p) => ({ ...p, tdRef: e.target.value }))} className="input font-mono text-sm" placeholder="e.g. MAEU1234567890" />
            </div>
            <div>
              <label className="label">Equipment Reference (Container #)</label>
              <input type="text" value={maerskRef.equipment} onChange={(e) => setMaerskRef((p) => ({ ...p, equipment: e.target.value }))} className="input font-mono text-sm" placeholder="e.g. TCKU3045656" />
            </div>
          </div>
        )}

        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <button type="submit" disabled={loading || selectedParcels.length === 0} className="btn-primary w-full justify-center">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating shipment…</> : <><Plus className="w-4 h-4" /> Create Shipment & Generate Tracking Number</>}
        </button>
      </form>
    </div>
  );
}
