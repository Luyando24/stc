"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Package, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminNewParcelPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    local_tracking_number: "",
    warehouse_code: "",
    supplier_name: "",
    weight_kg: "",
    dimensions: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.local_tracking_number || !form.warehouse_code) {
      setError("Tracking number and customer code are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          local_tracking_number: form.local_tracking_number,
          warehouse_code: form.warehouse_code,
          supplier_name: form.supplier_name || null,
          weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
          dimensions: form.dimensions || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to add parcel.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg">
        <div className="card p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">Parcel Added Successfully</h2>
            <p className="text-slate-500 text-sm mt-1">
              The parcel has been registered and is now visible on the customer&apos;s dashboard.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  local_tracking_number: "",
                  warehouse_code: "",
                  supplier_name: "",
                  weight_kg: "",
                  dimensions: "",
                });
              }}
              className="btn-secondary"
            >
              Add another
            </button>
            <button onClick={() => router.push("/admin/parcels")} className="btn-primary">
              Back to list
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <Link
        href="/admin/parcels"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to parcels
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-900">Add Customer Parcel</h1>
        <p className="text-slate-500 text-sm mt-1">
          Register a new incoming parcel under a customer&apos;s 4-digit code.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tracking */}
          <div>
            <label className="label">Local Tracking Number (China)</label>
            <input
              type="text"
              required
              className="input font-mono text-sm w-full"
              placeholder="e.g. 78729127810"
              value={form.local_tracking_number}
              onChange={(e) => setForm({ ...form, local_tracking_number: e.target.value })}
            />
          </div>

          {/* Customer Code */}
          <div>
            <label className="label">Customer Warehouse Code (4 Digits)</label>
            <input
              type="text"
              required
              maxLength={4}
              className="input font-mono text-sm w-full"
              placeholder="e.g. 2681"
              value={form.warehouse_code}
              onChange={(e) => setForm({ ...form, warehouse_code: e.target.value.replace(/\D/g, "") })}
            />
            <p className="text-[11px] text-slate-400 mt-1 font-sans">
              Enter the 4-digit ID from the shipping label Consignee name or Address suffix.
            </p>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="label">Supplier Name (Optional)</label>
            <input
              type="text"
              className="input text-sm w-full"
              placeholder="e.g. Taobao Seller"
              value={form.supplier_name}
              onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
            />
          </div>

          {/* Weight & Dimensions Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Weight (kg) (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input text-sm w-full"
                placeholder="e.g. 1.25"
                value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Dimensions (Optional)</label>
              <input
                type="text"
                className="input text-sm w-full"
                placeholder="e.g. 30x20x10 cm"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center text-sm font-semibold rounded-xl py-2.5"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Adding parcel…</>
            ) : (
              <>Add Parcel</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
