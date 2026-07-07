import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPricingSettings } from "@/lib/pricing-server";
import { calculateShippingCost } from "@/lib/pricing";
import { getEmailSettings, notifyAdminNewParcelSubmission } from "@/lib/resend";

const BatchSubmitSchema = z.object({
  parcel_ids: z.array(z.string().uuid()),
  shipping_mode: z.enum(["air", "sea"]),
  receiver_address_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = BatchSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parsed.error.format() }, { status: 400 });
    }

    const { parcel_ids, shipping_mode, receiver_address_id } = parsed.data;

    // 1. Fetch user profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("full_name, warehouse_code")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 400 });
    }

    // 2. Fetch receiver address details
    const { data: address, error: addressErr } = await supabase
      .from("receiver_addresses")
      .select("*")
      .eq("id", receiver_address_id)
      .eq("customer_id", user.id)
      .single();

    if (addressErr || !address) {
      return NextResponse.json({ error: "Receiver address not found or unauthorized" }, { status: 400 });
    }

    // 3. Fetch parcels to verify ownership and get details for price calculation
    const { data: parcels, error: parcelsErr } = await supabase
      .from("parcels")
      .select("*")
      .in("id", parcel_ids)
      .eq("customer_id", user.id);

    if (parcelsErr || !parcels || parcels.length !== parcel_ids.length) {
      return NextResponse.json({ error: "Some parcels could not be found or do not belong to you" }, { status: 400 });
    }

    // Load pricing settings
    const pricingSettings = await getPricingSettings();

    // Prepare updates and calculate pricing for each parcel
    const updatedParcels: any[] = [];
    let combinedCost = 0;

    for (const parcel of parcels) {
      let shippingCost = null;
      if (shipping_mode && (parcel.weight_kg || parcel.dimensions)) {
        const pricing = calculateShippingCost(
          {
            weight_kg: parcel.weight_kg,
            dimensions: parcel.dimensions,
            shipping_mode: shipping_mode,
            declared_value: parcel.declared_value,
            supplier_name: parcel.supplier_name,
            item_description: parcel.item_description,
          },
          pricingSettings
        );
        shippingCost = pricing.finalPriceUsd;
        combinedCost += pricing.finalPriceUsd;
      }

      // Update parcel in database
      const { data: updated, error: updateErr } = await supabase
        .from("parcels")
        .update({
          shipping_mode,
          receiver_address_id,
          submitted_for_shipping: true,
          shipping_cost: shippingCost,
        })
        .eq("id", parcel.id)
        .select()
        .single();

      if (updateErr || !updated) {
        return NextResponse.json({ error: `Failed to update parcel ${parcel.local_tracking_number}` }, { status: 500 });
      }

      updatedParcels.push(updated);
    }

    // Send admin notification email
    try {
      const { adminNotificationEmail } = await getEmailSettings();
      if (adminNotificationEmail) {
        await notifyAdminNewParcelSubmission(
          adminNotificationEmail,
          profile.full_name || user.email || "Customer",
          profile.warehouse_code,
          shipping_mode,
          address.country,
          address.full_name,
          address.phone,
          address.address,
          updatedParcels,
          combinedCost
        );
      }
    } catch (emailErr) {
      console.error("Failed to send admin notification email:", emailErr);
      // We do not fail the user's submission if notification email fails
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "An unexpected error occurred" }, { status: 500 });
  }
}
