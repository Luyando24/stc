-- Add shipping_mode, receiver_address_id, and submitted_for_shipping columns to parcels table
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS submitted_for_shipping boolean DEFAULT false;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS shipping_mode text CHECK (shipping_mode IN ('air', 'sea'));
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS receiver_address_id uuid REFERENCES receiver_addresses(id) ON DELETE SET NULL;
