import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateDetailsSchema = z.object({
  item_description: z.string().min(1, "Please specify what is inside"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  declared_value: z.number().positive("Price must be greater than 0"),
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

  const { item_description, quantity, declared_value } = parsed.data;

  // Validate ownership
  const { data: parcel, error: checkError } = await supabase
    .from("parcels")
    .select("customer_id")
    .eq("id", id)
    .single();

  if (checkError || !parcel) {
    return NextResponse.json({ error: "Parcel not found." }, { status: 404 });
  }

  if (parcel.customer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Update
  const { error: updateError } = await supabase
    .from("parcels")
    .update({
      item_description,
      quantity,
      declared_value,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update parcel details." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
