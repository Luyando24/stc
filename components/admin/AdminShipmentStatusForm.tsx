"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ShipmentStatus } from "@/lib/types";

const STATUSES: { value: ShipmentStatus; label: string }[] = [
  { value: "processing", label: "Processing" },
  { value: "booked", label: "Booked" },
  { value: "in_transit", label: "In Transit" },
  { value: "customs", label: "Customs" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "exception", label: "Exception" },
];

export default function AdminShipmentStatusForm({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}) {
  const [status, setStatus] = useState<ShipmentStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleUpdate() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await fetch(`/api/admin/shipments/${shipmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setSuccess(true);
      else {
        const json = await res.json();
        setError(json.error ?? "Failed to update status.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select value={status} onChange={(e) => setStatus(e.target.value as ShipmentStatus)} className="input flex-1 text-sm py-2 max-w-xs">
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button onClick={handleUpdate} disabled={isPending || status === currentStatus} className="btn-primary text-sm py-2 px-4">
        {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : "Update Status"}
      </button>
      {success && <span className="text-emerald-400 text-xs">Saved!</span>}
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
