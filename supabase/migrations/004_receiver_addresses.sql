-- Create receiver_addresses table
CREATE TABLE IF NOT EXISTS receiver_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL, -- e.g. 'Home', 'Office'
  full_name text NOT NULL,
  phone text NOT NULL,
  country text NOT NULL,
  address text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE receiver_addresses ENABLE ROW LEVEL SECURITY;

-- Policies for receiver_addresses
CREATE POLICY "Customers can manage own receiver addresses"
  ON receiver_addresses FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff and admin can view all receiver addresses"
  ON receiver_addresses FOR SELECT
  USING (get_my_role() in ('warehouse_staff', 'admin'));

-- Add receiver columns to shipments table
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_address_id uuid REFERENCES receiver_addresses(id) ON DELETE SET NULL;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_name text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_phone text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS receiver_address text;
