export type UserRole = "customer" | "warehouse_staff" | "admin";

export interface Profile {
  id: string;
  warehouse_code: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  delivery_address: string | null;
  role: UserRole;
  created_at: string;
}

export type ParcelStatus =
  | "pending"
  | "arrived"
  | "flagged"
  | "consolidated"
  | "cancelled";

export interface Parcel {
  id: string;
  customer_id: string;
  local_tracking_number: string;
  supplier_name: string | null;
  item_description: string | null;
  quantity: number;
  declared_value: number | null;
  status: ParcelStatus;
  weight_kg: number | null;
  dimensions: string | null;
  photos: string[] | null;
  arrived_at: string | null;
  notes: string | null;
  created_at: string;
}

export type ShipmentStatus =
  | "processing"
  | "booked"
  | "in_transit"
  | "customs"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export type ShipmentMode = "air" | "sea";

export interface Shipment {
  id: string;
  customer_id: string;
  stc_tracking_number: string;
  mode: ShipmentMode;
  destination_country: string;
  status: ShipmentStatus;
  maersk_carrier_booking_reference: string | null;
  maersk_transport_document_reference: string | null;
  maersk_equipment_reference: string | null;
  freight_cost: number | null;
  estimated_delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TrackingEventSource = "maersk" | "manual";

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  source: TrackingEventSource;
  event_type: string | null;
  description: string | null;
  location: string | null;
  event_datetime: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface ShipmentWithEvents extends Shipment {
  tracking_events: TrackingEvent[];
  parcels?: Parcel[];
}

export interface TrackingResult {
  shipment: Shipment;
  events: TrackingEvent[];
  source: "cache" | "live" | "manual";
}
