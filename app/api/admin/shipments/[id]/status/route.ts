import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const StatusSchema = z.object({
  status: z.enum(["processing", "booked", "in_transit", "customs", "out_for_delivery", "delivered", "exception"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "warehouse_staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  // Fetch shipment detail with customer profile for notification
  const { data: shipmentData } = await supabase
    .from("shipments")
    .select("stc_tracking_number, customer_id")
    .eq("id", id)
    .single();

  if (shipmentData) {
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", shipmentData.customer_id)
      .single();

    // Use service role to get the user's email address safely
    const { createServiceClient } = require("@/lib/supabase/server");
    const serviceClient = createServiceClient();
    const { data: authUser } = await serviceClient.auth.admin.getUserById(shipmentData.customer_id);

    if (authUser?.user?.email) {
      const { notifyShipmentStatusChanged } = require("@/lib/resend");
      await notifyShipmentStatusChanged(
        authUser.user.email,
        customerProfile?.full_name ?? "",
        shipmentData.stc_tracking_number,
        parsed.data.status
      );
    }
  }

  const { error } = await supabase
    .from("shipments")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
