-- Add shipping_cost column to parcels table
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS shipping_cost numeric;

-- Seed default pricing settings into system_settings
INSERT INTO public.system_settings (key, value, description)
VALUES
  ('pricing_air_base_rate', '10.0', 'Base rate per kg for Air Freight (USD)'),
  ('pricing_sea_base_rate', '250.0', 'Base rate per CBM for Sea Freight (USD)'),
  ('pricing_air_volumetric_divisor', '5000', 'Volumetric weight divisor for Air Freight (e.g. L*W*H / 5000)'),
  ('pricing_valuation_fee_rate', '0.015', 'Surcharge rate applied to the declared value of the parcel (e.g. 0.015 for 1.5%)'),
  ('pricing_min_charge', '15.0', 'Minimum shipping charge in USD'),
  ('pricing_cny_to_usd_rate', '0.14', 'Exchange rate used to convert CNY declared values to USD'),
  ('pricing_custom_rules', '[]', 'JSON array representing custom pricing rules')
ON CONFLICT (key) do nothing;
