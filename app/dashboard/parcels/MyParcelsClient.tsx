"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Ship,
  Copy,
  Search,
} from "lucide-react";
import { Parcel, ParcelStatus } from "@/lib/types";

export type ClientParcelStatus = ParcelStatus | "delivered";

export interface ClientParcel extends Omit<Parcel, "status"> {
  status: ClientParcelStatus;
  stc_tracking_number: string | null;
  shipment_id: string | null;
}

interface MyParcelsClientProps {
  parcels: ClientParcel[];
  profileCountry: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Arrival",
  arrived: "Arrived at Warehouse",
  flagged: "Awaiting Shipping",
  consolidated: "Shipped Out",
  delivered: "Delivered",
};

export default function MyParcelsClient({ parcels, profileCountry }: MyParcelsClientProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Copy success indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  const arrived = searchedParcels.filter((p) => p.status === "arrived");
  const awaitingShipping = searchedParcels.filter(
    (p) => p.status === "arrived" && p.item_description && p.declared_value
  );
  const shippedOut = searchedParcels.filter((p) => p.status === "consolidated");
  const delivered = searchedParcels.filter((p) => p.status === "delivered");
  
  // Filter by tab
  let displayedParcels = searchedParcels;
  if (activeTab === "awaiting_info") displayedParcels = awaitingInfo;
  else if (activeTab === "arrived") displayedParcels = arrived;
  else if (activeTab === "awaiting_shipping") displayedParcels = awaitingShipping;
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
          { id: "arrived", count: arrived.length, label: "Arrived" },
          { id: "awaiting_shipping", count: awaitingShipping.length, label: "Awaiting Shipping" },
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
              className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all duration-300"
            >
              {/* Route & Status Info */}
              <div className="flex items-center gap-4 min-w-[240px]">
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
                      ? (!parcel.item_description || !parcel.declared_value ? "text-amber-650" : "text-emerald-650")
                      : parcel.status === "consolidated"
                      ? "text-blue-650"
                      : "text-slate-500"
                  }`}>
                    {parcel.status === "consolidated"
                      ? "Shipped Out"
                      : parcel.status === "delivered"
                      ? "Delivered"
                      : parcel.status === "arrived"
                      ? (!parcel.item_description || !parcel.declared_value ? "Awaiting Info" : "Awaiting Shipping")
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

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {parcel.stc_tracking_number ? (
                    <Link
                      href={`/dashboard/shipments/${parcel.shipment_id}`}
                      className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors text-center w-full sm:w-28"
                    >
                      Track
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/parcels/${parcel.id}`}
                      className="bg-brand-650 hover:bg-accent-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors text-center w-full sm:w-28"
                    >
                      {!parcel.item_description ? "Fill Details" : "Edit Details"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
