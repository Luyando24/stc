"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ReceiverAddress } from "@/lib/types";
import {
  MapPin,
  Phone,
  User,
  Plus,
  Trash2,
  Loader2,
  Globe,
  Check,
  AlertCircle,
  Building,
  ArrowLeft,
  Star,
  Map,
} from "lucide-react";
import Link from "next/link";

const AFRICA_COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Tanzania", "Uganda", "Ethiopia", "Zambia",
  "Zimbabwe", "South Africa", "Cameroon", "Côte d'Ivoire", "Senegal",
  "Rwanda", "Mozambique", "Angola", "DR Congo", "Somalia", "Sudan",
  "Liberia", "Other",
];

export default function ReceiverAddressesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [addresses, setAddresses] = useState<ReceiverAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadAddresses() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from("receiver_addresses")
        .select("*")
        .eq("customer_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (!fetchError) {
        setAddresses(data ?? []);
      }
      setLoading(false);
    }
    loadAddresses();
  }, [router, supabase]);

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // If setting as default, unset others first
      if (isDefault) {
        await supabase
          .from("receiver_addresses")
          .update({ is_default: false })
          .eq("customer_id", userId);
      }

      // If this is the first address, force it to be default
      const shouldBeDefault = addresses.length === 0 ? true : isDefault;

      const { data, error: insertError } = await supabase
        .from("receiver_addresses")
        .insert({
          customer_id: userId,
          label: label || "Home",
          full_name: fullName,
          phone,
          country,
          address,
          is_default: shouldBeDefault,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update state
      let updatedList = [...addresses];
      if (shouldBeDefault) {
        updatedList = updatedList.map((a) => ({ ...a, is_default: false }));
      }
      updatedList.unshift(data);
      setAddresses(updatedList);

      // Reset form
      setLabel("");
      setFullName("");
      setPhone("");
      setCountry("");
      setAddress("");
      setIsDefault(false);
      setShowAddForm(false);
      setSuccess("Address added successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to add address.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: deleteError } = await supabase
        .from("receiver_addresses")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      const deletedAddress = addresses.find((a) => a.id === id);
      const updatedList = addresses.filter((a) => a.id !== id);

      // If we deleted the default address and have others, make the first one default
      if (deletedAddress?.is_default && updatedList.length > 0) {
        const firstId = updatedList[0].id;
        const { error: updateError } = await supabase
          .from("receiver_addresses")
          .update({ is_default: true })
          .eq("id", firstId);

        if (!updateError) {
          updatedList[0].is_default = true;
        }
      }

      setAddresses(updatedList);
      setSuccess("Address deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete address.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSetDefault(id: string) {
    if (!userId) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Unset all first
      await supabase
        .from("receiver_addresses")
        .update({ is_default: false })
        .eq("customer_id", userId);

      // Set this one as default
      const { error: updateError } = await supabase
        .from("receiver_addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (updateError) throw updateError;

      setAddresses(
        addresses.map((a) => ({
          ...a,
          is_default: a.id === id,
        })).sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      );
      setSuccess("Default address updated!");
    } catch (err: any) {
      setError(err.message || "Failed to set default address.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-slate-600 transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Map className="w-6 h-6 text-brand-600" />
              Receiver Addresses
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Manage your destination addresses for shipping outside China.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null);
            setSuccess(null);
          }}
          className="btn-primary py-2 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-medium shrink-0"
        >
          {showAddForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Address</>}
        </button>
      </div>

      {/* Success/Error Feedbacks */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-750 text-xs rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Address Form Collapsible */}
      {showAddForm && (
        <form onSubmit={handleAddAddress} className="card p-6 space-y-4 border-brand-200 bg-brand-50/10">
          <h2 className="text-sm font-semibold text-slate-900">New Receiver Address</h2>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Label */}
            <div className="space-y-1.5">
              <label htmlFor="label" className="text-xs font-semibold text-slate-700">
                Address Label (e.g. Home, Office)
              </label>
              <input
                id="label"
                type="text"
                placeholder="e.g. Home"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="input text-sm w-full font-sans"
                required
              />
            </div>

            {/* Receiver Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
                Receiver Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Name of recipient"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input text-sm w-full font-sans"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                Receiver Phone Number
              </label>
              <input
                id="phone"
                type="text"
                placeholder="e.g. +260 97..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input text-sm w-full font-sans"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Country */}
            <div className="space-y-1.5 sm:col-span-1">
              <label htmlFor="country" className="text-xs font-semibold text-slate-700">
                Destination Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input text-sm w-full font-sans"
                required
              >
                <option value="">Select country...</option>
                {AFRICA_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="address" className="text-xs font-semibold text-slate-700">
                Detailed Delivery Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Street address, City, State/Province"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input text-sm w-full font-sans"
                required
              />
            </div>
          </div>

          {/* Set as Default checkbox */}
          <div className="flex items-center gap-2 py-1">
            <input
              id="isDefault"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="isDefault" className="text-xs font-medium text-slate-700 select-none">
              Set as default delivery address
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn bg-white hover:bg-slate-100 border border-slate-200 py-2 px-4 rounded-xl text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary py-2 px-4 flex items-center gap-2 rounded-xl text-sm font-medium"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Address Grid List */}
      {addresses.length === 0 ? (
        <div className="card p-12 text-center max-w-xl mx-auto space-y-4">
          <MapPin className="w-12 h-12 text-slate-450 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900">No Receiver Addresses</h3>
            <p className="text-slate-550 text-sm">
              You haven't saved any receiver addresses yet. Add one to select it easily when shipping.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary py-2 px-4 rounded-xl text-sm font-medium inline-flex items-center gap-1.5 mx-auto"
          >
            <Plus className="w-4 h-4" /> Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`card p-5 space-y-4 border transition-all flex flex-col justify-between ${
                addr.is_default
                  ? "border-brand-500 bg-brand-50/5 shadow-sm"
                  : "border-slate-200 hover:border-slate-350"
              }`}
            >
              <div className="space-y-3">
                {/* Badge/Label row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-full capitalize">
                    {addr.label}
                  </span>
                  {addr.is_default && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Default
                    </span>
                  )}
                </div>

                {/* Receiver Info */}
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {addr.full_name}
                  </p>
                  <p className="text-slate-550 text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {addr.phone}
                  </p>
                  <p className="text-slate-550 text-xs flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    {addr.country}
                  </p>
                  <div className="text-slate-700 text-xs flex items-start gap-1.5 pt-1.5 border-t border-slate-100 leading-relaxed font-sans">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{addr.address}</span>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2 gap-2">
                {!addr.is_default ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={actionLoading}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                  >
                    Set Default
                  </button>
                ) : (
                  <span className="text-[10px] text-brand-600 font-semibold flex items-center gap-0.5">
                    <Check className="w-3.5 h-3.5" /> Selected Default
                  </span>
                )}

                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={actionLoading}
                  className="text-xs font-medium text-slate-450 hover:text-red-600 transition-colors flex items-center gap-1"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
