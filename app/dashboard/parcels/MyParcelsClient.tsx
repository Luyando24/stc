"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Ship,
  Copy,
  Search,
  Plane,
  MapPin,
  AlertCircle,
  X,
} from "lucide-react";
import { Parcel, ParcelStatus } from "@/lib/types";

export type ClientParcelStatus = ParcelStatus | "delivered";

export interface ClientParcel extends Omit<Parcel, "status"> {
  status: ClientParcelStatus;
  stc_tracking_number: string | null;
  shipment_id: string | null;
  submitted_for_shipping?: boolean;
  shipping_mode?: "air" | "sea" | null;
  receiver_address_id?: string | null;
}

interface MyParcelsClientProps {
  parcels: ClientParcel[];
  profileCountry: string | null;
  receiverAddresses: any[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Arrival",
  arrived: "Arrived",
  flagged: "Awaiting Shipping",
  consolidated: "Shipped Out",
  delivered: "Delivered",
};

export default function MyParcelsClient({ parcels, profileCountry, receiverAddresses }: MyParcelsClientProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Copy success indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected parcels for bulk action
  const [selectedParcelIds, setSelectedParcelIds] = useState<Set<string>>(new Set());

  // Submit for Shipping Modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submittingParcels, setSubmittingParcels] = useState<ClientParcel[]>([]);
  const [shippingMode, setShippingMode] = useState<"air" | "sea">("sea");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const openSubmitModal = (parcel: ClientParcel) => {
    setSubmittingParcels([parcel]);
    setShippingMode("sea");

    // Set default address if available
    const defaultAddr = receiverAddresses.find((addr) => addr.is_default) || receiverAddresses[0];
    setSelectedAddressId(defaultAddr?.id || "");
    setSubmitError(null);
    setSubmitModalOpen(true);
  };

  const openBatchSubmitModal = () => {
    const selected = parcels.filter(p => selectedParcelIds.has(p.id));
    if (selected.length === 0) return;
    setSubmittingParcels(selected);
    setShippingMode("sea");

    const defaultAddr = receiverAddresses.find((addr) => addr.is_default) || receiverAddresses[0];
    setSelectedAddressId(defaultAddr?.id || "");
    setSubmitError(null);
    setSubmitModalOpen(true);
  };

  const closeSubmitModal = () => {
    setSubmitModalOpen(false);
    setSubmittingParcels([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedParcelIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmSubmit = async () => {
    if (submittingParcels.length === 0 || !selectedAddressId) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await Promise.all(submittingParcels.map(async (p) => {
        const res = await fetch(`/api/parcels/${p.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shipping_mode: shippingMode,
            receiver_address_id: selectedAddressId,
            submitted_for_shipping: true,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to submit parcel ${p.local_tracking_number}`);
        }
      }));

      window.location.reload();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Filter parcels based on search query
  const searchedParcels = parcels.filter((p) =>
    p.local_tracking_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tab calculations based on actual statuses and details
  const awaitingInfo = searchedParcels.filter(
    (p) => p.status === "arrived" && (!p.item_description || !p.declared_value)
  );
  const arrived = searchedParcels.filter(
    (p) => p.status === "arrived" && p.item_description && p.declared_value && !p.submitted_for_shipping
  );
  const processing = searchedParcels.filter(
    (p) => p.status === "arrived" && p.submitted_for_shipping
  );
  const shippedOut = searchedParcels.filter((p) => p.status === "consolidated");
  const delivered = searchedParcels.filter((p) => p.status === "delivered");
  
  // Filter by tab
  let displayedParcels = searchedParcels;
  if (activeTab === "awaiting_info") displayedParcels = awaitingInfo;
  else if (activeTab === "arrived") displayedParcels = arrived;
  else if (activeTab === "processing") displayedParcels = processing;
  else if (activeTab === "shipped_out") displayedParcels = shippedOut;
  else if (activeTab === "delivered") displayedParcels = delivered;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">All parcels</h1>
        <p className="text-slate-500 text-sm mt-1">
          All parcels registered to your delivery code at our China warehouse.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-[#f4f5f6] p-1.5 rounded-2xl border border-slate-100">
        {[
          { id: "all", count: searchedParcels.length, label: "All Parcels" },
          { id: "awaiting_info", count: awaitingInfo.length, label: "Awaiting Info" },
          { id: "arrived", count: arrived.length, label: "Awaiting Shipping" },
          { id: "processing", count: processing.length, label: "Processing" },
          { id: "shipped_out", count: shippedOut.length, label: "Shipped Out" },
          { id: "delivered", count: delivered.length, label: "Delivered" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm font-bold scale-102"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <span className={`text-base leading-none ${isActive ? "text-white" : "text-slate-800 font-bold"}`}>
                {tab.count}
              </span>
              <span className="text-[10px] mt-1 tracking-tight text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by tracking number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
        />
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* Batch Action Bar */}
      {selectedParcelIds.size > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 text-brand-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              {selectedParcelIds.size}
            </div>
            <p className="text-sm font-semibold text-brand-900">
              parcels selected for shipping
            </p>
          </div>
          <button
            onClick={openBatchSubmitModal}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-sm transition-colors cursor-pointer font-sans"
          >
            Submit Selected for Shipping
          </button>
        </div>
      )}

      {/* Cards List */}
      {displayedParcels.length === 0 ? (
        <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center shadow-xs">
          <Package className="w-10 h-10 text-slate-350 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No parcels found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            We couldn't find any packages matching this category or tracking query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedParcels.map((parcel) => (
            <div
              key={parcel.id}
              className={`bg-white border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all duration-300 ${
                selectedParcelIds.has(parcel.id) ? "border-brand-500 shadow-sm ring-1 ring-brand-500" : "border-slate-150 shadow-xs"
              }`}
            >
              {/* Route & Status Info */}
              <div className="flex items-center gap-4 min-w-[240px]">
                {parcel.status === "arrived" && parcel.item_description && parcel.declared_value && !parcel.submitted_for_shipping && (
                  <div className="flex items-center mr-1">
                    <input
                      type="checkbox"
                      checked={selectedParcelIds.has(parcel.id)}
                      onChange={() => toggleSelection(parcel.id)}
                      className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-600 cursor-pointer"
                    />
                  </div>
                )}
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                  <Ship className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                    <span>China</span>
                    <span className="text-slate-400 text-xs">→</span>
                    <span className="text-brand-600">{profileCountry ? profileCountry.toUpperCase() : "Destination"}</span>
                  </h4>
                  <p className={`text-xs font-semibold mt-1 ${
                    parcel.status === "delivered"
                      ? "text-emerald-650"
                      : parcel.status === "arrived"
                      ? (!parcel.item_description || !parcel.declared_value
                        ? "text-amber-650"
                        : parcel.submitted_for_shipping
                        ? "text-emerald-650 font-semibold"
                        : "text-brand-500 font-bold")
                      : parcel.status === "consolidated"
                      ? "text-blue-650"
                      : "text-slate-500"
                  }`}>
                    {parcel.status === "consolidated"
                      ? "Shipped Out"
                      : parcel.status === "delivered"
                      ? "Delivered"
                      : parcel.status === "arrived"
                      ? (!parcel.item_description || !parcel.declared_value
                        ? "Awaiting Info"
                        : parcel.submitted_for_shipping
                        ? "Submitted for Shipping"
                        : "Awaiting Shipping")
                      : STATUS_LABELS[parcel.status] || parcel.status}
                  </p>
                  <p className="text-[10px] text-slate-450 mt-1">
                    {new Date(parcel.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Middle Section: Tracking Codes & Descriptions */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">Local bill number</p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {parcel.local_tracking_number}
                    </span>
                    <button
                      onClick={() => handleCopy(parcel.id, parcel.local_tracking_number)}
                      className="text-slate-400 hover:text-brand-650 p-0.5 rounded transition-colors"
                      title="Copy local bill number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copiedId === parcel.id && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded animate-fade-in font-medium">
                        Copied
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">Tracking Number</p>
                  <p className="font-mono text-slate-700 font-semibold text-sm">
                    {parcel.stc_tracking_number ?? "—"}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <p className="text-slate-400 font-medium">Description</p>
                  <p className="font-semibold text-slate-800 truncate max-w-md">
                    {parcel.item_description ?? "Not specified"}
                  </p>
                </div>
              </div>

              {/* Right Section: Physical stats & Action buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between md:justify-center gap-4 min-w-[200px] border-t sm:border-t-0 md:border-t-0 pt-4 sm:pt-0 border-slate-100">
                <div className="text-xs text-slate-650 space-y-1 sm:text-right">
                  <p>
                    Weight:{" "}
                    <span className="font-bold text-slate-900">
                      {parcel.weight_kg ? `${parcel.weight_kg} kg` : "—"}
                    </span>
                  </p>
                  <p>
                    Dimensions:{" "}
                    <span className="font-bold text-slate-900">
                      {parcel.dimensions ? `${parcel.dimensions}` : "—"}
                    </span>
                  </p>
                  <p className="flex items-center sm:justify-end gap-1">
                    <span>Declared Value:</span>
                    <span className="font-bold text-brand-600 text-sm">
                      {parcel.declared_value ? `¥${parcel.declared_value}` : "—"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto">
                  {parcel.stc_tracking_number ? (
                    <Link
                      href={`/dashboard/shipments/${parcel.shipment_id}`}
                      className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors text-center w-full sm:w-36"
                    >
                      Track
                    </Link>
                  ) : (
                    <>
                      {/* If arrived and details are filled, but not yet submitted for shipping */}
                      {parcel.status === "arrived" &&
                      parcel.item_description &&
                      parcel.declared_value &&
                      !parcel.submitted_for_shipping ? (
                        <>
                          <button
                            onClick={() => openSubmitModal(parcel)}
                            className="bg-brand-650 hover:bg-accent-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors text-center w-full sm:w-36 flex-shrink-0 cursor-pointer font-sans"
                          >
                            Submit for Shipping
                          </button>
                        </>
                      ) : (
                        <>
                          {parcel.status === "arrived" && parcel.submitted_for_shipping ? (
                            <Link
                              href={`/dashboard/parcels/${parcel.id}`}
                              className="btn-secondary text-xs font-semibold py-2.5 px-4 rounded-xl text-center w-full sm:w-36 transition-colors font-sans"
                            >
                              Edit Details
                            </Link>
                          ) : (
                            <Link
                              href={`/dashboard/parcels/${parcel.id}`}
                              className="bg-brand-650 hover:bg-accent-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors text-center w-full sm:w-36 font-sans"
                            >
                              {!parcel.item_description ? "Fill Details" : "Edit Details"}
                            </Link>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit for Shipping Modal */}
      {submitModalOpen && submittingParcels.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 shadow-xl space-y-5 transform scale-100 transition-all animate-zoom-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-slate-900">
                Submit {submittingParcels.length} Parcel{submittingParcels.length !== 1 ? "s" : ""}
              </h3>
              <button onClick={closeSubmitModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex gap-3 text-xs text-slate-600 max-h-40 overflow-y-auto custom-scrollbar">
              <Package className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-2 w-full">
                {submittingParcels.map(p => (
                  <div key={p.id} className="border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
                    <p className="font-mono font-bold text-slate-800">{p.local_tracking_number}</p>
                    <p className="mt-0.5">{p.item_description} · Qty {p.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {receiverAddresses.length === 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 text-sm text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">No receiver addresses found</p>
                    <p className="text-xs mt-1 leading-relaxed">
                      You must add at least one receiver address in Africa before you can submit a parcel for shipping.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/receiver-addresses"
                  className="btn-primary w-full justify-center py-2.5 rounded-xl text-center text-sm font-sans"
                >
                  Manage Addresses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Shipping Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block font-sans">Shipping Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShippingMode("air")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                        shippingMode === "air"
                          ? "border-brand-500/50 bg-brand-50 text-brand-600 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Plane className="w-4 h-4" />
                      <span>Air Freight</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingMode("sea")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                        shippingMode === "sea"
                          ? "border-brand-500/50 bg-brand-50 text-brand-600 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Ship className="w-4 h-4" />
                      <span>Sea Freight</span>
                    </button>
                  </div>
                </div>

                {/* 2. Receiver Address Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block font-sans">Receiver Address</label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 font-sans"
                  >
                    {receiverAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} ({addr.full_name} · {addr.country})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address details preview */}
                {(() => {
                  const selectedAddr = receiverAddresses.find((a) => a.id === selectedAddressId);
                  if (!selectedAddr) return null;
                  return (
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5 text-xs text-slate-650 font-sans">
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedAddr.full_name} ({selectedAddr.phone})</span>
                      </p>
                      <p className="pl-5 text-slate-500">{selectedAddr.address}, {selectedAddr.country}</p>
                    </div>
                  );
                })()}

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-650 text-xs flex gap-2 font-sans">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeSubmitModal}
                    className="btn-secondary w-full justify-center text-sm py-2.5 rounded-xl font-sans"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    className="btn-primary w-full justify-center text-sm py-2.5 rounded-xl bg-brand-650 hover:bg-accent-600 text-white font-bold font-sans"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Confirm & Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
