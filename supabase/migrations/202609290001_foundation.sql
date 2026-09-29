create extension if not exists pgcrypto;

create type public.member_role as enum ('owner', 'manager', 'staff');
create type public.business_segment as enum ('barbershop', 'hair_salon', 'aesthetics', 'other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  segment public.business_segment not null,
  description text check (char_length(description) <= 600),
  phone text,
  instagram text,
  address text,
  timezone text not null default 'America/Sao_Paulo',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create index business_members_user_id_idx on public.business_members(user_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger businesses_touch before update on public.businesses
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_business_member(target_business_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_business_owner(target_business_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.create_business(
  business_name text,
  business_slug text,
  business_segment public.business_segment
)
returns public.businesses
language plpgsql security definer set search_path = '' as $$
declare
  created_business public.businesses;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if business_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'invalid slug'; end if;

  insert into public.businesses (name, slug, segment)
  values (trim(business_name), lower(trim(business_slug)), business_segment)
  returning * into created_business;

  insert into public.business_members (business_id, user_id, role)
  values (created_business.id, auth.uid(), 'owner');

  return created_business;
end;
$$;

revoke all on function public.create_business(text, text, public.business_segment) from public;
grant execute on function public.create_business(text, text, public.business_segment) to authenticated;

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy businesses_select_public_or_member on public.businesses
for select using (is_published or public.is_business_member(id));
create policy businesses_update_owner on public.businesses
for update to authenticated using (public.is_business_owner(id))
with check (public.is_business_owner(id));
create policy businesses_delete_owner on public.businesses
for delete to authenticated using (public.is_business_owner(id));

create policy members_select_same_business on public.business_members
for select to authenticated using (public.is_business_member(business_id));
create policy members_write_owner on public.business_members
for all to authenticated using (public.is_business_owner(business_id))
with check (public.is_business_owner(business_id));

grant select, update on public.profiles to authenticated;
grant select on public.businesses to anon, authenticated;
grant update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.business_members to authenticated;
grant execute on function public.is_business_member(uuid) to anon, authenticated;
grant execute on function public.is_business_owner(uuid) to anon, authenticated;

comment on table public.business_members is
'Tenant boundary. Client code never supplies an unverified business_id; server actions derive access from this membership and RLS enforces it again.';
