-- ============================================================
-- STC Logistics — Blog Posts Schema
-- ============================================================

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  category text not null check (category in (
    'Shipping Updates',
    'Cargo Tips',
    'Destination Notices',
    'Loading Updates',
    'Business Shipping Advice',
    'Seasonal Content'
  )),
  featured_image text,
  read_time integer default 5,
  published_date timestamptz not null default now(),
  author text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index blog_posts_slug_idx on public.blog_posts(slug);
create index blog_posts_published_date_idx on public.blog_posts(published_date desc);

-- Enable RLS
alter table public.blog_posts enable row level security;

-- Read policy: public can read published posts
create policy "Anyone can view published blog posts"
  on public.blog_posts for select
  using (published_date <= now());

-- Admin policy: admin can manage everything
create policy "Admins can manage all blog posts"
  on public.blog_posts for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- Trigger to auto-update updated_at
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.update_updated_at_column();

-- Seed dynamic default blog posts
insert into public.blog_posts (title, slug, excerpt, category, read_time, author, content)
values
  (
    'How to Choose Between Air and Sea Freight for Your China Imports',
    'air-vs-sea-freight-china-imports',
    'Understand the key differences in transit times, costs, volume capacities, and customs procedures between air and sea freight for shipments from China to Africa.',
    'Cargo Tips',
    5,
    'STC Logistics Insights Team',
    '# How to Choose Between Air and Sea Freight for Your China Imports

When importing cargo from China to Africa, one of the most critical decisions is deciding whether to ship by **Air Freight** or **Sea Freight**. The choice between these two modes affects your delivery speed, margins, product safety, and cash flow. 

In this comprehensive guide, we compare air and sea shipping across four major metrics to help you select the ideal method for your business.

---

## 1. Transit Speed (Time to Destination)

*   **Air Freight:** Unmatched speed. Typically takes **3 to 7 business days** door-to-door, including customs clearance. Ideal for fast-moving consumer electronics, fashion items, and urgent spare parts.
*   **Sea Freight:** Significantly slower. Transit times range from **30 to 45 days** depending on the port of origin in China and destination port in Africa. Requires forward planning and higher inventory holding levels.

---

## 2. Shipping Cost and Calculation

*   **Air Freight Cost:** Calculated based on **chargeable weight** (either actual weight or volumetric weight, whichever is greater). Typically ranges between $5.00 to $9.00 per kilogram. Very expensive for heavy or bulky goods.
*   **Sea Freight Cost:** Calculated based on cargo volume in cubic meters (CBM) for **Less than Container Load (LCL)**, or a flat fee per container for **Full Container Load (FCL)**. Far cheaper per unit, often saving up to 80% compared to air shipping.

---

## 3. Cargo Volume and Weight Capacity

*   **Air Freight Constraints:** Aircraft have strict volume and height limitations. Hazardous items, lithium batteries, and exceptionally long items face restrictions or hefty surcharges.
*   **Sea Freight Flexibility:** Can handle virtually any cargo size, weight, or classification. Perfect for machinery, vehicles, building materials, and bulk commodities.

---

## 4. Safety and Risk of Damage

While modern freight is highly secure, air shipping minimizes handling risks due to shorter transit times. Sea shipping exposes cargo to moisture, salinity, and movement over weeks, requiring superior **export-grade packaging** (waterproofing, robust pallets, etc.).

---

## Summarized Decision Rule:

> Use **Air Freight** if: Your goods are high-value, lightweight (< 150kg total), time-sensitive, or seasonal.
> 
> Use **Sea Freight** if: Your cargo is heavy (> 150kg), bulky, has low margins, or you are scheduling routine inventory refills.'
  ),
  (
    'Consolidation Secret: Save Up to 40% on Shipping Costs',
    'warehouse-consolidation-save-shipping-costs',
    'Learn how consolidation at our China warehouse allows you to buy from multiple suppliers and combine them into a single cost-effective international shipment.',
    'Shipping Updates',
    4,
    'Logistics Optimization Team',
    '# Consolidation Secret: Save Up to 40% on Shipping Costs

One of the greatest challenges for small and medium-sized African importers is managing shipments from multiple suppliers in China. Shipping small parcels individually via international couriers accumulates massive shipping fees. 

The secret to optimizing your logistics margins is **Warehouse Consolidation**. Here is how our consolidation system saves you up to 40% on your cargo shipping costs.

---

## What is Cargo Consolidation?

Consolidation is the process of combining multiple small packages from different manufacturers into a single master container or shipment. Instead of paying individual courier overheads, handling fees, and custom minimum charges for five different packages, you pay a single bulk freight cost.

---

## How STC Logistics Consolidation Works:

1.  **Unique Warehouse Code:** Upon signup, you receive a code like `STC-CN-0001`.
2.  **Supplier Shipping:** You buy from different suppliers on Alibaba, Taobao, or 1688, directing them to ship to our China warehouse, putting your code in the receiver name.
3.  **Intake and Pre-Alerts:** As packages arrive, our staff registers them in your dashboard. You see photos, weights, and statuses.
4.  **Consolidation Request:** Once all expected goods have arrived, select them and click **Request Shipment**.
5.  **Master Shipping:** We combine the packages into a single shipment (air or sea), generating one STC tracking number and one invoice.

---

## Why It Saves You Money:

*   **Eliminates Minimum Charges:** International couriers charge a high base fee for the first 0.5kg. By consolidating, you pay the base fee only once.
*   **Reduced Customs Clearance Fees:** Clearing one large consolidated shipment requires one set of customs paperwork and custom clearance fee, rather than paying import broker fees for multiple packages.
*   **Volumetric Optimization:** Combining boxes allows us to pack the cargo efficiently, reducing empty spaces that trigger volumetric weight penalties.'
  ),
  (
    'Understanding Customs Clearing & Taxes at Destination Ports in Africa',
    'customs-clearing-and-taxes-africa-ports',
    'Navigate the complex landscape of import duties, clearing processes, and required documentation at major African cargo destinations to avoid transit exceptions.',
    'Destination Notices',
    7,
    'Global Customs Compliance Group',
    '# Understanding Customs Clearing & Taxes at Destination Ports in Africa

Customs clearance and import taxes are often perceived as the most stressful phase of importing goods from China. Delays at destination ports can lead to storage fees (demurrage) and exception penalties. 

Understanding the documentation and tax frameworks at your destination is key to a smooth shipping experience.

---

## Key Required Documents for Importation:

Before your cargo departs China, ensure you have gathered the following:

1.  **Commercial Invoice:** Provided by the supplier, detailing product descriptions, quantities, unit prices, and total values. Keep values realistic to prevent customs audits.
2.  **Packing List:** Specifies the contents of each package, weight, and dimensions.
3.  **Bill of Lading (Sea) / Air Waybill (Air):** Issued by STC Logistics representing the carriage contract and cargo ownership.
4.  **Certificate of Conformity (CoC):** Required by countries like Kenya (PVOC) and Nigeria (SONCAP) to prove products meet local safety standards.

---

## How Import Duties are Calculated:

Duties are calculated based on the **CIF value** (Cost, Insurance, and Freight):

$$\text{CIF} = \text{Product Cost} + \text{Insurance} + \text{International Freight}$$

Customs applies the percentage duty rate to this total value. In addition to import duty, most African destinations levy a standard Value Added Tax (VAT) ranging from 5% to 18% on the CIF + duty total.

---

## Pro-Tips to Avoid Customs Delays:

*   **Pre-File Documentation:** Submit your invoice and packing lists to your customs agent as soon as the cargo is loaded in China.
*   **Accurate HS Codes:** Ensure every item is classified under the correct Harmonized System (HS) code to avoid misdeclaration penalties.
*   **Declare Correct Values:** Do not severely undervalue goods. Customs officers compare invoice values with their internal database of market averages. Undervaluation leads to heavy fines and long cargo holds.'
  )
on conflict (slug) do nothing;
