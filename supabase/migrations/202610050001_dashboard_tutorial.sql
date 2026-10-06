-- Additive per-user, per-business tutorial state. Existing records and tenant data remain untouched.
create table if not exists public.business_tutorial_preferences (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  acknowledged_steps text[] not null default '{}',
  is_dismissed boolean not null default false,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create index if not exists business_tutorial_preferences_user_idx on public.business_tutorial_preferences(user_id, business_id);
alter table public.business_tutorial_preferences enable row level security;

create policy tutorial_preferences_select_own_business on public.business_tutorial_preferences
for select to authenticated using (user_id = auth.uid() and public.is_business_member(business_id));
create policy tutorial_preferences_write_own_business on public.business_tutorial_preferences
for insert to authenticated with check (user_id = auth.uid() and public.is_business_member(business_id));
create policy tutorial_preferences_update_own_business on public.business_tutorial_preferences
for update to authenticated using (user_id = auth.uid() and public.is_business_member(business_id))
with check (user_id = auth.uid() and public.is_business_member(business_id));

grant select, insert, update on public.business_tutorial_preferences to authenticated;
