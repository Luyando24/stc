"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Phone, Globe, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface DeliveryAddressFormProps {
  initialCountry: string | null;
  initialPhone: string | null;
  initialAddress: string | null;
  userId: string;
}

export function DeliveryAddressForm({
  initialCountry,
  initialPhone,
  initialAddress,
  userId,
}: DeliveryAddressFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [country, setCountry] = useState(initialCountry ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [address, setAddress] = useState(initialAddress ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          country: country || null,
          phone: phone || null,
          delivery_address: address || null,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update delivery address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="card p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-600" />
          Your Delivery Address (Outside China)
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Provide your destination details so we can forward your shipments to you.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Country */}
        <div className="space-y-1.5">
          <label htmlFor="country" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Destination Country
          </label>
          <input
            id="country"
            type="text"
            placeholder="e.g. Zambia"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input font-sans text-sm w-full"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            Contact Phone Number
          </label>
          <input
            id="phone"
            type="text"
            placeholder="e.g. +260 97 1234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input font-sans text-sm w-full"
            required
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label htmlFor="address" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          Detailed Delivery Address
        </label>
        <textarea
          id="address"
          rows={3}
          placeholder="e.g. 123 Independence Avenue, Lusaka"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input font-sans text-sm w-full min-h-[80px]"
          required
        />
      </div>

      {/* Message feedback */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-750 text-xs rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Delivery address saved successfully!</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary py-2 px-4 flex items-center gap-2 rounded-xl text-sm font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Address...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Address
            </>
          )}
        </button>
      </div>
    </form>
  );
}
