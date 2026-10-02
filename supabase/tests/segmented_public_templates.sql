begin;
select plan(5);

select ok(exists(select 1 from information_schema.tables where table_schema = 'public' and table_name = 'user_public_page_preferences'), 'user preference table exists');
select ok(exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'user_public_page_preferences' and policyname = 'user_public_page_preferences_own'), 'user preference RLS policy exists');
select ok((select relrowsecurity from pg_class where oid = 'public.user_public_page_preferences'::regclass), 'user preferences use RLS');
select ok(pg_get_functiondef('public.save_public_page_draft(public.page_configuration_mode,jsonb)'::regprocedure) like '%heritage-barber%', 'draft function accepts segmented templates');
select ok(pg_get_functiondef('public.get_public_page_config(text)'::regprocedure) like '%published_config%', 'public route remains limited to the published snapshot');

select * from finish();
rollback;
