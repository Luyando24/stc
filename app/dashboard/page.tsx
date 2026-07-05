import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Plane,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ParcelStatus, ShipmentStatus } from "@/lib/types";
import { CopyButton } from "@/components/CopyButton";

function StatusIcon({ status }: { status: ParcelStatus | ShipmentStatus }) {
  switch (status) {
    case "pending":
    case "processing":
    case "booked":
      return <Clock className="w-5 h-5 text-amber-500" />;
    case "arrived":
    case "consolidated":
    case "in_transit":
    case "customs":
    case "out_for_delivery":
    case "delivered":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "flagged":
    case "exception":
      return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    case "cancelled":
      return <AlertTriangle className="w-5 h-5 text-slate-500" />;
    default:
      return <Clock className="w-5 h-5 text-slate-500" />;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin" || profile?.role === "warehouse_staff") {
    redirect("/admin");
  }

  // Fetch recent parcels (max 5)
  const { data: parcels } = await supabase
    .from("parcels")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent shipments (max 5)
  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const parcelCounts = {
    pending: parcels?.filter((p) => p.status === "pending").length ?? 0,
    arrived: parcels?.filter((p) => p.status === "arrived").length ?? 0,
    consolidated: parcels?.filter((p) => p.status === "consolidated").length ?? 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Warehouse Code */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold text-slate-100">
          Welcome back, {profile?.full_name || "Customer"}!
        </h1>
        <p className="text-slate-400 mt-2 max-w-xl">
          Use the details below to ship your items to our China warehouse, and then pre-alert them.
        </p>

        <div className="mt-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">
              Your China Warehouse Delivery Code
            </p>
            <p className="text-2xl font-bold text-slate-100 font-mono tracking-wider mt-1">
              {profile?.warehouse_code ?? "STC-CN-XXXX"}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Give this code to your suppliers in China as your delivery address
            </p>
          </div>
          <CopyButton text={profile?.warehouse_code ?? ""} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Pending Parcels",
            value: parcelCounts.pending,
            icon: Clock,
            color: "text-slate-400",
          },
          {
            label: "Arrived at Warehouse",
            value: parcelCounts.arrived,
            icon: CheckCircle2,
            color: "text-blue-400",
          },
          {
            label: "Active Shipments",
            value: shipments?.filter((s) => s.status !== "delivered").length ?? 0,
            icon: Plane,
            color: "text-brand-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-2xl font-display font-bold text-white">
              {stat.value}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/pre-alert" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">Submit Pre-Alert</p>
            <p className="text-slate-400 text-sm">
              Notify us of an incoming parcel from China
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </Link>

        <Link href="/dashboard/shipments/new" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-accent-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">Request Shipment</p>
            <p className="text-slate-400 text-sm">
              Ship arrived parcels to Africa
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </Link>
      </div>

      {/* Recent Parcels */}
      {parcels && parcels.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-white">Recent Parcels</h2>
            <Link href="/dashboard/parcels" className="text-sm text-brand-400 hover:text-brand-300">
              View all →
            </Link>
          </div>
          <div className="card overflow-hidden">
            <div className="divide-y divide-white/5">
              {parcels.map((parcel) => (
                <div key={parcel.id} className="p-4 flex items-center gap-3">
                  <StatusIcon status={parcel.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {parcel.local_tracking_number}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {parcel.item_description ?? "No description"} · {parcel.supplier_name ?? ""}
                    </p>
                  </div>
                  <span className={`badge-${parcel.status}`}>{parcel.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Shipments */}
      {shipments && shipments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-white">Recent Shipments</h2>
            <Link href="/dashboard/shipments" className="text-sm text-brand-400 hover:text-brand-300">
              View all →
            </Link>
          </div>
          <div className="card overflow-hidden">
            <div className="divide-y divide-white/5">
              {shipments.map((shipment) => (
                <Link
                  key={shipment.id}
                  href={`/dashboard/shipments/${shipment.id}`}
                  className="p-4 flex items-center gap-3 hover:bg-white/3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Plane className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white font-mono">
                      {shipment.stc_tracking_number}
                    </p>
                    <p className="text-xs text-slate-400">
                      {shipment.mode.toUpperCase()} · {shipment.destination_country}
                    </p>
                  </div>
                  <span className={`badge-${shipment.status}`}>{shipment.status.replace("_", " ")}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!parcels || parcels.length === 0) && (!shipments || shipments.length === 0) && (
        <div className="card p-12 text-center">
          <Package className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No activity yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Start by submitting a pre-alert for your first parcel from China.
          </p>
          <Link href="/dashboard/pre-alert" className="btn-primary">
            Submit first pre-alert
          </Link>
        </div>
      )}
    </div>
  );
}
