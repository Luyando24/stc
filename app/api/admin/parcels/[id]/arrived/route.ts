import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ArrivedSchema = z.object({
  weight_kg: z.number().positive().nullable().optional(),
  dimensions: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "warehouse_staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = ArrivedSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Fetch parcel info with customer profile for notification
  const { data: parcelData } = await supabase
    .from("parcels")
    .select("local_tracking_number, customer_id")
    .eq("id", id)
    .single();

  if (parcelData) {
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", parcelData.customer_id)
      .single();

    // Use service role to get the user's email address safely
    const { createServiceClient } = require("@/lib/supabase/server");
    const serviceClient = createServiceClient();
    const { data: authUser } = await serviceClient.auth.admin.getUserById(parcelData.customer_id);

    if (authUser?.user?.email) {
      const { notifyParcelArrived } = require("@/lib/resend");
      await notifyParcelArrived(
        authUser.user.email,
        customerProfile?.full_name ?? "",
        parcelData.local_tracking_number
      );
    }
  }

  const { error } = await supabase
    .from("parcels")
    .update({
      status: "arrived",
      arrived_at: new Date().toISOString(),
      weight_kg: parsed.data.weight_kg ?? null,
      dimensions: parsed.data.dimensions ?? null,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
