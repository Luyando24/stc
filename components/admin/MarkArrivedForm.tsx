"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Weight, Camera } from "lucide-react";
import { Parcel } from "@/lib/types";

interface MarkArrivedFormProps {
  parcel: Parcel;
}

export default function MarkArrivedForm({ parcel }: MarkArrivedFormProps) {
  const [isPending, startTransition] = useTransition();
  const [weight, setWeight] = useState(parcel.weight_kg?.toString() ?? "");
  const [dimensions, setDimensions] = useState(parcel.dimensions ?? "");
  const [notes, setNotes] = useState(parcel.notes ?? "");
  const [success, setSuccess] = useState(parcel.status === "arrived");
  const [error, setError] = useState<string | null>(null);

  async function handleMarkArrived() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/parcels/${parcel.id}/arrived`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_kg: weight ? Number(weight) : null,
          dimensions: dimensions || null,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const json = await res.json();
        setError(json.error ?? "Failed to update parcel.");
      }
    });
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm">
        <CheckCircle2 className="w-4 h-4" />
        Marked as arrived
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-white/3 rounded-xl border border-white/8">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input text-sm py-2"
            placeholder="0.0"
            step="0.1"
          />
        </div>
        <div>
          <label className="label text-xs">Dimensions (cm)</label>
          <input
            type="text"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            className="input text-sm py-2"
            placeholder="L×W×H"
          />
        </div>
      </div>
      <div>
        <label className="label text-xs">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input text-sm py-2"
          placeholder="Any notes about the parcel…"
        />
      </div>
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
      <button
        onClick={handleMarkArrived}
        disabled={isPending}
        className="btn-primary text-xs py-2 px-3"
      >
        {isPending ? (
          <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
        ) : (
          <><CheckCircle2 className="w-3 h-3" /> Mark as Arrived</>
        )}
      </button>
    </div>
  );
}
