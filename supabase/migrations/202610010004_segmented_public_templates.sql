-- Segment-aware template catalogue and per-user editor preferences.
-- This migration is additive: drafts, published snapshots and history are kept intact.

alter table public.business_public_pages
  drop constraint if exists business_public_pages_selected_template_check;

alter table public.business_public_pages
  add constraint business_public_pages_selected_template_check
  check (
    selected_template is null or selected_template in (
      'noir', 'editorial', 'botanical', 'urban',
      'noir-atelier', 'maison-editorial', 'botanical-ritual', 'clinical-luxe', 'urban-signal',
      'heritage-barber', 'minimal-cut', 'garage-club',
      'soft-glam', 'color-studio', 'minimal-beauty', 'celebrity-hair',
      'skin-laboratory', 'spa-serenity', 'sculpt-studio',
      'professional-studio', 'local-premium', 'creative-portfolio', 'modern-service', 'personal-brand'
    )
  );

create table if not exists public.user_public_page_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dismiss_template_change_notice boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_public_page_preferences enable row level security;

drop policy if exists user_public_page_preferences_own on public.user_public_page_preferences;
create policy user_public_page_preferences_own
on public.user_public_page_preferences
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update, delete on public.user_public_page_preferences to authenticated;

create or replace function public.save_public_page_draft(
  p_mode public.page_configuration_mode,
  p_config jsonb
)
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
    'noir-atelier', 'maison-editorial', 'botanical-ritual', 'clinical-luxe', 'urban-signal',
    'heritage-barber', 'minimal-cut', 'garage-club',
    'soft-glam', 'color-studio', 'minimal-beauty', 'celebrity-hair',
    'skin-laboratory', 'spa-serenity', 'sculpt-studio',
    'professional-studio', 'local-premium', 'creative-portfolio', 'modern-service', 'personal-brand'
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

comment on table public.user_public_page_preferences is
'Per-user editor preferences only. It never stores business or public-page operational data.';
