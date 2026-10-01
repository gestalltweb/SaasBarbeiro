-- Additive public-page studio: drafts, immutable published snapshots, audit and media.
-- Existing operational records are not changed or removed.

do $$ begin
  create type public.page_configuration_mode as enum ('manual', 'template');
exception when duplicate_object then null;
end $$;

create table if not exists public.business_public_pages (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  mode public.page_configuration_mode,
  selected_template text check (selected_template is null or selected_template in ('noir', 'editorial', 'botanical', 'urban')),
  selected_palette text,
  draft_config jsonb not null default '{}'::jsonb check (jsonb_typeof(draft_config) = 'object'),
  published_config jsonb check (published_config is null or jsonb_typeof(published_config) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.public_page_publications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  mode public.page_configuration_mode not null,
  selected_template text,
  selected_palette text,
  published_config jsonb not null check (jsonb_typeof(published_config) = 'object'),
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now()
);

create index if not exists public_page_publications_business_idx
  on public.public_page_publications (business_id, published_at desc);

drop trigger if exists business_public_pages_touch on public.business_public_pages;
create trigger business_public_pages_touch before update on public.business_public_pages
for each row execute function public.touch_updated_at();

alter table public.business_public_pages enable row level security;
alter table public.public_page_publications enable row level security;

drop policy if exists public_pages_member_all on public.business_public_pages;
create policy public_pages_member_all on public.business_public_pages
for all to authenticated
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists page_publications_member_read on public.public_page_publications;
create policy page_publications_member_read on public.public_page_publications
for select to authenticated using (public.is_business_member(business_id));

grant select, insert, update, delete on public.business_public_pages to authenticated;
grant select on public.public_page_publications to authenticated;

insert into public.business_public_pages (
  business_id, mode, selected_template, selected_palette, draft_config, published_config, published_at
)
select
  business.id,
  case when business.is_published then 'template'::public.page_configuration_mode else null end,
  case business.segment
    when 'barbershop' then 'urban'
    when 'hair_salon' then 'editorial'
    when 'aesthetics' then 'botanical'
    else 'editorial'
  end,
  case business.segment
    when 'barbershop' then 'copper'
    when 'hair_salon' then 'wine'
    when 'aesthetics' then 'sage'
    else 'wine'
  end,
  jsonb_build_object(
    'version', 1,
    'mode', 'template',
    'template', case business.segment when 'barbershop' then 'urban' when 'hair_salon' then 'editorial' when 'aesthetics' then 'botanical' else 'editorial' end,
    'palette', case business.segment when 'barbershop' then 'copper' when 'hair_salon' then 'wine' when 'aesthetics' then 'sage' else 'wine' end,
    'content', jsonb_build_object(
      'businessName', business.name,
      'heroTitle', business.name,
      'heroSubtitle', coalesce(nullif(business.description, ''), 'Atendimento profissional com horário marcado.'),
      'seoTitle', business.name || ' | Agendamento online',
      'seoDescription', coalesce(nullif(business.description, ''), 'Agende seu horário na ' || business.name || '.')
    ),
    'contact', jsonb_build_object(
      'whatsapp', coalesce(business.phone, ''),
      'instagram', coalesce(business.instagram, ''),
      'address', coalesce(business.address, '')
    )
  ),
  case when business.is_published then jsonb_build_object(
    'version', 1,
    'mode', 'template',
    'template', case business.segment when 'barbershop' then 'urban' when 'hair_salon' then 'editorial' when 'aesthetics' then 'botanical' else 'editorial' end,
    'palette', case business.segment when 'barbershop' then 'copper' when 'hair_salon' then 'wine' when 'aesthetics' then 'sage' else 'wine' end,
    'content', jsonb_build_object(
      'businessName', business.name,
      'heroTitle', business.name,
      'heroSubtitle', coalesce(nullif(business.description, ''), 'Atendimento profissional com horário marcado.'),
      'seoTitle', business.name || ' | Agendamento online',
      'seoDescription', coalesce(nullif(business.description, ''), 'Agende seu horário na ' || business.name || '.')
    ),
    'contact', jsonb_build_object(
      'whatsapp', coalesce(business.phone, ''),
      'instagram', coalesce(business.instagram, ''),
      'address', coalesce(business.address, '')
    )
  ) else null end,
  case when business.is_published then now() else null end
from public.businesses as business
on conflict (business_id) do nothing;

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select membership.business_id
  from public.business_members as membership
  where membership.user_id = auth.uid()
  order by membership.created_at, membership.business_id
  limit 1
$$;

revoke all on function public.current_business_id() from public, anon;
grant execute on function public.current_business_id() to authenticated;

create or replace function public.save_public_page_draft(p_mode public.page_configuration_mode, p_config jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_business_id uuid := public.current_business_id();
  template_name text := nullif(p_config ->> 'template', '');
  palette_name text := nullif(p_config ->> 'palette', '');
begin
  if target_business_id is null then raise exception 'business not found'; end if;
  if p_config is null or jsonb_typeof(p_config) <> 'object' then raise exception 'invalid config'; end if;
  if octet_length(p_config::text) > 250000 then raise exception 'config too large'; end if;
  if template_name is not null and template_name not in ('noir', 'editorial', 'botanical', 'urban') then raise exception 'invalid template'; end if;

  insert into public.business_public_pages (business_id, mode, selected_template, selected_palette, draft_config)
  values (target_business_id, p_mode, template_name, palette_name, p_config)
  on conflict (business_id) do update set
    mode = excluded.mode,
    selected_template = excluded.selected_template,
    selected_palette = excluded.selected_palette,
    draft_config = excluded.draft_config;
end;
$$;

create or replace function public.publish_public_page()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_business_id uuid := public.current_business_id();
  page_row public.business_public_pages;
begin
  if target_business_id is null then raise exception 'business not found'; end if;
  if not exists (select 1 from public.services where business_id = target_business_id and is_active) then raise exception 'missing active service'; end if;
  if not exists (select 1 from public.professionals where business_id = target_business_id and is_active) then raise exception 'missing active professional'; end if;
  if not exists (select 1 from public.business_hours where business_id = target_business_id) then raise exception 'missing business hours'; end if;
  if not exists (select 1 from public.professional_hours where business_id = target_business_id) then raise exception 'missing professional hours'; end if;

  select * into page_row from public.business_public_pages where business_id = target_business_id for update;
  if page_row.mode is null or page_row.draft_config = '{}'::jsonb then raise exception 'missing page configuration'; end if;

  update public.business_public_pages set
    published_config = draft_config,
    published_at = now(),
    published_by = auth.uid()
  where business_id = target_business_id
  returning * into page_row;

  update public.businesses set is_published = true where id = target_business_id;

  insert into public.public_page_publications (
    business_id, mode, selected_template, selected_palette, published_config, published_by
  ) values (
    target_business_id, page_row.mode, page_row.selected_template, page_row.selected_palette, page_row.published_config, auth.uid()
  );
end;
$$;

create or replace function public.unpublish_public_page()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_business_id uuid := public.current_business_id();
begin
  if target_business_id is null then raise exception 'business not found'; end if;
  update public.businesses set is_published = false where id = target_business_id;
end;
$$;

create or replace function public.get_public_page_config(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select page.published_config
  from public.businesses as business
  join public.business_public_pages as page on page.business_id = business.id
  where business.slug = p_slug
    and business.is_published
    and page.published_config is not null
  limit 1
$$;

revoke all on function public.save_public_page_draft(public.page_configuration_mode, jsonb) from public, anon;
revoke all on function public.publish_public_page() from public, anon;
revoke all on function public.unpublish_public_page() from public, anon;
revoke all on function public.get_public_page_config(text) from public;
grant execute on function public.save_public_page_draft(public.page_configuration_mode, jsonb) to authenticated;
grant execute on function public.publish_public_page() to authenticated;
grant execute on function public.unpublish_public_page() to authenticated;
grant execute on function public.get_public_page_config(text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-page-media', 'public-page-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.media_business_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return split_part(object_name, '/', 1)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

drop policy if exists public_page_media_public_read on storage.objects;
create policy public_page_media_public_read on storage.objects
for select using (bucket_id = 'public-page-media');

drop policy if exists public_page_media_member_insert on storage.objects;
create policy public_page_media_member_insert on storage.objects
for insert to authenticated with check (
  bucket_id = 'public-page-media' and public.is_business_member(public.media_business_id(name))
);

drop policy if exists public_page_media_member_update on storage.objects;
create policy public_page_media_member_update on storage.objects
for update to authenticated
using (bucket_id = 'public-page-media' and public.is_business_member(public.media_business_id(name)))
with check (bucket_id = 'public-page-media' and public.is_business_member(public.media_business_id(name)));

drop policy if exists public_page_media_member_delete on storage.objects;
create policy public_page_media_member_delete on storage.objects
for delete to authenticated
using (bucket_id = 'public-page-media' and public.is_business_member(public.media_business_id(name)));

comment on table public.business_public_pages is
'Keeps editable drafts separate from the immutable snapshot used by the public route.';
