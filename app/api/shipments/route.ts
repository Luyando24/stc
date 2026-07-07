import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSTCTrackingNumber } from "@/lib/tracking-utils";

const ShipmentSchema = z.object({
  parcel_ids: z.array(z.string().uuid()).min(1, "Select at least one parcel"),
  mode: z.enum(["air", "sea"]),
  receiver_address_id: z.string().uuid("Please select a receiver address"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ShipmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { parcel_ids, mode, receiver_address_id } = parsed.data;

  // Fetch selected receiver address
  const { data: addr, error: addrError } = await supabase
    .from("receiver_addresses")
    .select("*")
    .eq("id", receiver_address_id)
    .eq("customer_id", user.id)
    .single();

  if (addrError || !addr) {
    return NextResponse.json(
      { error: "Invalid receiver address selected." },
      { status: 400 }
    );
  }

  // Verify all parcels belong to user and are in "arrived" status
  const { data: parcels, error: parcelError } = await supabase
    .from("parcels")
    .select("id, status")
    .in("id", parcel_ids)
    .eq("customer_id", user.id)
    .eq("status", "arrived");

  if (parcelError || !parcels || parcels.length !== parcel_ids.length) {
    return NextResponse.json(
      { error: "One or more parcels are invalid or not yet arrived." },
      { status: 400 }
    );
  }

  // Generate STC tracking number server-side using utility function
  let trackingData: string;
  try {
    trackingData = await generateSTCTrackingNumber(supabase);
  } catch (err: any) {
    console.error("Tracking generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate tracking number." },
      { status: 500 }
    );
  }

  // Create shipment
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .insert({
      customer_id: user.id,
      stc_tracking_number: trackingData,
      mode,
      destination_country: addr.country,
      receiver_address_id: addr.id,
      receiver_name: addr.full_name,
      receiver_phone: addr.phone,
      receiver_address: addr.address,
      status: "processing",
    })
    .select("id")
    .single();

  if (shipmentError || !shipment) {
    return NextResponse.json(
      { error: "Failed to create shipment." },
      { status: 500 }
    );
  }

  // Link parcels to shipment
  const { error: linkError } = await supabase.from("shipment_parcels").insert(
    parcel_ids.map((parcel_id) => ({
      shipment_id: shipment.id,
      parcel_id,
    }))
  );

  if (linkError) {
    return NextResponse.json(
      { error: "Failed to link parcels to shipment." },
      { status: 500 }
    );
  }

  // Mark parcels as consolidated
  await supabase
    .from("parcels")
    .update({ status: "consolidated" })
    .in("id", parcel_ids);

  return NextResponse.json({
    shipment_id: shipment.id,
    stc_tracking_number: trackingData,
  });
}
