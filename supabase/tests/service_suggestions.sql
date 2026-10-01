begin;
select plan(18);

select has_table('public', 'service_suggestion_catalog', 'suggestion catalog exists');
select has_column('public', 'services', 'suggestion_key', 'services retain a stable suggestion key');
select has_function('public', 'add_suggested_services', array[]::text[], 'authenticated suggestion function exists');
select has_function('public', 'insert_missing_suggested_services', array['uuid'], 'internal idempotent helper exists');

select is((select count(*)::integer from public.service_suggestion_catalog where segment = 'barbershop'), 6, 'barbershop has six suggestions');
select is((select count(*)::integer from public.service_suggestion_catalog where segment = 'hair_salon'), 6, 'hair salon has six suggestions');
select is((select count(*)::integer from public.service_suggestion_catalog where segment = 'aesthetics'), 6, 'aesthetics has six suggestions');
select is((select count(*)::integer from public.service_suggestion_catalog where segment = 'other'), 0, 'other has no suggestions');
select is((select price_cents from public.service_suggestion_catalog where segment = 'barbershop' and suggestion_key = 'haircut-and-beard'), 6500, 'barbershop price is stored in cents');
select is((select price_cents from public.service_suggestion_catalog where segment = 'hair_salon' and suggestion_key = 'coloring'), 15000, 'salon price is stored in cents');
select like(
  pg_get_functiondef('public.create_business(text,text,public.business_segment)'::regprocedure),
  '%exception when others%',
  'onboarding contains a controlled fallback when suggestion creation fails'
);

insert into public.businesses (id, name, slug, segment)
values ('10000000-0000-0000-0000-000000000003', 'Other Business', 'other-business-suggestions', 'other');
select is(public.insert_missing_suggested_services('10000000-0000-0000-0000-000000000003'), 0, 'other receives no automatic services');

insert into public.businesses (id, name, slug, segment)
values ('10000000-0000-0000-0000-000000000001', 'Test Barber', 'test-barber-suggestions', 'barbershop');

select is(public.insert_missing_suggested_services('10000000-0000-0000-0000-000000000001'), 6, 'first operation inserts all suggestions');
select is(public.insert_missing_suggested_services('10000000-0000-0000-0000-000000000001'), 0, 'second operation is idempotent');
select is((select count(*)::integer from public.services where business_id = '10000000-0000-0000-0000-000000000001'), 6, 'all inserted services belong to the target business');

update public.services set price_cents = 9999, duration_minutes = 75, name = 'Meu corte especial'
where business_id = '10000000-0000-0000-0000-000000000001' and suggestion_key = 'male-haircut';
select is(public.insert_missing_suggested_services('10000000-0000-0000-0000-000000000001'), 0, 'customized suggested service is not recreated');
select results_eq(
  $$select price_cents, duration_minutes, name from public.services where business_id = '10000000-0000-0000-0000-000000000001' and suggestion_key = 'male-haircut'$$,
  $$values (9999, 75, 'Meu corte especial'::text)$$,
  'customized values are preserved'
);

insert into public.businesses (id, name, slug, segment)
values ('10000000-0000-0000-0000-000000000002', 'Legacy Barber', 'legacy-barber-suggestions', 'barbershop');
insert into public.services (business_id, name, description, duration_minutes, price_cents)
values ('10000000-0000-0000-0000-000000000002', 'Corte masculino', 'Personalizado', 90, 12345);
select is(public.insert_missing_suggested_services('10000000-0000-0000-0000-000000000002'), 5, 'legacy service name prevents a duplicate');

select * from finish();
rollback;
