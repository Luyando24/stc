"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import Link from "next/link";
import { Parcel } from "@/lib/types";

export default function FillParcelDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const supabase = createClient();

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [form, setForm] = useState({
    item_description: "",
    quantity: 1,
    declared_value: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadParcel() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("parcels")
        .select("*")
        .eq("id", params.id)
        .eq("customer_id", user.id)
        .single();

      if (!data) {
        setError("Parcel not found or access denied.");
        setFetching(false);
        return;
      }

      setParcel(data);
      setForm({
        item_description: data.item_description ?? "",
        quantity: data.quantity ?? 1,
        declared_value: data.declared_value ? String(data.declared_value) : "",
      });
      setFetching(false);
    }
    loadParcel();
  }, [params.id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item_description || !form.declared_value) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/parcels/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_description: form.item_description,
          quantity: Number(form.quantity),
          declared_value: parseFloat(form.declared_value),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to save details.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard/parcels");
      }, 1500);
    } catch (err) {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && !parcel) {
    return (
      <div className="max-w-lg">
        <div className="card p-6 border-red-200 bg-red-50 text-red-900 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <Link
        href="/dashboard/parcels"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to parcels
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-900">Confirm Parcel Details</h1>
        <p className="text-slate-500 text-sm mt-1">
          Specify what is inside this parcel for customs and logistics declarations.
        </p>
      </div>

      <div className="card p-6 relative overflow-hidden">
        {success && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-15 text-center p-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900">Details Saved!</h3>
            <p className="text-sm text-slate-500">Returning to pending parcels...</p>
          </div>
        )}

        <div className="pb-4 mb-4 border-b border-slate-100">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">China Tracking Number</p>
          <p className="text-base font-mono font-bold text-slate-800 mt-0.5">{parcel?.local_tracking_number}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item description */}
          <div>
            <label className="label">What is inside? (Item Description)</label>
            <input
              type="text"
              required
              className="input text-sm w-full"
              placeholder="e.g. Shoes, iPhone Case, Cotton T-Shirts"
              value={form.item_description}
              onChange={(e) => setForm({ ...form, item_description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                required
                min={1}
                className="input text-sm w-full font-mono"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
              />
            </div>

            {/* Price in RMB */}
            <div>
              <label className="label">Price in RMB (Total Value)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={0.1}
                  step="0.01"
                  className="input text-sm w-full pl-8 font-mono"
                  placeholder="e.g. 150"
                  value={form.declared_value}
                  onChange={(e) => setForm({ ...form, declared_value: e.target.value })}
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-semibold font-mono">¥</span>
              </div>
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
            className="btn-primary w-full justify-center text-sm font-semibold rounded-xl py-2.5 mt-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving details…</>
            ) : (
              <>Save Details</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
