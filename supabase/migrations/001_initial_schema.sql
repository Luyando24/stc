-- ============================================================
-- STC Logistics — Initial Schema
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('customer', 'warehouse_staff', 'admin');
  end if;
end$$;

-- ── Tables ───────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  warehouse_code text unique not null,
  full_name text,
  phone text,
  country text,
  role user_role not null default 'customer',
  created_at timestamptz default now()
);

create table parcels (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete cascade not null,
  local_tracking_number text not null,
  supplier_name text,
  item_description text,
  quantity int default 1,
  declared_value numeric,
  status text not null default 'pending'
    check (status in ('pending','arrived','flagged','consolidated','cancelled')),
  weight_kg numeric,
  dimensions text,
  photos text[],          -- Supabase Storage URLs
  arrived_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create table shipments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete cascade not null,
  stc_tracking_number text unique not null,  -- e.g. STC-SH-2026-000123
  mode text not null check (mode in ('air','sea')),
  destination_country text not null,
  status text not null default 'processing'
    check (status in ('processing','booked','in_transit','customs','out_for_delivery','delivered','exception')),
  maersk_carrier_booking_reference text,
  maersk_transport_document_reference text,
  maersk_equipment_reference text,
  freight_cost numeric,
  estimated_delivery_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table shipment_parcels (
  shipment_id uuid references shipments(id) on delete cascade,
  parcel_id uuid references parcels(id) on delete cascade,
  primary key (shipment_id, parcel_id)
);

create table tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references shipments(id) on delete cascade,
  source text not null check (source in ('maersk','manual')),
  event_type text,        -- SHIPMENT / TRANSPORT / EQUIPMENT or custom
  description text,
  location text,
  event_datetime timestamptz,
  raw_payload jsonb,      -- full Maersk event object for audit
  created_at timestamptz default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index parcels_customer_id_idx on parcels(customer_id);
create index parcels_status_idx on parcels(status);
create index parcels_local_tracking_number_idx on parcels(local_tracking_number);
create index shipments_customer_id_idx on shipments(customer_id);
create index shipments_stc_tracking_number_idx on shipments(stc_tracking_number);
create index shipments_status_idx on shipments(status);
create index tracking_events_shipment_id_idx on tracking_events(shipment_id);
create index tracking_events_event_datetime_idx on tracking_events(event_datetime desc);

-- ── Auto-update updated_at ────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger shipments_updated_at
  before update on shipments
  for each row execute function update_updated_at_column();

-- ── Auto-generate warehouse code ──────────────────────────────
-- Generates STC-CN-XXXX from a sequence padded to 4 digits
create sequence if not exists warehouse_code_seq start 1;

create or replace function generate_warehouse_code()
returns text as $$
declare
  next_val int;
  code text;
begin
  next_val := nextval('public.warehouse_code_seq');
  code := 'STC-CN-' || lpad(next_val::text, 4, '0');
  return code;
end;
$$ language plpgsql;

-- ── Auto-generate STC shipment tracking number ────────────────
create sequence if not exists shipment_number_seq start 1;

create or replace function generate_stc_tracking_number()
returns text as $$
declare
  next_val int;
  year_str text;
begin
  next_val := nextval('public.shipment_number_seq');
  year_str := extract(year from now())::text;
  return 'STC-SH-' || year_str || '-' || lpad(next_val::text, 6, '0');
end;
$$ language plpgsql;

-- ── Profile auto-creation trigger ────────────────────────────
-- When a user signs up via Supabase Auth, automatically create a profile
-- with a unique warehouse code.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, warehouse_code, full_name)
  values (
    new.id,
    public.generate_warehouse_code(),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table parcels enable row level security;
alter table shipments enable row level security;
alter table shipment_parcels enable row level security;
alter table tracking_events enable row level security;

-- Helper function: get role of current user
create or replace function get_my_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- ── profiles RLS ──────────────────────────────────────────────
create policy "Customers can view own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Customers can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Staff and admin can view all profiles"
  on profiles for select
  using (get_my_role() in ('warehouse_staff', 'admin'));

create policy "Staff and admin can update all profiles"
  on profiles for update
  using (get_my_role() in ('warehouse_staff', 'admin'));

-- ── parcels RLS ───────────────────────────────────────────────
create policy "Customers can view own parcels"
  on parcels for select
  using (customer_id = auth.uid());

create policy "Customers can insert own parcels"
  on parcels for insert
  with check (customer_id = auth.uid());

create policy "Customers can update own pending parcels"
  on parcels for update
  using (customer_id = auth.uid() and status = 'pending');

create policy "Staff and admin can view all parcels"
  on parcels for select
  using (get_my_role() in ('warehouse_staff', 'admin'));

create policy "Staff and admin can update all parcels"
  on parcels for update
  using (get_my_role() in ('warehouse_staff', 'admin'));

-- ── shipments RLS ─────────────────────────────────────────────
create policy "Customers can view own shipments"
  on shipments for select
  using (customer_id = auth.uid());

create policy "Customers can insert own shipments"
  on shipments for insert
  with check (customer_id = auth.uid());

create policy "Staff and admin can view all shipments"
  on shipments for select
  using (get_my_role() in ('warehouse_staff', 'admin'));

create policy "Staff and admin can insert shipments"
  on shipments for insert
  with check (get_my_role() in ('warehouse_staff', 'admin'));

create policy "Staff and admin can update all shipments"
  on shipments for update
  using (get_my_role() in ('warehouse_staff', 'admin'));

-- ── shipment_parcels RLS ──────────────────────────────────────
create policy "Customers can view own shipment_parcels"
  on shipment_parcels for select
  using (
    exists (
      select 1 from shipments s
      where s.id = shipment_id and s.customer_id = auth.uid()
    )
  );

create policy "Staff and admin can manage all shipment_parcels"
  on shipment_parcels for all
  using (get_my_role() in ('warehouse_staff', 'admin'));

-- ── tracking_events RLS ───────────────────────────────────────
-- Customers: read-only, scoped to their shipments
create policy "Customers can view tracking events for own shipments"
  on tracking_events for select
  using (
    exists (
      select 1 from shipments s
      where s.id = shipment_id and s.customer_id = auth.uid()
    )
  );

create policy "Staff and admin can view all tracking events"
  on tracking_events for select
  using (get_my_role() in ('warehouse_staff', 'admin'));

-- Service role writes tracking events (Maersk sync job uses service role key)
-- No insert/update policy needed for non-service roles on tracking_events
-- Admin can add manual milestones via the admin panel
create policy "Admin can insert manual tracking events"
  on tracking_events for insert
  with check (get_my_role() = 'admin');

create policy "Admin can update manual tracking events"
  on tracking_events for update
  using (get_my_role() = 'admin' and source = 'manual');
