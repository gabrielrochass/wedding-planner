begin;
select plan(33);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'ana@test.local', '{"full_name": "Ana"}'),
  ('22222222-2222-4222-8222-222222222222', 'bia@test.local', '{"full_name": "Bia"}'),
  ('33333333-3333-4333-8333-333333333333', 'caio@test.local', '{}'),
  ('44444444-4444-4444-8444-444444444444', 'duda@test.local', '{}');

select is((select display_name from public.profiles where id = '11111111-1111-4111-8111-111111111111'), 'Ana',
  'new users get a profile with their name');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';

select is(
  public.create_wedding('aaaaaaaa-0000-4000-8000-000000000001', 'Ana', 'Bruno', 'both',
    '[{"title": "Contratar o espaço", "area": "fornecedores", "offset_days": 330, "notes": null, "template_key": null},
      {"title": "Dar entrada na habilitação", "area": "documentos", "offset_days": 80, "notes": "Vale 90 dias", "template_key": "habilitacao"}]',
    '[{"name": "Espaço", "icon": "building", "planned_cents": 1500000}, {"name": "Buffet", "icon": "utensils", "planned_cents": 3000000}]',
    'Nós dois', p_date => '2028-02-20', p_city => 'Recife', p_guest_estimate => 150, p_budget_cents => 8000000),
  'aaaaaaaa-0000-4000-8000-000000000001'::uuid,
  'the couple creates a wedding'
);
select is((select count(*)::int from public.tasks), 2, 'starter tasks are created');
select is((select string_agg(name, ',' order by sort_order) from public.budget_categories), 'Espaço,Buffet',
  'starter budget categories keep their order');
