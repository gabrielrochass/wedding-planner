begin;
select plan(9);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'ana@test.local', '{"full_name": "Ana"}');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ select public.create_wedding(
       p_id => 'aaaaaaaa-0000-4000-8000-000000000001',
       p_partner_a => 'Ana',
       p_partner_b => 'Bruno',
       p_ceremony => 'both',
       p_tasks => '[{"title": "Contratar o espaço da festa", "area": "fornecedores", "offset_days": 335, "done": true},
                    {"title": "Contratar banda ou DJ", "area": "fornecedores", "offset_days": 270, "done": false}]',
       p_categories => '[]',
       p_date => '2028-02-01',
       p_date_is_estimate => true,
       p_priorities => '{fotos,lua-de-mel}',
       p_planning_as => 'couple'
     ) $$,
  'onboarding answers create the wedding in one call'
);

select is(
  (select date_is_estimate from public.weddings where id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  true, 'an estimated month is kept as an estimate'
);
select is(
  (select priorities from public.weddings where id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  '{fotos,lua-de-mel}'::text[], 'the couple priorities are saved'
);
select is(
  (select count(*)::int from public.tasks where done_at is not null),
  1, 'what was already booked starts done'
);
select is(
  (select planning_as from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'couple', 'the profile remembers who is planning'
);

select throws_ok(
  $$ select public.create_wedding(
       p_id => 'aaaaaaaa-0000-4000-8000-000000000002', p_partner_a => 'Ana', p_partner_b => 'Bruno',
       p_ceremony => 'civil', p_tasks => '[]', p_categories => '[]',
       p_priorities => '{espaco,comida,fotos,musica}'
     ) $$,
  '23514', null, 'at most three priorities'
);

select public.create_wedding(
  p_id => 'aaaaaaaa-0000-4000-8000-000000000003', p_partner_a => 'Ana', p_partner_b => 'Caio',
  p_ceremony => 'civil', p_tasks => '[]', p_categories => '[]',
  p_date_is_estimate => true
);
select is(
  (select date_is_estimate from public.weddings where id = 'aaaaaaaa-0000-4000-8000-000000000003'),
  false, 'without a date there is nothing to estimate'
);

select lives_ok(
  $$ update public.profiles set heard_from = 'instagram' where id = '11111111-1111-4111-8111-111111111111' $$,
  'people tell how they found the app'
);
select throws_ok(
  $$ update public.profiles set planning_as = 'planner' where id = '11111111-1111-4111-8111-111111111111' $$,
  '42501', null, 'who is planning is set only by the onboarding'
);

select * from finish();
rollback;
