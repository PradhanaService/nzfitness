create extension if not exists pgcrypto;

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount text,
  badge text,
  bg_color text,
  text_color text,
  is_active boolean default true,
  position int,
  created_at timestamptz default now()
);

create table if not exists public.offer_claims (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  offer_id uuid references public.offers(id),
  claimed boolean default false,
  skipped boolean default false,
  claimed_at timestamptz default now()
);

alter table public.offers enable row level security;
alter table public.offer_claims enable row level security;

drop policy if exists "offers_public_select" on public.offers;
create policy "offers_public_select"
on public.offers
for select
to public
using (is_active = true);

drop policy if exists "offer_claims_public_insert" on public.offer_claims;
create policy "offer_claims_public_insert"
on public.offer_claims
for insert
to public
with check (true);

drop policy if exists "offer_claims_authenticated_select" on public.offer_claims;
create policy "offer_claims_authenticated_select"
on public.offer_claims
for select
to authenticated
using (true);

insert into public.offers (title, description, discount, badge, bg_color, text_color, is_active, position)
values
  ('Free PT Session', 'Claim a complimentary personal training session at the front desk.', '100% FREE', 'HOT', '#e63946', '#ffffff', true, 1),
  ('Protein Shake Pack', 'Grab your next recovery stack at a special in-club price.', '40% OFF', 'LIMITED', '#1a1a1a', '#ffffff', true, 2),
  ('3 Month Membership', 'Upgrade your training with a discounted multi-month membership.', '25% OFF', 'POPULAR', '#0a3d62', '#ffffff', true, 3),
  ('Gym Merchandise', 'Take home official NOIZE gear with a member bonus price.', '20% OFF', 'BONUS', '#2d6a4f', '#ffffff', true, 4)
on conflict do nothing;
