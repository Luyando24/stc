import { createServiceClient } from "./supabase/server";
import { PricingSettings, DEFAULT_PRICING_SETTINGS } from "./pricing";

export async function getPricingSettings(): Promise<PricingSettings> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("system_settings").select("key, value");
    if (error || !data) return DEFAULT_PRICING_SETTINGS;

    const settings: PricingSettings = { ...DEFAULT_PRICING_SETTINGS };

    for (const row of data) {
      if (row.key === "pricing_air_base_rate") settings.air_base_rate = parseFloat(row.value);
      else if (row.key === "pricing_sea_base_rate") settings.sea_base_rate = parseFloat(row.value);
      else if (row.key === "pricing_air_volumetric_divisor") settings.air_volumetric_divisor = parseFloat(row.value);
      else if (row.key === "pricing_valuation_fee_rate") settings.valuation_fee_rate = parseFloat(row.value);
      else if (row.key === "pricing_min_charge") settings.min_charge = parseFloat(row.value);
      else if (row.key === "pricing_cny_to_usd_rate") settings.cny_to_usd_rate = parseFloat(row.value);
      else if (row.key === "pricing_custom_rules") {
        try {
          settings.custom_rules = JSON.parse(row.value);
        } catch (e) {
          console.error("Failed to parse custom pricing rules:", e);
        }
      }
    }

    return settings;
  } catch (e) {
    console.error("Error fetching pricing settings:", e);
    return DEFAULT_PRICING_SETTINGS;
  }
}
