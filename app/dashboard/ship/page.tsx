"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plane, Ship, Package, CheckSquare, Square, MapPin, AlertCircle, Plus, User, Phone } from "lucide-react";
import { Parcel, ReceiverAddress } from "@/lib/types";
import Link from "next/link";

export default function ShipNowPage() {
  const router = useRouter();
  const supabase = createClient();

  const [arrivedParcels, setArrivedParcels] = useState<Parcel[]>([]);
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);
  const [mode, setMode] = useState<"air" | "sea">("sea");
  const [receiverAddresses, setReceiverAddresses] = useState<ReceiverAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [parcelsRes, addressesRes] = await Promise.all([
        supabase
          .from("parcels")
          .select("*")
          .eq("customer_id", user.id)
          .eq("status", "arrived")
          .is("submitted_for_shipping", false)
          .order("arrived_at", { ascending: false }),
        supabase
          .from("receiver_addresses")
          .select("*")
          .eq("customer_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      setArrivedParcels(parcelsRes.data ?? []);
      
      const addresses = addressesRes.data ?? [];
      setReceiverAddresses(addresses);
      
      if (addresses.length > 0) {
        const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
        setSelectedAddressId(defaultAddr.id);
      }
      
      setFetching(false);
    }
    loadData();
  }, [router, supabase]);

  function toggleParcel(parcel: Parcel) {
    if (!parcel.item_description || !parcel.declared_value) return;
    setSelectedParcels((prev) =>
      prev.includes(parcel.id) ? prev.filter((p) => p !== parcel.id) : [...prev, parcel.id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedParcels.length === 0) {
      setError("Please select at least one parcel.");
      return;
    }
    if (!selectedAddressId) {
      setError("Please select a receiver address.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/parcels/batch-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcel_ids: selectedParcels,
        shipping_mode: mode,
        receiver_address_id: selectedAddressId,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Failed to submit parcels for shipping.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/parcels");
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
        <h1 className="text-2xl font-display font-bold text-slate-900">Submit Parcels for Shipping</h1>
        <p className="text-slate-500 text-sm mt-1">
          Select arrived parcels to submit for international shipping.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parcel selection */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Select Parcels ({selectedParcels.length} selected)
          </h2>
          {arrivedParcels.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-slate-450 mx-auto mb-2" />
              <p className="text-slate-555 text-sm">No parcels marked as arrived yet.</p>
              <p className="text-slate-500 text-xs mt-1">
                Wait for warehouse staff to confirm receipt.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {arrivedParcels.map((parcel) => {
                const selected = selectedParcels.includes(parcel.id);
                const isMissingDetails = !parcel.item_description || !parcel.declared_value;
                return (
                  <div
                    key={parcel.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isMissingDetails
                        ? "border-slate-100 bg-slate-50/50 opacity-70"
                        : selected
                        ? "border-brand-500/50 bg-brand-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {!isMissingDetails ? (
                      <button
                        type="button"
                        onClick={() => toggleParcel(parcel)}
                        className="p-1 rounded hover:bg-slate-100 shrink-0"
                      >
                        {selected ? (
                          <CheckSquare className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                    ) : (
                      <div className="p-1 shrink-0 text-red-500" title="Missing details">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-slate-900">{parcel.local_tracking_number}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {parcel.item_description ?? "No description (details missing)"} · Qty: {parcel.quantity}
                      </p>
                      {isMissingDetails && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1.5">
                          <span>Please fill item details first:</span>
                          <Link
                            href={`/dashboard/parcels/${parcel.id}`}
                            className="underline font-bold text-blue-600 hover:text-blue-700"
                          >
                            Fill details →
                          </Link>
                        </p>
                      )}
                    </div>
                    {parcel.weight_kg && (
                      <span className="text-xs text-slate-550">{parcel.weight_kg}kg</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shipment mode */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Freight Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["sea", "air"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  mode === m
                    ? "border-brand-500/50 bg-brand-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {m === "sea" ? (
                  <Ship className={`w-5 h-5 ${mode === m ? "text-brand-600" : "text-slate-500"}`} />
                ) : (
                  <Plane className={`w-5 h-5 ${mode === m ? "text-brand-600" : "text-slate-500"}`} />
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    {m === "sea" ? "Sea Freight" : "Air Freight"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {m === "sea" ? "25–40 days · Cheaper" : "7–12 days · Faster"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Destination Address Selection */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-slate-900">Receiver Address</h2>
            <Link
              href="/dashboard/receiver-addresses"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </Link>
          </div>

          {receiverAddresses.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">No receiver addresses found!</span>
              </div>
              <p>You must add at least one receiver address outside China before requesting a shipment.</p>
              <Link
                href="/dashboard/receiver-addresses"
                className="btn bg-white hover:bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 inline-block mt-1 font-sans"
              >
                Create Address Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="input font-sans text-sm w-full"
                required
              >
                <option value="">Select receiver address…</option>
                {receiverAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label} — {addr.full_name} ({addr.country})
                  </option>
                ))}
              </select>

              {/* Show selected address preview */}
              {(() => {
                const selectedAddr = receiverAddresses.find((a) => a.id === selectedAddressId);
                if (!selectedAddr) return null;
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Recipient: {selectedAddr.full_name}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Phone: {selectedAddr.phone}
                    </p>
                    <p className="flex items-center gap-1.5 font-sans leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      Address: {selectedAddr.address}, {selectedAddr.country}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || selectedParcels.length === 0 || arrivedParcels.length === 0}
          className="btn-primary w-full justify-center text-sm font-semibold rounded-xl py-2.5"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            <>Submit for Shipping</>
          )}
        </button>
      </form>
    </div>
  );
}
