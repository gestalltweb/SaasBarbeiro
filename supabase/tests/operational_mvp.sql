begin;
select plan(18);

select has_table('public', 'services', 'services exists');
select has_table('public', 'professionals', 'professionals exists');
select has_table('public', 'professional_services', 'professional service links exist');
select has_table('public', 'business_hours', 'business hours exist');
select has_table('public', 'professional_hours', 'professional hours exist');
select has_table('public', 'unavailabilities', 'unavailabilities exist');
select has_table('public', 'clients', 'clients exist');
select has_table('public', 'appointments', 'appointments exist');

select row_security_active('public.services'::regclass, 'RLS active on services');
select row_security_active('public.professionals'::regclass, 'RLS active on professionals');
select row_security_active('public.business_hours'::regclass, 'RLS active on business hours');
select row_security_active('public.professional_hours'::regclass, 'RLS active on professional hours');
select row_security_active('public.clients'::regclass, 'RLS active on clients');
select row_security_active('public.appointments'::regclass, 'RLS active on appointments');

select has_function('public', 'get_available_slots', array['text', 'uuid', 'uuid', 'date'], 'availability function exists');
select has_function('public', 'create_public_appointment', array['text', 'uuid', 'uuid', 'timestamp with time zone', 'text', 'text', 'text'], 'atomic booking function exists');
select has_function('public', 'get_booking_confirmation', array['uuid'], 'public confirmation function exists');
select has_column('public', 'appointments', 'public_token', 'appointment confirmation token exists');

select * from finish();
rollback;
