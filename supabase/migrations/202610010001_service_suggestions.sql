-- Safe, additive migration for segment-based service suggestions.
-- Existing services and their personalized values are never updated.

create table if not exists public.service_suggestion_catalog (
  segment public.business_segment not null,
  suggestion_key text not null check (suggestion_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text not null default '' check (char_length(description) <= 600),
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  price_cents integer not null check (price_cents >= 0),
  primary key (segment, suggestion_key)
);

alter table public.service_suggestion_catalog enable row level security;
revoke all on table public.service_suggestion_catalog from public, anon, authenticated;

insert into public.service_suggestion_catalog (segment, suggestion_key, name, description, duration_minutes, price_cents)
values
  ('barbershop', 'male-haircut', 'Corte masculino', '', 30, 4000),
  ('barbershop', 'beard', 'Barba', '', 30, 3000),
  ('barbershop', 'haircut-and-beard', 'Corte e barba', '', 60, 6500),
  ('barbershop', 'line-up', 'Acabamento/Pezinho', '', 15, 1500),
  ('barbershop', 'kids-haircut', 'Corte infantil', '', 30, 3500),
  ('barbershop', 'eyebrows', 'Sobrancelha', '', 15, 1500),
  ('hair_salon', 'womens-haircut', 'Corte feminino', '', 60, 8000),
  ('hair_salon', 'blowout', 'Escova', '', 45, 6000),
  ('hair_salon', 'hydration', 'Hidratação', '', 60, 8000),
  ('hair_salon', 'coloring', 'Coloração', '', 120, 15000),
  ('hair_salon', 'manicure', 'Manicure', '', 60, 4000),
  ('hair_salon', 'pedicure', 'Pedicure', '', 60, 4500),
  ('aesthetics', 'facial-cleansing', 'Limpeza de pele', '', 60, 10000),
  ('aesthetics', 'eyebrow-design', 'Design de sobrancelhas', '', 30, 4000),
  ('aesthetics', 'facial-waxing', 'Depilação facial', '', 30, 5000),
  ('aesthetics', 'relaxing-massage', 'Massagem relaxante', '', 60, 12000),
  ('aesthetics', 'lymphatic-drainage', 'Drenagem linfática', '', 60, 12000),
  ('aesthetics', 'custom-procedure', 'Procedimento personalizado', '', 60, 10000)
on conflict (segment, suggestion_key) do nothing;

alter table public.services add column if not exists suggestion_key text;

create unique index if not exists services_business_suggestion_key_uidx
  on public.services (business_id, suggestion_key)
  where suggestion_key is not null;

comment on column public.services.suggestion_key is
'Stable system key for an initial suggestion. It remains unchanged when the owner customizes the service.';

create or replace function public.insert_missing_suggested_services(target_business_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  insert into public.services (
    business_id,
    suggestion_key,
    name,
    description,
    duration_minutes,
    price_cents
  )
  select
    business.id,
    catalog.suggestion_key,
    catalog.name,
    catalog.description,
    catalog.duration_minutes,
    catalog.price_cents
  from public.businesses as business
  join public.service_suggestion_catalog as catalog on catalog.segment = business.segment
  where business.id = target_business_id
    and not exists (
      select 1
      from public.services as existing
      where existing.business_id = business.id
        and (
          existing.suggestion_key = catalog.suggestion_key
          or lower(trim(existing.name)) = lower(trim(catalog.name))
        )
    )
  on conflict (business_id, suggestion_key) where suggestion_key is not null do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.insert_missing_suggested_services(uuid) from public, anon, authenticated;

create or replace function public.add_suggested_services()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_business_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select membership.business_id
  into authenticated_business_id
  from public.business_members as membership
  where membership.user_id = auth.uid()
  order by membership.created_at, membership.business_id
  limit 1;

  if authenticated_business_id is null then
    raise exception 'business not found';
  end if;

  return public.insert_missing_suggested_services(authenticated_business_id);
end;
$$;

revoke all on function public.add_suggested_services() from public, anon;
grant execute on function public.add_suggested_services() to authenticated;

create or replace function public.create_business(
  business_name text,
  business_slug text,
  business_segment public.business_segment
)
returns public.businesses
language plpgsql
security definer
set search_path = ''
as $$
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

  -- Suggestions improve onboarding, but a catalog problem must not prevent the
  -- authenticated owner and business from being created successfully.
  begin
    perform public.insert_missing_suggested_services(created_business.id);
  exception when others then
    raise warning 'Business % created without suggested services: %', created_business.id, sqlerrm;
  end;

  return created_business;
end;
$$;

revoke all on function public.create_business(text, text, public.business_segment) from public, anon;
grant execute on function public.create_business(text, text, public.business_segment) to authenticated;

comment on function public.add_suggested_services() is
'Adds only missing catalog suggestions to the business derived from auth.uid(). No business_id is accepted from the caller.';
