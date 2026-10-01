-- Additive v2 template compatibility and cover-video support.
-- Existing drafts, published snapshots and publication history remain byte-for-byte unchanged.

alter table public.business_public_pages
  drop constraint if exists business_public_pages_selected_template_check;

alter table public.business_public_pages
  add constraint business_public_pages_selected_template_check
  check (
    selected_template is null or selected_template in (
      'noir', 'editorial', 'botanical', 'urban',
      'noir-atelier', 'maison-editorial', 'botanical-ritual', 'clinical-luxe', 'urban-signal'
    )
  );

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
  if octet_length(p_config::text) > 500000 then raise exception 'config too large'; end if;
  if template_name is not null and template_name not in (
    'noir', 'editorial', 'botanical', 'urban',
    'noir-atelier', 'maison-editorial', 'botanical-ritual', 'clinical-luxe', 'urban-signal'
  ) then raise exception 'invalid template'; end if;

  insert into public.business_public_pages (business_id, mode, selected_template, selected_palette, draft_config)
  values (target_business_id, p_mode, template_name, palette_name, p_config)
  on conflict (business_id) do update set
    mode = excluded.mode,
    selected_template = excluded.selected_template,
    selected_palette = excluded.selected_palette,
    draft_config = excluded.draft_config;
end;
$$;

revoke all on function public.save_public_page_draft(public.page_configuration_mode, jsonb) from public, anon;
grant execute on function public.save_public_page_draft(public.page_configuration_mode, jsonb) to authenticated;

update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
where id = 'public-page-media';

comment on constraint business_public_pages_selected_template_check on public.business_public_pages is
'Accepts legacy template ids for existing snapshots and the five independent v2 landing-page templates.';
