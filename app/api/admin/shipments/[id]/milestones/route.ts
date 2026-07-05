import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MilestoneSchema = z.object({
  description: z.string().min(1).max(500),
  location: z.string().max(200).nullable().optional(),
  event_type: z.string().max(50).default("UPDATE"),
  event_datetime: z.string().datetime(),
});

export async function POST(
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
  const parsed = MilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { error } = await supabase.from("tracking_events").insert({
    shipment_id: id,
    source: "manual",
    event_type: parsed.data.event_type,
    description: parsed.data.description,
    location: parsed.data.location ?? null,
    event_datetime: parsed.data.event_datetime,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
