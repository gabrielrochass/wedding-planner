create extension if not exists pgcrypto with schema extensions;

alter default privileges in schema public revoke all on tables from anon, authenticated, service_role;
alter default privileges in schema public revoke all on sequences from anon, authenticated, service_role;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated, service_role;
alter default privileges revoke execute on functions from public;

create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create type public.member_role as enum ('couple', 'planner', 'helper', 'viewer');
create type public.ceremony_kind as enum ('civil', 'religious', 'both');

create domain public.label as text
  check (char_length(value) between 1 and 80 and value = btrim(value) and value !~ '[[:cntrl:]]');

create domain public.long_text as text
  check (char_length(value) <= 2000);

create function private.today_sp()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  partner_a text not null check (char_length(partner_a) between 1 and 40 and partner_a = btrim(partner_a) and partner_a !~ '[[:cntrl:]]'),
  partner_b text not null check (char_length(partner_b) between 1 and 40 and partner_b = btrim(partner_b) and partner_b !~ '[[:cntrl:]]'),
  wedding_date date check (wedding_date between date '2000-01-01' and date '2100-12-31'),
  city text check (char_length(city) between 1 and 80 and city = btrim(city)),
  ceremony public.ceremony_kind not null default 'both',
  guest_estimate integer check (guest_estimate between 1 and 5000),
  budget_cents bigint check (budget_cents between 1 and 9999999999),
  contingency_percent smallint not null default 10 check (contingency_percent between 0 and 50),
  motto text check (char_length(motto) between 1 and 200 and motto = btrim(motto)),
  created_by uuid default auth.uid() references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table public.wedding_members (
  wedding_id uuid not null references public.weddings on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role public.member_role not null,
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id)
);

create index wedding_members_user_idx on public.wedding_members (user_id);

create table public.wedding_invites (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  token_hash bytea not null unique,
  role public.member_role not null,
  created_by uuid default auth.uid() references auth.users on delete set null,
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_by uuid references auth.users on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index wedding_invites_wedding_idx on public.wedding_invites (wedding_id);

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  current_wedding_id uuid references public.weddings on delete set null,
  created_at timestamptz not null default now()
);

create function private.member_role(p_wedding uuid)
returns public.member_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.wedding_members
  where wedding_id = p_wedding and user_id = (select auth.uid())
$$;

