"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plane, Ship, Package, CheckSquare, Square } from "lucide-react";
import { Parcel } from "@/lib/types";

const AFRICA_COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Tanzania", "Uganda", "Ethiopia", "Zambia",
  "Zimbabwe", "South Africa", "Cameroon", "Côte d'Ivoire", "Senegal",
  "Rwanda", "Mozambique", "Angola", "DR Congo", "Somalia", "Sudan",
  "Other",
];

export default function NewShipmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [arrivedParcels, setArrivedParcels] = useState<Parcel[]>([]);
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);
  const [mode, setMode] = useState<"air" | "sea">("sea");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadParcels() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("parcels")
        .select("*")
        .eq("customer_id", user.id)
        .eq("status", "arrived")
        .order("arrived_at", { ascending: false });

      setArrivedParcels(data ?? []);
      setFetching(false);
    }
    loadParcels();
  }, []);

  function toggleParcel(id: string) {
    setSelectedParcels((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedParcels.length === 0) {
      setError("Please select at least one parcel.");
      return;
    }
    if (!destination) {
      setError("Please select a destination country.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parcel_ids: selectedParcels, mode, destination_country: destination }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Failed to create shipment.");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/shipments/${json.shipment_id}`);
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Request Shipment</h1>
        <p className="text-slate-400 text-sm mt-1">
          Select arrived parcels to ship together to Africa.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parcel selection */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            Select Parcels ({selectedParcels.length} selected)
          </h2>
          {arrivedParcels.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No parcels marked as arrived yet.</p>
              <p className="text-slate-500 text-xs mt-1">
                Wait for warehouse staff to confirm receipt.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {arrivedParcels.map((parcel) => {
                const selected = selectedParcels.includes(parcel.id);
                return (
                  <button
                    key={parcel.id}
                    type="button"
                    onClick={() => toggleParcel(parcel.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selected
                        ? "border-brand-500/50 bg-brand-500/10"
                        : "border-white/8 bg-white/3 hover:bg-white/6"
                    }`}
                  >
                    {selected ? (
                      <CheckSquare className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-white">{parcel.local_tracking_number}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {parcel.item_description ?? "No description"} · Qty: {parcel.quantity}
                      </p>
                    </div>
                    {parcel.weight_kg && (
                      <span className="text-xs text-slate-400">{parcel.weight_kg}kg</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Shipment mode */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Freight Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["sea", "air"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  mode === m
                    ? "border-brand-500/50 bg-brand-500/10"
                    : "border-white/8 bg-white/3 hover:bg-white/6"
                }`}
              >
                {m === "sea" ? (
                  <Ship className={`w-5 h-5 ${mode === m ? "text-brand-400" : "text-slate-400"}`} />
                ) : (
                  <Plane className={`w-5 h-5 ${mode === m ? "text-brand-400" : "text-slate-400"}`} />
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">
                    {m === "sea" ? "Sea Freight" : "Air Freight"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {m === "sea" ? "25–40 days · Cheaper" : "7–12 days · Faster"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Destination */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Destination Country</h2>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input"
            required
          >
            <option value="">Select country…</option>
            {AFRICA_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || selectedParcels.length === 0 || arrivedParcels.length === 0}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting request…</>
          ) : (
            <>Submit Shipment Request</>
          )}
        </button>
      </form>
    </div>
  );
}
