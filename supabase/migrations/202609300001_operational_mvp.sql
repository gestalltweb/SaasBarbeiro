create extension if not exists btree_gist;

create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text not null default '' check (char_length(description) <= 600),
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  price_cents integer not null check (price_cents between 0 and 100000000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, business_id)
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 100),
  description text not null default '' check (char_length(description) <= 600),
  contact text not null default '' check (char_length(contact) <= 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, business_id)
);

create table public.professional_services (
  business_id uuid not null references public.businesses(id) on delete cascade,
  professional_id uuid not null,
  service_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (professional_id, service_id),
  foreign key (professional_id, business_id) references public.professionals(id, business_id) on delete cascade,
  foreign key (service_id, business_id) references public.services(id, business_id) on delete cascade
);

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time),
  unique (business_id, day_of_week, start_time, end_time)
);

create table public.professional_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  professional_id uuid not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time),
  foreign key (professional_id, business_id) references public.professionals(id, business_id) on delete cascade,
  unique (professional_id, day_of_week, start_time, end_time)
);

create table public.unavailabilities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  professional_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '' check (char_length(reason) <= 240),
  created_at timestamptz not null default now(),
  check (starts_at < ends_at),
  foreign key (professional_id, business_id) references public.professionals(id, business_id) on delete cascade
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 100),
  phone text not null check (char_length(phone) between 8 and 24),
  email text not null default '' check (char_length(email) <= 254),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, phone),
  unique (id, business_id)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_id uuid not null,
  service_id uuid not null,
  professional_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  public_token uuid not null default gen_random_uuid() unique,
  notes text not null default '' check (char_length(notes) <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  foreign key (client_id, business_id) references public.clients(id, business_id) on delete restrict,
  foreign key (service_id, business_id) references public.services(id, business_id) on delete restrict,
  foreign key (professional_id, business_id) references public.professionals(id, business_id) on delete restrict,
  exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed'))
);

create index services_business_idx on public.services(business_id, is_active);
create index professionals_business_idx on public.professionals(business_id, is_active);
create index professional_services_business_idx on public.professional_services(business_id);
create index business_hours_lookup_idx on public.business_hours(business_id, day_of_week);
create index professional_hours_lookup_idx on public.professional_hours(professional_id, day_of_week);
create index unavailabilities_lookup_idx on public.unavailabilities(professional_id, starts_at, ends_at);
create index clients_business_name_idx on public.clients(business_id, name);
create index appointments_business_start_idx on public.appointments(business_id, starts_at);
create index appointments_professional_start_idx on public.appointments(professional_id, starts_at);
create index appointments_client_idx on public.appointments(client_id, starts_at desc);

create trigger services_touch before update on public.services
for each row execute function public.touch_updated_at();
create trigger professionals_touch before update on public.professionals
for each row execute function public.touch_updated_at();
create trigger clients_touch before update on public.clients
for each row execute function public.touch_updated_at();
create trigger appointments_touch before update on public.appointments
for each row execute function public.touch_updated_at();

alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_services enable row level security;
alter table public.business_hours enable row level security;
alter table public.professional_hours enable row level security;
alter table public.unavailabilities enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;

create policy services_member_all on public.services
for all to authenticated using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));
create policy services_public_read on public.services
for select to anon using (
  is_active and exists (select 1 from public.businesses b where b.id = business_id and b.is_published)
);

create policy professionals_member_all on public.professionals
for all to authenticated using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));
create policy professionals_public_read on public.professionals
for select to anon using (
  is_active and exists (select 1 from public.businesses b where b.id = business_id and b.is_published)
);

create policy professional_services_member_all on public.professional_services
for all to authenticated using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));
create policy professional_services_public_read on public.professional_services
for select to anon using (
  exists (
    select 1 from public.businesses b
    join public.professionals p on p.business_id = b.id and p.id = professional_id and p.is_active
    join public.services s on s.business_id = b.id and s.id = service_id and s.is_active
    where b.id = business_id and b.is_published
  )
);