create function private.can_edit(p_wedding uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(private.member_role(p_wedding) in ('couple', 'planner'), false)
$$;

create function private.can_help(p_wedding uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(private.member_role(p_wedding) in ('couple', 'planner', 'helper'), false)
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create function private.enforce_wedding_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  total integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(tg_table_name || new.wedding_id::text, 0));
  execute format('select count(*) from %I.%I where wedding_id = $1', tg_table_schema, tg_table_name)
    into total using new.wedding_id;
  if total >= tg_argv[0]::integer then
    raise exception '% limit reached', tg_table_name using errcode = '54000';
  end if;
  return new;
end;
$$;

create trigger wedding_members_quota
  before insert on public.wedding_members
  for each row execute function private.enforce_wedding_quota('20');

create trigger wedding_invites_quota
  before insert on public.wedding_invites
  for each row execute function private.enforce_wedding_quota('100');

create function private.keep_a_couple()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'couple' and new.role <> 'couple' and not exists (
    select 1 from public.wedding_members
    where wedding_id = old.wedding_id and role = 'couple' and user_id <> old.user_id
  ) then
    raise exception 'a wedding needs someone from the couple' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger wedding_members_keep_couple
  before update of role on public.wedding_members
  for each row execute function private.keep_a_couple();

create function private.drop_orphan_wedding()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.weddings w
  where w.id = old.wedding_id
    and not exists (
      select 1 from public.wedding_members
      where wedding_id = old.wedding_id and role = 'couple'
    );
  return null;
end;
$$;

create trigger wedding_members_drop_orphan
  after delete on public.wedding_members
  for each row execute function private.drop_orphan_wedding();

revoke all on function private.handle_new_user() from public;
revoke all on function private.keep_a_couple() from public;
revoke all on function private.drop_orphan_wedding() from public;
revoke all on function private.enforce_wedding_quota() from public;

create function public.wedding_people(p_wedding uuid)
returns table (user_id uuid, display_name text, role public.member_role, joined_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id, p.display_name, m.role, m.created_at
  from public.wedding_members m
  left join public.profiles p on p.id = m.user_id
  where m.wedding_id = p_wedding and private.member_role(p_wedding) is not null
  order by m.created_at
$$;

create function public.create_invite(p_wedding uuid, p_role public.member_role)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  if private.member_role(p_wedding) is distinct from 'couple' then
    raise exception 'only the couple can invite' using errcode = '42501';
  end if;
  insert into public.wedding_invites (wedding_id, token_hash, role, created_by)
  values (p_wedding, extensions.digest(v_token, 'sha256'), p_role, auth.uid());
  return v_token;
end;
$$;

create function public.invite_preview(p_token text)
returns table (partner_a text, partner_b text, role public.member_role, already_member boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select w.partner_a, w.partner_b, i.role,
    exists (select 1 from public.wedding_members m where m.wedding_id = w.id and m.user_id = (select auth.uid()))
  from public.wedding_invites i
  join public.weddings w on w.id = i.wedding_id
  where i.token_hash = extensions.digest(p_token, 'sha256')
    and i.expires_at > now()
    and (i.accepted_by is null or i.accepted_by = (select auth.uid()))
    and (select auth.uid()) is not null
$$;

create function public.accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.wedding_invites;
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_invite from public.wedding_invites
  where token_hash = extensions.digest(p_token, 'sha256')
  for update;

  if not found
    or v_invite.expires_at <= now()
    or (v_invite.accepted_by is not null and v_invite.accepted_by <> v_user) then
    raise exception 'invalid invite' using errcode = 'P0002';
  end if;

  insert into public.wedding_members (wedding_id, user_id, role)
  values (v_invite.wedding_id, v_user, v_invite.role)
  on conflict (wedding_id, user_id) do nothing;

  update public.wedding_invites
  set accepted_by = v_user, accepted_at = coalesce(accepted_at, now())
  where id = v_invite.id;

  update public.profiles set current_wedding_id = v_invite.wedding_id where id = v_user;

  return v_invite.wedding_id;
end;
$$;

alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.wedding_invites enable row level security;
alter table public.profiles enable row level security;

create policy "members read" on public.weddings
  for select to authenticated
  using (private.member_role(id) is not null);

create policy "editors update" on public.weddings
  for update to authenticated
  using (private.can_edit(id))
  with check (private.can_edit(id));

create policy "couple deletes" on public.weddings
  for delete to authenticated
  using (private.member_role(id) = 'couple');

create policy "members read" on public.wedding_members
  for select to authenticated
  using (private.member_role(wedding_id) is not null);

create policy "couple changes roles" on public.wedding_members
  for update to authenticated
  using (private.member_role(wedding_id) = 'couple')
  with check (private.member_role(wedding_id) = 'couple');

create policy "leave or remove" on public.wedding_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or private.member_role(wedding_id) = 'couple');

create policy "couple reads invites" on public.wedding_invites
  for select to authenticated
  using (private.member_role(wedding_id) = 'couple');

create policy "couple revokes invites" on public.wedding_invites
  for delete to authenticated
  using (private.member_role(wedding_id) = 'couple');

create policy "own profile" on public.profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and (current_wedding_id is null or private.member_role(current_wedding_id) is not null)
  );

grant select on public.weddings to authenticated;
grant update (partner_a, partner_b, wedding_date, city, ceremony, guest_estimate, budget_cents, contingency_percent, motto)
  on public.weddings to authenticated;
grant delete on public.weddings to authenticated;

grant select, delete on public.wedding_members to authenticated;
grant update (role) on public.wedding_members to authenticated;

grant select (id, wedding_id, role, created_by, expires_at, accepted_by, accepted_at, created_at), delete
  on public.wedding_invites to authenticated;

grant select on public.profiles to authenticated;
grant update (display_name, current_wedding_id) on public.profiles to authenticated;

grant execute on function private.today_sp() to authenticated;
grant execute on function private.member_role(uuid) to authenticated;
grant execute on function private.can_edit(uuid) to authenticated;
grant execute on function private.can_help(uuid) to authenticated;
grant execute on function public.wedding_people(uuid) to authenticated;
grant execute on function public.create_invite(uuid, public.member_role) to authenticated;
grant execute on function public.invite_preview(text) to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
