begin;
select plan(8);

select col_is_null('public', 'business_public_pages', 'selected_template', 'template selection remains optional');
select ok(exists(select 1 from pg_constraint where conname = 'business_public_pages_selected_template_check' and conrelid = 'public.business_public_pages'::regclass), 'template compatibility constraint exists');
select ok(pg_get_functiondef('public.save_public_page_draft(public.page_configuration_mode,jsonb)'::regprocedure) like '%clinical-luxe%', 'draft function accepts Clinical Luxe');
select ok(pg_get_functiondef('public.save_public_page_draft(public.page_configuration_mode,jsonb)'::regprocedure) not like '%p_business_id%', 'draft function still derives the business from the session');
select is((select file_size_limit from storage.buckets where id = 'public-page-media'), 20971520::bigint, 'media bucket accepts optimized cover videos');
select ok((select allowed_mime_types @> array['video/mp4', 'video/webm'] from storage.buckets where id = 'public-page-media'), 'cover video MIME types are allowlisted');
select ok(pg_get_functiondef('public.publish_public_page()'::regprocedure) like '%published_config = draft_config%', 'draft and published snapshots remain separate');
select ok(pg_get_functiondef('public.create_public_appointment(text,uuid,uuid,timestamptz,text,text,text)'::regprocedure) like '%slot_unavailable%', 'conflict-safe public booking remains installed');

select * from finish();
rollback;