create policy business_hours_member_all on public.business_hours
for all to authenticated using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));
create policy professional_hours_member_all on public.professional_hours
for all to authenticated using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));
create policy unavailabilities_member_all on public.unavailabilities
for all to authenticated using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));
create policy clients_member_all on public.clients
for all to authenticated using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));
create policy appointments_member_all on public.appointments
for all to authenticated using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.professionals to authenticated;
grant select, insert, update, delete on public.professional_services to authenticated;
grant select, insert, update, delete on public.business_hours to authenticated;
grant select, insert, update, delete on public.professional_hours to authenticated;
grant select, insert, update, delete on public.unavailabilities to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select on public.services, public.professionals, public.professional_services to anon;

create or replace function public.get_available_slots(
  p_slug text,
  p_service_id uuid,
  p_professional_id uuid,
  p_date date
)
returns table(slot_start timestamptz)
language sql stable security definer set search_path = '' as $$
  select distinct generated.slot_start
  from public.businesses b
  join public.services s on s.business_id = b.id and s.id = p_service_id and s.is_active
  join public.professionals p on p.business_id = b.id and p.id = p_professional_id and p.is_active
  join public.professional_services ps on ps.business_id = b.id and ps.service_id = s.id and ps.professional_id = p.id
  join public.business_hours bh on bh.business_id = b.id and bh.day_of_week = extract(dow from p_date)::smallint
  join public.professional_hours ph on ph.business_id = b.id and ph.professional_id = p.id and ph.day_of_week = bh.day_of_week
  cross join lateral generate_series(
    greatest(
      (p_date + bh.start_time) at time zone b.timezone,
      (p_date + ph.start_time) at time zone b.timezone
    ),
    least(
      (p_date + bh.end_time) at time zone b.timezone,
      (p_date + ph.end_time) at time zone b.timezone
    ) - make_interval(mins => s.duration_minutes),
    interval '15 minutes'
  ) as generated(slot_start)
  where b.slug = lower(trim(p_slug))
    and b.is_published
    and p_date >= (now() at time zone b.timezone)::date
    and generated.slot_start >= now() + interval '5 minutes'
    and not exists (
      select 1 from public.unavailabilities u
      where u.business_id = b.id and u.professional_id = p.id
        and tstzrange(u.starts_at, u.ends_at, '[)') &&
            tstzrange(generated.slot_start, generated.slot_start + make_interval(mins => s.duration_minutes), '[)')
    )
    and not exists (
      select 1 from public.appointments a
      where a.business_id = b.id and a.professional_id = p.id
        and a.status in ('pending', 'confirmed')
        and tstzrange(a.starts_at, a.ends_at, '[)') &&
            tstzrange(generated.slot_start, generated.slot_start + make_interval(mins => s.duration_minutes), '[)')
    )
  order by generated.slot_start;
$$;

create or replace function public.create_public_appointment(
  p_slug text,
  p_service_id uuid,
  p_professional_id uuid,
  p_starts_at timestamptz,
  p_client_name text,
  p_client_phone text,
  p_client_email text default ''
)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_business_id uuid;
  v_duration integer;
  v_timezone text;
  v_client_id uuid;
  v_token uuid;
  v_phone text;
