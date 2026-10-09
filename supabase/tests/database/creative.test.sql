begin;
select plan(12);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'ana@test.local', '{"full_name": "Ana"}'),
  ('33333333-3333-4333-8333-333333333333', 'caio@test.local', '{}');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';
select public.create_wedding('aaaaaaaa-0000-4000-8000-000000000001', 'Ana', 'Bruno', 'both', '[]', '[]', 'Nós dois');

select lives_ok(
  $$ insert into public.ideas (wedding_id, board, title, url, status, estimate_cents) values
     ('aaaaaaaa-0000-4000-8000-000000000001', 'decoracao', 'Lírios em vaso longo', 'https://pinterest.com/pin/1', 'approved', 50000) $$,
  'the couple saves an idea'
);
select throws_ok(
  $$ insert into public.ideas (wedding_id, title, url) values
     ('aaaaaaaa-0000-4000-8000-000000000001', 'Link perigoso', 'javascript:alert(1)') $$,
  '23514', null, 'idea links must be http'
);
select lives_ok(
  $$ insert into public.songs (wedding_id, moment, title, artist, chosen) values
     ('aaaaaaaa-0000-4000-8000-000000000001', 'primeira-danca', 'Can I Have This Dance', 'High School Musical', true) $$,
  'the couple picks a song for a moment'
);
select throws_ok(
  $$ insert into public.songs (wedding_id, moment, title) values
     ('aaaaaaaa-0000-4000-8000-000000000001', 'karaoke', 'Evidências') $$,
  '23514', null, 'songs belong to a known moment'
);
insert into public.party_members (id, wedding_id, name, role, side, entrance_order) values
  ('aaaaaaaa-0000-4000-8000-000000000010', 'aaaaaaaa-0000-4000-8000-000000000001', 'Lia', 'madrinha', 'a', 0),
  ('aaaaaaaa-0000-4000-8000-000000000011', 'aaaaaaaa-0000-4000-8000-000000000001', 'Rafa', 'padrinho', 'b', 1);
select lives_ok(
  $$ update public.party_members set pair_id = 'aaaaaaaa-0000-4000-8000-000000000011' where name = 'Lia' $$,
  'two people walk in as a pair'
);
select throws_ok(
  $$ update public.party_members set pair_id = id where name = 'Rafa' $$,
  '23514', null, 'nobody pairs with themselves'
);
select lives_ok(
  $$ insert into public.timeline_items (wedding_id, starts_at, ends_at, title) values
     ('aaaaaaaa-0000-4000-8000-000000000001', '16:00', '17:00', 'Cerimônia') $$,
  'the day gets a timeline'
);
select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner) values
     ('ideias', 'aaaaaaaa-0000-4000-8000-000000000001/idea/foto.webp', '11111111-1111-4111-8111-111111111111') $$,
  'members upload photos to their wedding folder'
);

set local request.jwt.claims = '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated"}';
select is((select count(*)::int from public.ideas), 0, 'outsiders do not see ideas');
select is((select count(*)::int from storage.objects where bucket_id = 'ideias'), 0, 'outsiders do not see photos');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner) values
     ('ideias', 'aaaaaaaa-0000-4000-8000-000000000001/idea/invasao.webp', '33333333-3333-4333-8333-333333333333') $$,
  '42501', null, 'outsiders cannot upload into another wedding'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner) values
     ('ideias', 'nao-e-uuid/x.webp', '33333333-3333-4333-8333-333333333333') $$,
  '42501', null, 'photos outside a wedding folder are refused'
);

select * from finish();
rollback;
