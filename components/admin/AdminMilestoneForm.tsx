"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";

export default function AdminMilestoneForm({ shipmentId }: { shipmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    description: "",
    location: "",
    event_type: "UPDATE",
    event_datetime: new Date().toISOString().slice(0, 16),
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await fetch(`/api/admin/shipments/${shipmentId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          event_datetime: new Date(form.event_datetime).toISOString(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setForm((prev) => ({ ...prev, description: "", location: "" }));
      } else {
        const json = await res.json();
        setError(json.error ?? "Failed to add milestone.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">Event Type</label>
          <select name="event_type" value={form.event_type} onChange={handleChange} className="input text-sm py-2">
            <option value="UPDATE">General Update</option>
            <option value="DEPARTED">Departed</option>
            <option value="ARRIVED">Arrived</option>
            <option value="CUSTOMS_CLEARED">Customs Cleared</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="EXCEPTION">Exception</option>
          </select>
        </div>
        <div>
          <label className="label text-xs">Date & Time</label>
          <input type="datetime-local" name="event_datetime" value={form.event_datetime} onChange={handleChange} className="input text-sm py-2" />
        </div>
      </div>
      <div>
        <label className="label text-xs">Description <span className="text-red-400">*</span></label>
        <input type="text" name="description" value={form.description} onChange={handleChange} className="input text-sm py-2" placeholder="e.g. Shipment departed Guangzhou port" required />
      </div>
      <div>
        <label className="label text-xs">Location</label>
        <input type="text" name="location" value={form.location} onChange={handleChange} className="input text-sm py-2" placeholder="e.g. Guangzhou, China" />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-emerald-400 text-xs">Milestone added successfully.</p>}
      <button type="submit" disabled={isPending} className="btn-primary text-xs py-2 px-3">
        {isPending ? <><Loader2 className="w-3 h-3 animate-spin" /> Adding…</> : <><Plus className="w-3 h-3" /> Add Milestone</>}
      </button>
    </form>
  );
}
