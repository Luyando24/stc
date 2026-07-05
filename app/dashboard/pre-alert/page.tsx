"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Package, AlertTriangle } from "lucide-react";

export default function PreAlertPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    local_tracking_number: "",
    supplier_name: "",
    item_description: "",
    quantity: 1,
    declared_value: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("parcels").insert({
      customer_id: user.id,
      local_tracking_number: form.local_tracking_number.trim(),
      supplier_name: form.supplier_name.trim() || null,
      item_description: form.item_description.trim() || null,
      quantity: Number(form.quantity),
      declared_value: form.declared_value ? Number(form.declared_value) : null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="max-w-lg">
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Parcel added successfully!</h2>
          <p className="text-slate-500 text-sm mb-6">
            We&apos;ve registered your parcel. Once it arrives at our China warehouse, 
            we&apos;ll update its status to &quot;Arrived&quot;.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSuccess(false); setForm({ local_tracking_number: "", supplier_name: "", item_description: "", quantity: 1, declared_value: "" }); }}
              className="btn-secondary"
            >
              Add another
            </button>
            <button onClick={() => router.push("/dashboard/parcels")} className="btn-primary">
              View pending parcels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-900">Add Parcel</h1>
        <p className="text-slate-500 text-sm mt-1">
          Add a parcel that your supplier has dispatched to our China warehouse.
        </p>
      </div>

      <div className="card p-6">
        {/* Info banner */}
        <div className="flex gap-3 p-3 rounded-lg bg-brand-50 border border-brand-100 mb-6">
          <AlertTriangle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-brand-700">
            Make sure your supplier has written your warehouse code on the parcel or given it to the courier.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="local_tracking_number" className="label">
              China Local Tracking Number <span className="text-red-400">*</span>
            </label>
            <input
              id="local_tracking_number"
              name="local_tracking_number"
              type="text"
              value={form.local_tracking_number}
              onChange={handleChange}
              className="input font-mono"
              placeholder="e.g. SF1234567890"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              The tracking number your supplier gave you (SF Express, YTO, etc.)
            </p>
          </div>

          <div>
            <label htmlFor="supplier_name" className="label">Supplier Name</label>
            <input
              id="supplier_name"
              name="supplier_name"
              type="text"
              value={form.supplier_name}
              onChange={handleChange}
              className="input"
              placeholder="e.g. Guangzhou Trading Co."
            />
          </div>

          <div>
            <label htmlFor="item_description" className="label">Item Description</label>
            <textarea
              id="item_description"
              name="item_description"
              value={form.item_description}
              onChange={handleChange}
              className="input resize-none h-20"
              placeholder="e.g. 2x Women's shoes, 3x Phone cases"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="label">Quantity (boxes)</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="declared_value" className="label">Declared Value (USD)</label>
              <input
                id="declared_value"
                name="declared_value"
                type="number"
                min="0"
                step="0.01"
                value={form.declared_value}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
            ) : "Add Parcel"}
          </button>
        </form>
      </div>
    </div>
  );
}
