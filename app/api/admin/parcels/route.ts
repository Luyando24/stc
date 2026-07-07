import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AddParcelSchema = z.object({
  local_tracking_number: z.string().min(1, "Tracking number is required"),
  warehouse_code: z.string().length(4, "Warehouse code must be 4 digits"),
  supplier_name: z.string().optional().nullable(),
  weight_kg: z.number().positive().optional().nullable(),
  dimensions: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "warehouse_staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = AddParcelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const {
    local_tracking_number,
    warehouse_code,
    supplier_name,
    weight_kg,
    dimensions,
  } = parsed.data;

  // Use service client to bypass RLS constraint on public.parcels insert
  const serviceSupabase = createServiceClient();

  // Find customer by warehouse code
  const { data: customer } = await serviceSupabase
    .from("profiles")
    .select("id")
    .eq("warehouse_code", warehouse_code)
    .single();

  if (!customer) {
    return NextResponse.json({ error: `Customer with code ${warehouse_code} not found.` }, { status: 404 });
  }

  // Create parcel
  const { data: parcel, error: parcelError } = await serviceSupabase
    .from("parcels")
    .insert({
      customer_id: customer.id,
      local_tracking_number,
      supplier_name: supplier_name || null,
      weight_kg: weight_kg || null,
      dimensions: dimensions || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (parcelError || !parcel) {
    return NextResponse.json({ error: parcelError?.message || "Failed to create parcel." }, { status: 500 });
  }

  return NextResponse.json({ parcel_id: parcel.id });
}