begin
  if char_length(trim(p_client_name)) not between 2 and 100 then
    raise exception using errcode = '22023', message = 'invalid_client_name';
  end if;
  v_phone := regexp_replace(coalesce(p_client_phone, ''), '[^0-9+]', '', 'g');
  if char_length(v_phone) not between 8 and 24 then
    raise exception using errcode = '22023', message = 'invalid_client_phone';
  end if;
  if char_length(coalesce(p_client_email, '')) > 254 then
    raise exception using errcode = '22023', message = 'invalid_client_email';
  end if;

  select b.id, s.duration_minutes, b.timezone into v_business_id, v_duration, v_timezone
  from public.businesses b
  join public.services s on s.business_id = b.id and s.id = p_service_id and s.is_active
  join public.professionals p on p.business_id = b.id and p.id = p_professional_id and p.is_active
  join public.professional_services ps on ps.business_id = b.id and ps.service_id = s.id and ps.professional_id = p.id
  where b.slug = lower(trim(p_slug)) and b.is_published;

  if v_business_id is null then
    raise exception using errcode = '22023', message = 'invalid_booking_selection';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_professional_id::text || p_starts_at::text, 0));

  if not exists (
    select 1 from public.get_available_slots(p_slug, p_service_id, p_professional_id, (p_starts_at at time zone v_timezone)::date)
    where slot_start = p_starts_at
  ) then
    raise exception using errcode = 'P0001', message = 'slot_unavailable';
  end if;

  insert into public.clients (business_id, name, phone, email)
  values (v_business_id, trim(p_client_name), v_phone, lower(trim(coalesce(p_client_email, ''))))
  on conflict (business_id, phone) do update
  set name = excluded.name,
      email = case when excluded.email <> '' then excluded.email else public.clients.email end
  returning id into v_client_id;

  insert into public.appointments (
    business_id, client_id, service_id, professional_id, starts_at, ends_at
  ) values (
    v_business_id, v_client_id, p_service_id, p_professional_id,
    p_starts_at, p_starts_at + make_interval(mins => v_duration)
  ) returning public_token into v_token;

  return v_token;
exception
  when exclusion_violation then
    raise exception using errcode = 'P0001', message = 'slot_unavailable';
end;
$$;

create or replace function public.create_unavailability_local(
  p_business_id uuid,
  p_professional_id uuid,
  p_starts_local timestamp,
  p_ends_local timestamp,
  p_reason text default ''
)
returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_timezone text;
  v_id uuid;
begin
  if not public.is_business_member(p_business_id) then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  select timezone into v_timezone from public.businesses where id = p_business_id;
  if p_starts_local >= p_ends_local then
    raise exception using errcode = '22023', message = 'invalid_interval';
  end if;
  insert into public.unavailabilities (business_id, professional_id, starts_at, ends_at, reason)
  values (
    p_business_id,
    p_professional_id,
    p_starts_local at time zone v_timezone,
    p_ends_local at time zone v_timezone,
    left(trim(coalesce(p_reason, '')), 240)
  ) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.get_booking_confirmation(p_token uuid)
returns table(
  business_name text,
  service_name text,
  professional_name text,
  starts_at timestamptz,
  status public.appointment_status
)
language sql stable security definer set search_path = '' as $$
  select b.name, s.name, p.name, a.starts_at, a.status
  from public.appointments a
  join public.businesses b on b.id = a.business_id
  join public.services s on s.id = a.service_id
  join public.professionals p on p.id = a.professional_id
  where a.public_token = p_token;
$$;

revoke all on function public.get_available_slots(text, uuid, uuid, date) from public;
revoke all on function public.create_public_appointment(text, uuid, uuid, timestamptz, text, text, text) from public;
revoke all on function public.get_booking_confirmation(uuid) from public;
grant execute on function public.get_available_slots(text, uuid, uuid, date) to anon, authenticated;
grant execute on function public.create_public_appointment(text, uuid, uuid, timestamptz, text, text, text) to anon, authenticated;
grant execute on function public.get_booking_confirmation(uuid) to anon, authenticated;
revoke all on function public.create_unavailability_local(uuid, uuid, timestamp, timestamp, text) from public;
grant execute on function public.create_unavailability_local(uuid, uuid, timestamp, timestamp, text) to authenticated;

comment on function public.create_public_appointment is
'Atomically validates a public slot and inserts the client and appointment. The advisory lock and exclusion constraint prevent double booking.';
