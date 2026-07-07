"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSTCTrackingNumber } from "@/lib/tracking-utils";
import { Loader2, Ship, Check, ShieldCheck } from "lucide-react";

interface MaerskBooking {
  id: string;
  stc_tracking_number: string;
  mode: string;
  destination_country: string;
  maersk_carrier_booking_reference: string | null;
  maersk_transport_document_reference: string | null;
  maersk_equipment_reference: string | null;
}

export default function AdminAssignMaerskForm({
  shipmentId,
  currentTrackingNumber,
  maerskBookings,
}: {
  shipmentId: string;
  currentTrackingNumber: string;
  maerskBookings: MaerskBooking[];
}) {
  const router = useRouter();
  const supabase = createClient();
  
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBookingId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const selected = maerskBookings.find((b) => b.id === selectedBookingId);
      if (!selected) {
        setError("Selected Maersk booking not found.");
        setLoading(false);
        return;
      }

      const updateFields: any = {
        maersk_carrier_booking_reference: selected.maersk_carrier_booking_reference,
        maersk_transport_document_reference: selected.maersk_transport_document_reference,
        maersk_equipment_reference: selected.maersk_equipment_reference,
        status: "booked",
      };

      // Auto-generate STC tracking number in new format if current one is old
      if (!/^STC\d{8}$/.test(currentTrackingNumber)) {
        const newTracking = await generateSTCTrackingNumber(supabase);
        updateFields.stc_tracking_number = newTracking;
        console.log(`Regenerated tracking number to new format: ${newTracking}`);
      }

      const { error: updateError } = await supabase
        .from("shipments")
        .update(updateFields)
        .eq("id", shipmentId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to assign Maersk booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAssign} className="space-y-4">
      <div>
        <label className="label text-slate-700">Select Maersk Master Booking</label>
        <select
          value={selectedBookingId}
          onChange={(e) => setSelectedBookingId(e.target.value)}
          className="input text-sm font-sans"
          required
          disabled={loading}
        >
          <option value="">Select a registered Maersk booking…</option>
          {maerskBookings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.stc_tracking_number} ({b.mode === "sea" ? "Sea" : "Air"} · {b.destination_country})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-650 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Assigned to Maersk booking successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedBookingId}
        className="btn bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg py-2 px-4 flex items-center gap-1.5 justify-center w-full sm:w-auto"
      >
        {loading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Assigning…</>
        ) : (
          <><Check className="w-3.5 h-3.5" /> Assign to Booking</>
        )}
      </button>
    </form>
  );
}
