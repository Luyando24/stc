import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateDetailsSchema = z.object({
  item_description: z.string().min(1, "Please specify what is inside").optional(),
  quantity: z.number().int().positive("Quantity must be at least 1").optional(),
  declared_value: z.number().positive("Price must be greater than 0").optional(),
  shipping_mode: z.enum(["air", "sea"]).optional(),
  receiver_address_id: z.string().uuid().optional(),
  submitted_for_shipping: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = UpdateDetailsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const {
    item_description,
    quantity,
    declared_value,
    shipping_mode,
    receiver_address_id,
    submitted_for_shipping,
  } = parsed.data;

  // Validate ownership
  const { data: parcel, error: checkError } = await supabase
    .from("parcels")
    .select("customer_id, item_description, quantity, declared_value, shipping_mode, receiver_address_id")
    .eq("id", id)
    .single();

  if (checkError || !parcel) {
    return NextResponse.json({ error: "Parcel not found." }, { status: 404 });
  }

  if (parcel.customer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // If submitting for shipping, validate all required shipping details are present
  if (submitted_for_shipping) {
    const finalDescription = item_description ?? parcel.item_description;
    const finalQuantity = quantity ?? parcel.quantity;
    const finalValue = declared_value ?? parcel.declared_value;
    const finalMode = shipping_mode ?? parcel.shipping_mode;
    const finalAddress = receiver_address_id ?? parcel.receiver_address_id;

    if (!finalDescription || !finalQuantity || !finalValue || !finalMode || !finalAddress) {
      return NextResponse.json(
        { error: "To submit for shipping, you must specify item description, value, quantity, shipping mode, and receiver address." },
        { status: 400 }
      );
    }
  }

  // Construct update payload
  const updatePayload: any = {};
  if (item_description !== undefined) updatePayload.item_description = item_description;
  if (quantity !== undefined) updatePayload.quantity = quantity;
  if (declared_value !== undefined) updatePayload.declared_value = declared_value;
  if (shipping_mode !== undefined) updatePayload.shipping_mode = shipping_mode;
  if (receiver_address_id !== undefined) updatePayload.receiver_address_id = receiver_address_id;
  if (submitted_for_shipping !== undefined) updatePayload.submitted_for_shipping = submitted_for_shipping;

  // Update
  const { data: updatedData, error: updateError } = await supabase
    .from("parcels")
    .update(updatePayload)
    .eq("id", id)
    .select();

  if (updateError || !updatedData || updatedData.length === 0) {
    return NextResponse.json({ error: "Failed to update parcel details. Make sure you own this parcel and its status allows updates." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
