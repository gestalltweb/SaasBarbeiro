begin;
select plan(20);

select has_table('public', 'business_public_pages', 'public page configuration table exists');
select has_table('public', 'public_page_publications', 'publication audit exists');
select has_column('public', 'business_public_pages', 'draft_config', 'draft is stored separately');
select has_column('public', 'business_public_pages', 'published_config', 'published snapshot is stored separately');
select row_security_active('public.business_public_pages'::regclass, 'RLS is active on page configuration');
select row_security_active('public.public_page_publications'::regclass, 'RLS is active on publication audit');
select has_function('public', 'save_public_page_draft', array['page_configuration_mode', 'jsonb'], 'secure draft function exists');
select has_function('public', 'publish_public_page', array[]::text[], 'secure publish function exists');
select has_function('public', 'unpublish_public_page', array[]::text[], 'secure unpublish function exists');
select has_function('public', 'get_public_page_config', array['text'], 'public snapshot function exists');
select is((select public from storage.buckets where id = 'public-page-media'), true, 'media bucket supports public published assets');
select is((select file_size_limit from storage.buckets where id = 'public-page-media'), 5242880::bigint, 'media bucket limits files to five megabytes');
select ok((select allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp'] from storage.buckets where id = 'public-page-media'), 'media bucket restricts file types');
select ok(pg_get_functiondef('public.publish_public_page()'::regprocedure) like '%published_config = draft_config%', 'publishing copies the draft snapshot');
select ok(pg_get_functiondef('public.save_public_page_draft(public.page_configuration_mode,jsonb)'::regprocedure) not like '%business_id uuid%', 'draft API accepts no browser supplied business id');
select ok((select qual like '%is_business_member%' from pg_policies where schemaname = 'public' and tablename = 'business_public_pages' and policyname = 'public_pages_member_all'), 'page rows are isolated by business membership');
select ok(pg_get_functiondef('public.unpublish_public_page()'::regprocedure) not like '%published_config = null%', 'unpublishing preserves the last published snapshot');
select ok(pg_get_functiondef('public.publish_public_page()'::regprocedure) not like '%delete from public.services%', 'publishing never deletes operational services');
select ok((select with_check like '%media_business_id%' from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'public_page_media_member_insert'), 'uploads are restricted to the authenticated business folder');
select is((select count(*) from public.business_public_pages), (select count(*) from public.businesses), 'existing businesses receive a safe backfill');

select * from finish();
rollback;
