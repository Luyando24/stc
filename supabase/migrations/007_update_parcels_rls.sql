-- ============================================================
-- STC Logistics — Update Parcels RLS Policies
-- ============================================================

-- Drop the old restricted update policy
drop policy if exists "Customers can update own pending parcels" on public.parcels;

-- Create a new policy that allows customers to update details for their own
-- pending, arrived, or flagged parcels (so they can confirm descriptions & declared values)
create policy "Customers can update own pending or arrived parcels"
  on public.parcels for update
  using (customer_id = auth.uid() and status in ('pending', 'arrived', 'flagged'))
  with check (customer_id = auth.uid() and status in ('pending', 'arrived', 'flagged'));
