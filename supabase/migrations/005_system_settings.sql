-- ============================================================
-- STC Logistics — System Settings Table
-- ============================================================

create table if not exists public.system_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Admins can manage everything on system_settings
create policy "Admins can do everything on system_settings"
  on public.system_settings for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- Add trigger for updated_at
create trigger system_settings_updated_at
  before update on public.system_settings
  for each row execute function public.update_updated_at_column();

-- Seed default settings
insert into public.system_settings (key, value, description)
values
  ('resend_api_key', 'your_resend_api_key', 'API key for Resend email service'),
  ('resend_from_email', 'notifications@stclogistics.com', 'From email address for Resend notifications')
on conflict (key) do nothing;
