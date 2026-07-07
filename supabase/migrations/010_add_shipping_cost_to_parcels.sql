-- Add shipping_cost column to parcels table
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS shipping_cost numeric;