select is((select current_wedding_id from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'aaaaaaaa-0000-4000-8000-000000000001'::uuid, 'the new wedding becomes the current one');
select is(
  public.create_wedding('aaaaaaaa-0000-4000-8000-000000000001', 'Ana', 'Bruno', 'both', '[]', '[]', 'Nós dois'),
  'aaaaaaaa-0000-4000-8000-000000000001'::uuid,
  'creating the same wedding again is a no-op'
);
select is((select count(*)::int from public.tasks), 2, 'a repeated create does not duplicate starter tasks');

select lives_ok(
  $$ insert into public.households (id, wedding_id, name, side, list) values
     ('aaaaaaaa-0000-4000-8000-000000000010', 'aaaaaaaa-0000-4000-8000-000000000001', 'Família Souza', 'a', 'a') $$,
  'the couple adds a household'
);
select lives_ok(
  $$ insert into public.guests (wedding_id, household_id, name, age_band) values
     ('aaaaaaaa-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000010', 'Rita', 'adult'),
     ('aaaaaaaa-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000010', 'Theo', 'child') $$,
  'the couple adds guests to the household'
);

insert into public.vendors (id, wedding_id, name, quote_cents) values
  ('aaaaaaaa-0000-4000-8000-000000000020', 'aaaaaaaa-0000-4000-8000-000000000001', 'Sítio das Flores', 1800000);

select lives_ok(
  $$ select public.hire_vendor('aaaaaaaa-0000-4000-8000-000000000020', 'aaaaaaaa-0000-4000-8000-000000000021',
       (select id from public.budget_categories where name = 'Espaço'), 'Sítio das Flores', 1800000,
       '[{"id": "aaaaaaaa-0000-4000-8000-000000000022", "amount_cents": 600000, "due_on": "2027-03-10", "installment_number": 1, "installment_count": 3, "note": null},
         {"id": "aaaaaaaa-0000-4000-8000-000000000023", "amount_cents": 600000, "due_on": "2027-04-10", "installment_number": 2, "installment_count": 3, "note": null},
         {"id": "aaaaaaaa-0000-4000-8000-000000000024", "amount_cents": 600000, "due_on": "2027-05-10", "installment_number": 3, "installment_count": 3, "note": null}]') $$,
  'hiring a vendor creates the expense and its payments'
);
select is((select status::text from public.vendors where id = 'aaaaaaaa-0000-4000-8000-000000000020'), 'hired',
  'the vendor is marked as hired');
select is((select sum(amount_cents)::bigint from public.payments where expense_id = 'aaaaaaaa-0000-4000-8000-000000000021'),
  1800000::bigint, 'the payments add up to the contract');
select public.hire_vendor('aaaaaaaa-0000-4000-8000-000000000020', 'aaaaaaaa-0000-4000-8000-000000000021',
  (select id from public.budget_categories where name = 'Espaço'), 'Sítio das Flores', 1800000,
  '[{"id": "aaaaaaaa-0000-4000-8000-000000000025", "amount_cents": 1800000, "due_on": "2027-03-10", "installment_number": null, "installment_count": null, "note": null}]');
select is((select count(*)::int from public.payments where expense_id = 'aaaaaaaa-0000-4000-8000-000000000021'), 3,
  'hiring again does not duplicate payments');
select is((select updated_by from public.vendors where id = 'aaaaaaaa-0000-4000-8000-000000000020'),
  '11111111-1111-4111-8111-111111111111'::uuid, 'changes record who made them');

select ok(public.create_invite('aaaaaaaa-0000-4000-8000-000000000001', 'couple') ~ '^[0-9a-f]{48}$',
  'the couple creates an invite link token');

reset role;
create temporary table tokens (role text, token text);
grant all on tokens to authenticated;
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';
insert into tokens values
  ('couple', public.create_invite('aaaaaaaa-0000-4000-8000-000000000001', 'couple')),
  ('helper', public.create_invite('aaaaaaaa-0000-4000-8000-000000000001', 'helper')),
  ('viewer', public.create_invite('aaaaaaaa-0000-4000-8000-000000000001', 'viewer'));

set local request.jwt.claims = '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated"}';
select is((select count(*)::int from public.weddings), 0, 'outsiders do not see the wedding');
select is((select count(*)::int from public.guests), 0, 'outsiders do not see guests');
select is((select count(*)::int from public.payments), 0, 'outsiders do not see payments');
select throws_ok(
  $$ insert into public.tasks (wedding_id, title) values ('aaaaaaaa-0000-4000-8000-000000000001', 'Invasão') $$,
  '42501', null, 'outsiders cannot add tasks'
);
select is((select partner_b from public.invite_preview((select token from tokens where role = 'helper'))), 'Bruno',
  'an invite shows whose wedding it is');
select is(public.accept_invite((select token from tokens where role = 'helper')),
  'aaaaaaaa-0000-4000-8000-000000000001'::uuid, 'a helper accepts the invite');
select lives_ok(
  $$ update public.guests set rsvp = 'yes' where name = 'Rita' $$,
  'helpers can update guests'
);
select is((select rsvp::text from public.guests where name = 'Rita'), 'yes', 'the helper update is saved');
update public.payments set paid_on = '2027-03-10';
select is((select count(*)::int from public.payments where paid_on is not null), 0, 'helpers cannot change payments');
select throws_ok(
  $$ select public.create_invite('aaaaaaaa-0000-4000-8000-000000000001', 'planner') $$,
  '42501', null, 'helpers cannot invite people'
);

set local request.jwt.claims = '{"sub": "44444444-4444-4444-8444-444444444444", "role": "authenticated"}';
select lives_ok($$ select public.accept_invite((select token from tokens where role = 'viewer')) $$,
  'a viewer accepts the invite');
update public.tasks set done_at = now();
select is((select count(*)::int from public.tasks where done_at is not null), 0, 'viewers cannot change tasks');
select throws_ok(
  $$ select public.accept_invite((select token from tokens where role = 'helper')) $$,
  'P0002', null, 'an invite accepted by someone else cannot be reused'
);

set local request.jwt.claims = '{"sub": "22222222-2222-4222-8222-222222222222", "role": "authenticated"}';
select lives_ok($$ select public.accept_invite((select token from tokens where role = 'couple')) $$,
  'the partner joins as couple');
select is((select count(*)::int from public.wedding_people('aaaaaaaa-0000-4000-8000-000000000001')), 4,
  'members see everyone in the wedding');

set local request.jwt.claims = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';
delete from public.wedding_members where user_id = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub": "22222222-2222-4222-8222-222222222222", "role": "authenticated"}';
select is((select count(*)::int from public.weddings), 1, 'the wedding stays while someone from the couple remains');

reset role;
select lives_ok(
  $$ delete from auth.users where id = '22222222-2222-4222-8222-222222222222' $$,
  'the last partner deletes the account'
);
select is((select count(*)::int from public.weddings where id = 'aaaaaaaa-0000-4000-8000-000000000001'), 0,
  'a wedding without anyone from the couple is deleted with its data');

select * from finish();
rollback;
