begin;
select plan(8);

select has_table('public', 'businesses', 'businesses exists');
select has_table('public', 'business_members', 'business_members exists');
select row_security_active('public.businesses'::regclass, 'RLS active on businesses');
select row_security_active('public.business_members'::regclass, 'RLS active on memberships');
select has_function('public', 'create_business', array['text', 'text', 'business_segment'], 'atomic tenant creation exists');
select has_column('public', 'business_members', 'business_id', 'membership scopes a business');
select has_column('public', 'business_members', 'user_id', 'membership scopes a user');
select col_is_pk('public', 'business_members', array['business_id', 'user_id'], 'duplicate memberships are impossible');

select * from finish();
rollback;
