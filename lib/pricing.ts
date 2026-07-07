export interface CustomRule {
  id: string;
  description: string;
  conditionField: "weight_kg" | "volume_cbm" | "declared_value" | "shipping_mode" | "supplier_name" | "item_description";
  conditionOperator: "gt" | "lt" | "eq" | "contains";
  conditionValue: string;
  actionType: "add_fee" | "multiply_total" | "multiply_rate";
  actionValue: number;
}

export interface PricingSettings {
  air_base_rate: number;
  sea_base_rate: number;
  air_volumetric_divisor: number;
  valuation_fee_rate: number;
  min_charge: number;
  cny_to_usd_rate: number;
  custom_rules: CustomRule[];
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  air_base_rate: 10.0,
  sea_base_rate: 250.0,
  air_volumetric_divisor: 5000,
  valuation_fee_rate: 0.015,
  min_charge: 15.0,
  cny_to_usd_rate: 0.14,
  custom_rules: [],
};

export function parseDimensions(dimStr: string | null): { length: number; width: number; height: number } {
  if (!dimStr) return { length: 0, width: 0, height: 0 };
  const parts = dimStr
    .toLowerCase()
    .split(/[x*,]/)
    .map((p) => parseFloat(p.trim()))
    .filter((n) => !isNaN(n));
  if (parts.length >= 3) {
    return { length: parts[0], width: parts[1], height: parts[2] };
  }
  return { length: 0, width: 0, height: 0 };
}

export function calculateVolumeCBM(length: number, width: number, height: number): number {
  return (length * width * height) / 1000000;
}

export function calculateVolumetricWeight(length: number, width: number, height: number, divisor: number = 5000): number {
  return (length * width * height) / divisor;
}

export interface ParcelPricingInput {
  weight_kg: number | null;
  dimensions: string | null;
  shipping_mode: "air" | "sea" | null;
  declared_value: number | null;
  supplier_name?: string | null;
  item_description?: string | null;
}

export function calculateShippingCost(
  parcel: ParcelPricingInput,
  settings: PricingSettings
): {
  finalPriceUsd: number;
  baseCost: number;
  freightCost: number;
  valuationFee: number;
  volumeCbm: number;
  chargeableWeight: number;
  rulesApplied: string[];
} {
  const mode = parcel.shipping_mode || "sea";
  const weight = parcel.weight_kg || 0;
  const dims = parseDimensions(parcel.dimensions);
  const volumeCbm = calculateVolumeCBM(dims.length, dims.width, dims.height);
  const volWeight = calculateVolumetricWeight(dims.length, dims.width, dims.height, settings.air_volumetric_divisor);
  const chargeableWeight = Math.max(weight, volWeight);
  const valueCny = parcel.declared_value || 0;
  const valueUsd = valueCny * settings.cny_to_usd_rate;

  let airRate = settings.air_base_rate;
  let seaRate = settings.sea_base_rate;
  const rulesApplied: string[] = [];

  // Evaluate Custom Pricing Rules for rate modifiers
  if (settings.custom_rules && settings.custom_rules.length > 0) {
    for (const rule of settings.custom_rules) {
      if (evaluateRuleCondition(rule, parcel, volumeCbm)) {
        if (rule.actionType === "multiply_rate") {
          if (mode === "air") {
            airRate *= rule.actionValue;
          } else {
            seaRate *= rule.actionValue;
          }
          rulesApplied.push(`${rule.description} (rate modified)`);
        }
      }
    }
  }

  // Calculate Freight Cost
  let freightCost = 0;
  if (mode === "air") {
    freightCost = chargeableWeight * airRate;
  } else {
    freightCost = volumeCbm * seaRate;
  }

  // Calculate Valuation Surcharge (Insurance/Handling)
  const valuationFee = valueUsd * settings.valuation_fee_rate;

  // Base Cost before rules
  let baseCost = freightCost + valuationFee;
  let totalCost = baseCost;

  // Evaluate Custom Pricing Rules for flat additions or multiplier discount
  if (settings.custom_rules && settings.custom_rules.length > 0) {
    for (const rule of settings.custom_rules) {
      if (evaluateRuleCondition(rule, parcel, volumeCbm)) {
        if (rule.actionType === "add_fee") {
          totalCost += rule.actionValue;
          rulesApplied.push(`${rule.description} (+$${rule.actionValue})`);
        } else if (rule.actionType === "multiply_total") {
          totalCost *= rule.actionValue;
          rulesApplied.push(`${rule.description} (x${rule.actionValue})`);
        }
      }
    }
  }

  // Minimum charge rule
  if (totalCost < settings.min_charge && totalCost > 0) {
    totalCost = settings.min_charge;
    rulesApplied.push(`Minimum charge applied ($${settings.min_charge})`);
  }

  return {
    finalPriceUsd: parseFloat(totalCost.toFixed(2)),
    baseCost: parseFloat(baseCost.toFixed(2)),
    freightCost: parseFloat(freightCost.toFixed(2)),
    valuationFee: parseFloat(valuationFee.toFixed(2)),
    volumeCbm: parseFloat(volumeCbm.toFixed(4)),
    chargeableWeight: parseFloat(chargeableWeight.toFixed(2)),
    rulesApplied,
  };
}

function evaluateRuleCondition(rule: CustomRule, parcel: ParcelPricingInput, volumeCbm: number): boolean {
  let val: any = null;

  if (rule.conditionField === "weight_kg") {
    val = parcel.weight_kg || 0;
  } else if (rule.conditionField === "volume_cbm") {
    val = volumeCbm;
  } else if (rule.conditionField === "declared_value") {
    val = parcel.declared_value || 0;
  } else if (rule.conditionField === "shipping_mode") {
    val = parcel.shipping_mode || "sea";
  } else if (rule.conditionField === "supplier_name") {
    val = parcel.supplier_name || "";
  } else if (rule.conditionField === "item_description") {
    val = parcel.item_description || "";
  }

  const condVal = rule.conditionValue;

  if (rule.conditionOperator === "gt") {
    return parseFloat(val) > parseFloat(condVal);
  } else if (rule.conditionOperator === "lt") {
    return parseFloat(val) < parseFloat(condVal);
  } else if (rule.conditionOperator === "eq") {
    if (typeof val === "string") {
      return val.toLowerCase() === condVal.toLowerCase();
    }
    return parseFloat(val) === parseFloat(condVal);
  } else if (rule.conditionOperator === "contains") {
    if (typeof val === "string") {
      return val.toLowerCase().includes(condVal.toLowerCase());
    }
    return false;
  }

  return false;
}
