"use client";

import { TrackingEvent, ShipmentStatus } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Plane,
  Ship,
  Package,
  AlertTriangle,
  Circle,
} from "lucide-react";
import clsx from "clsx";

function getEventIcon(eventType: string | null, source: string) {
  const t = (eventType ?? "").toUpperCase();
  if (t.includes("DEPART") || t.includes("DEPARTURE")) return Plane;
  if (t.includes("ARRIVAL") || t.includes("ARRIVE")) return CheckCircle2;
  if (t.includes("DISCHARGE") || t.includes("LOAD")) return Ship;
  if (t.includes("PICKED") || t.includes("PICKUP")) return Package;
  if (t.includes("CUSTOMS")) return AlertTriangle;
  if (source === "manual") return Circle;
  return MapPin;
}

function StatusBar({ status }: { status: ShipmentStatus }) {
  const steps: { key: ShipmentStatus; label: string }[] = [
    { key: "processing", label: "Processing" },
    { key: "booked", label: "Booked" },
    { key: "in_transit", label: "In Transit" },
    { key: "customs", label: "Customs" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const done = i <= currentIdx;
          const current = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    done
                      ? "bg-brand-600 border-brand-600"
                      : "bg-white border-slate-200"
                  )}
                >
                  {done && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <span
                  className={clsx(
                    "text-xs mt-1 whitespace-nowrap hidden sm:block",
                    current ? "text-brand-600 font-semibold" : done ? "text-slate-700" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={clsx(
                    "flex-1 h-0.5 mx-1 transition-all",
                    i < currentIdx ? "bg-brand-600" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
  shipmentStatus: ShipmentStatus;
}

export default function TrackingTimeline({ events, shipmentStatus }: TrackingTimelineProps) {
  if (shipmentStatus === "exception") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700">Shipment Exception</p>
          <p className="text-xs text-red-650 mt-0.5">
            There&apos;s an issue with your shipment. Our team will contact you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StatusBar status={shipmentStatus} />

      {events.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No tracking updates yet.</p>
          <p className="text-slate-400 text-xs mt-1">
            Updates will appear here once your shipment is in transit.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-6">
            {events.map((event, i) => {
              const Icon = getEventIcon(event.event_type, event.source);
              const isLatest = i === 0;
              return (
                <div key={event.id} className="flex gap-4 relative">
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 z-10",
                      isLatest
                        ? "bg-brand-50 border-brand-600"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-4 h-4",
                        isLatest ? "text-brand-600" : "text-slate-400"
                      )}
                    />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={clsx(
                            "text-sm font-medium",
                            isLatest ? "text-slate-900" : "text-slate-650"
                          )}
                        >
                          {event.description ?? event.event_type ?? "Update"}
                        </p>
                        {event.location && (
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {event.event_datetime && (
                          <>
                            <p className="text-xs text-slate-500">
                              {new Date(event.event_datetime).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(event.event_datetime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </>
                        )}
                        {event.source === "maersk" && (
                          <span className="text-xs text-slate-550 mt-0.5 block">Maersk</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
