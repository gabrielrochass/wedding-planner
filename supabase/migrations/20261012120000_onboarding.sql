alter table public.weddings
  add column date_is_estimate boolean not null default false,
  add column priorities text[] not null default '{}' check (
    cardinality(priorities) <= 3
    and priorities <@ array['espaco', 'comida', 'fotos', 'decoracao', 'musica', 'traje', 'doces', 'lua-de-mel']
  );

alter table public.profiles
  add column planning_as text check (planning_as in ('couple', 'planner', 'family')),
  add column heard_from text check (heard_from in ('instagram', 'tiktok', 'google', 'friends', 'vendor', 'other'));

grant update (date_is_estimate) on public.weddings to authenticated;

alter table public.payments drop column contributor_id;
drop table public.contributors;
grant update (heard_from) on public.profiles to authenticated;

drop function public.create_wedding(uuid, text, text, public.ceremony_kind, jsonb, jsonb, text, date, text, integer, bigint);

create function public.create_wedding(
  p_id uuid,
  p_partner_a text,
  p_partner_b text,
  p_ceremony public.ceremony_kind,
  p_tasks jsonb,
  p_categories jsonb,
  p_date date default null,
  p_city text default null,
  p_guest_estimate integer default null,
  p_budget_cents bigint default null,
  p_date_is_estimate boolean default false,
  p_priorities text[] default '{}',
  p_planning_as text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if exists (select 1 from public.weddings where id = p_id) then
    if exists (select 1 from public.wedding_members where wedding_id = p_id and user_id = v_user) then
      return p_id;
    end if;
    raise exception 'wedding id taken' using errcode = '23505';
  end if;

  if (select count(*) from public.wedding_members where user_id = v_user and role = 'couple') >= 5 then
    raise exception 'weddings limit reached' using errcode = '54000';
  end if;
  if jsonb_array_length(p_tasks) > 200 or jsonb_array_length(p_categories) > 40 then
    raise exception 'too many starter items' using errcode = '22023';
  end if;

  insert into public.weddings (
    id, partner_a, partner_b, wedding_date, date_is_estimate, city, ceremony, guest_estimate, budget_cents,
    priorities, created_by
  )
  values (
    p_id, p_partner_a, p_partner_b, p_date, p_date is not null and p_date_is_estimate, p_city, p_ceremony,
    p_guest_estimate, p_budget_cents, p_priorities, v_user
  );

  insert into public.wedding_members (wedding_id, user_id, role) values (p_id, v_user, 'couple');

  insert into public.tasks (wedding_id, title, notes, area, offset_days, template_key, done_at)
  select p_id, t.title, t.notes, t.area, t.offset_days, t.template_key, case when t.done then now() end
  from jsonb_to_recordset(p_tasks) as t(
    title text, notes text, area text, offset_days integer, template_key text, done boolean
  );

  insert into public.budget_categories (wedding_id, name, icon, planned_cents, sort_order)
  select p_id, c.value ->> 'name', c.value ->> 'icon', (c.value ->> 'planned_cents')::bigint, (c.ord - 1)::smallint
  from jsonb_array_elements(p_categories) with ordinality as c(value, ord);

  update public.profiles
  set current_wedding_id = p_id, planning_as = coalesce(p_planning_as, planning_as)
  where id = v_user;

  return p_id;
end;
$$;

grant execute on function public.create_wedding(
  uuid, text, text, public.ceremony_kind, jsonb, jsonb, date, text, integer, bigint, boolean, text[], text
) to authenticated;
