import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PricingSettingsSchema = z.object({
  pricing_air_base_rate: z.number().nonnegative(),
  pricing_sea_base_rate: z.number().nonnegative(),
  pricing_air_volumetric_divisor: z.number().positive(),
  pricing_valuation_fee_rate: z.number().nonnegative(),
  pricing_min_charge: z.number().nonnegative(),
  pricing_cny_to_usd_rate: z.number().positive(),
  pricing_custom_rules: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      conditionField: z.enum(["weight_kg", "volume_cbm", "declared_value", "shipping_mode", "supplier_name", "item_description"]),
      conditionOperator: z.enum(["gt", "lt", "eq", "contains"]),
      conditionValue: z.string(),
      actionType: z.enum(["add_fee", "multiply_total", "multiply_rate"]),
      actionValue: z.number(),
    })
  ),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch settings from system_settings
  const { data: dbSettings, error } = await supabase
    .from("system_settings")
    .select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: any = {
    pricing_air_base_rate: 10.0,
    pricing_sea_base_rate: 250.0,
    pricing_air_volumetric_divisor: 5000,
    pricing_valuation_fee_rate: 0.015,
    pricing_min_charge: 15.0,
    pricing_cny_to_usd_rate: 0.14,
    pricing_custom_rules: [],
  };

  if (dbSettings) {
    for (const row of dbSettings) {
      if (row.key === "pricing_air_base_rate") settings.pricing_air_base_rate = parseFloat(row.value);
      else if (row.key === "pricing_sea_base_rate") settings.pricing_sea_base_rate = parseFloat(row.value);
      else if (row.key === "pricing_air_volumetric_divisor") settings.pricing_air_volumetric_divisor = parseFloat(row.value);
      else if (row.key === "pricing_valuation_fee_rate") settings.pricing_valuation_fee_rate = parseFloat(row.value);
      else if (row.key === "pricing_min_charge") settings.pricing_min_charge = parseFloat(row.value);
      else if (row.key === "pricing_cny_to_usd_rate") settings.pricing_cny_to_usd_rate = parseFloat(row.value);
      else if (row.key === "pricing_custom_rules") {
        try {
          settings.pricing_custom_rules = JSON.parse(row.value);
        } catch (e) {
          console.error("Failed to parse custom pricing rules", e);
        }
      }
    }
  }

  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = PricingSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    // Upsert each setting
    const settingsToSave = [
      { key: "pricing_air_base_rate", value: data.pricing_air_base_rate.toString(), description: "Base rate per kg for Air Freight (USD)" },
      { key: "pricing_sea_base_rate", value: data.pricing_sea_base_rate.toString(), description: "Base rate per CBM for Sea Freight (USD)" },
      { key: "pricing_air_volumetric_divisor", value: data.pricing_air_volumetric_divisor.toString(), description: "Volumetric weight divisor for Air Freight" },
      { key: "pricing_valuation_fee_rate", value: data.pricing_valuation_fee_rate.toString(), description: "Surcharge rate applied to the declared value of the parcel" },
      { key: "pricing_min_charge", value: data.pricing_min_charge.toString(), description: "Minimum shipping charge in USD" },
      { key: "pricing_cny_to_usd_rate", value: data.pricing_cny_to_usd_rate.toString(), description: "Exchange rate used to convert CNY declared values to USD" },
      { key: "pricing_custom_rules", value: JSON.stringify(data.pricing_custom_rules), description: "JSON array representing custom pricing rules" },
    ];

    for (const item of settingsToSave) {
      const { error: err } = await supabase
        .from("system_settings")
        .upsert(item);

      if (err) {
        return NextResponse.json({ error: `Failed to save setting ${item.key}: ${err.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Pricing settings saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
