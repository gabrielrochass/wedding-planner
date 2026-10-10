begin;
select plan(7);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'ana@test.local', '{"full_name": "Ana"}'),
  ('33333333-3333-4333-8333-333333333333', 'caio@test.local', '{}');

set local role authenticated;
set local request.jwt.claims = '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated"}';
select public.create_wedding('bbbbbbbb-0000-4000-8000-000000000001', 'Caio', 'Duda', 'civil', '[]', '[]');
insert into public.households (id, wedding_id, name) values
  ('bbbbbbbb-0000-4000-8000-000000000010', 'bbbbbbbb-0000-4000-8000-000000000001', 'Família de outro casamento');

set local request.jwt.claims = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';
select public.create_wedding('aaaaaaaa-0000-4000-8000-000000000001', 'Ana', 'Bruno', 'both', '[]', '[]');
insert into public.households (id, wedding_id, name) values
  ('aaaaaaaa-0000-4000-8000-000000000010', 'aaaaaaaa-0000-4000-8000-000000000001', 'Tia Rita');

select lives_ok(
  $$ insert into public.home_items (wedding_id, room, name, quantity, priority, status, estimate_cents) values
     ('aaaaaaaa-0000-4000-8000-000000000001', 'cozinha', 'Jogo de panelas', 1, 'essential', 'wishlist', 60000) $$,
  'the couple adds an item to the enxoval'
);
select lives_ok(
  $$ update public.home_items set status = 'gifted', household_id = 'aaaaaaaa-0000-4000-8000-000000000010'
     where name = 'Jogo de panelas' $$,
  'a gift is linked to the family that gave it'
);
select throws_ok(
  $$ update public.home_items set household_id = 'bbbbbbbb-0000-4000-8000-000000000010' where name = 'Jogo de panelas' $$,
  '23503', null, 'a gift cannot point to a family from another wedding'
);
select throws_ok(
  $$ insert into public.home_items (wedding_id, room, name) values
     ('aaaaaaaa-0000-4000-8000-000000000001', 'garagem', 'Carro') $$,
  '23514', null, 'items belong to a known room'
);
select throws_ok(
  $$ insert into public.home_items (wedding_id, name, quantity) values
     ('aaaaaaaa-0000-4000-8000-000000000001', 'Copos', 0) $$,
  '23514', null, 'quantity is at least one'
);

delete from public.households where id = 'aaaaaaaa-0000-4000-8000-000000000010';
select is((select household_id from public.home_items where name = 'Jogo de panelas'), null,
  'deleting the family keeps the item and clears who gave it');

set local request.jwt.claims = '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated"}';
select is((select count(*)::int from public.home_items), 0, 'other couples do not see the enxoval');

select * from finish();
rollback;
