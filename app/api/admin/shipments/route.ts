import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSTCTrackingNumber } from "@/lib/tracking-utils";

const ShipmentSchema = z.object({
  parcel_ids: z.array(z.string().uuid()).min(1),
  mode: z.enum(["air", "sea"]),
  destination_country: z.string().min(1),
  freight_cost: z.number().positive().nullable().optional(),
  estimated_delivery_date: z.string().nullable().optional(),
  maersk_carrier_booking_reference: z.string().nullable().optional(),
  maersk_transport_document_reference: z.string().nullable().optional(),
  maersk_equipment_reference: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "warehouse_staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = ShipmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const {
    parcel_ids,
    mode,
    destination_country,
    freight_cost,
    estimated_delivery_date,
    maersk_carrier_booking_reference,
    maersk_transport_document_reference,
    maersk_equipment_reference,
  } = parsed.data;

  // Validate parcels exist and are arrived
  const { data: parcels } = await supabase
    .from("parcels")
    .select("id, customer_id, status")
    .in("id", parcel_ids)
    .eq("status", "arrived");

  if (!parcels || parcels.length !== parcel_ids.length) {
    return NextResponse.json({ error: "One or more parcels are not in arrived status." }, { status: 400 });
  }

  // All parcels must belong to the same customer for a single shipment
  const customerIds = [...new Set(parcels.map((p) => p.customer_id))];
  if (customerIds.length > 1) {
    return NextResponse.json({ error: "All parcels must belong to the same customer." }, { status: 400 });
  }

  const customerId = customerIds[0];

  // Generate tracking number
  let trackingNumber: string;
  try {
    trackingNumber = await generateSTCTrackingNumber(supabase);
  } catch (err: any) {
    console.error("Tracking generation error:", err);
    return NextResponse.json({ error: "Failed to generate tracking number." }, { status: 500 });
  }

  // Create shipment
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .insert({
      customer_id: customerId,
      stc_tracking_number: trackingNumber,
      mode,
      destination_country,
      status: "booked",
      freight_cost: freight_cost ?? null,
      estimated_delivery_date: estimated_delivery_date ?? null,
      maersk_carrier_booking_reference: maersk_carrier_booking_reference ?? null,
      maersk_transport_document_reference: maersk_transport_document_reference ?? null,
      maersk_equipment_reference: maersk_equipment_reference ?? null,
    })
    .select("id")
    .single();

  if (shipmentError || !shipment) {
    return NextResponse.json({ error: "Failed to create shipment." }, { status: 500 });
  }

  // Link parcels
  await supabase.from("shipment_parcels").insert(
    parcel_ids.map((parcel_id) => ({ shipment_id: shipment.id, parcel_id }))
  );

  // Mark parcels as consolidated
  await supabase.from("parcels").update({ status: "consolidated" }).in("id", parcel_ids);

  return NextResponse.json({ shipment_id: shipment.id, stc_tracking_number: trackingNumber });
}
