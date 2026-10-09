create type public.payment_method as enum ('pix', 'boleto', 'card', 'cash', 'transfer');
create type public.vendor_status as enum ('researching', 'quoted', 'visiting', 'favorite', 'hired', 'discarded');
create type public.guest_side as enum ('a', 'b', 'both');
create type public.guest_list as enum ('pending', 'a', 'b', 'out');
create type public.age_band as enum ('adult', 'teen', 'child', 'baby');
create type public.rsvp_status as enum ('pending', 'yes', 'no');

create domain public.task_area as text
  check (value in (
    'geral', 'cerimonia', 'documentos', 'festa', 'fornecedores', 'convidados',
    'traje', 'beleza', 'papelaria', 'padrinhos', 'lua-de-mel', 'depois'
  ));

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name text not null check (char_length(name) between 1 and 40 and name = btrim(name) and name !~ '[[:cntrl:]]'),
  icon text not null check (char_length(icon) between 1 and 40),
  planned_cents bigint check (planned_cents between 0 and 9999999999),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (id, wedding_id)
);

create unique index budget_categories_name_key on public.budget_categories (wedding_id, lower(name));

create table public.contributors (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name text not null check (char_length(name) between 1 and 40 and name = btrim(name) and name !~ '[[:cntrl:]]'),
  promised_cents bigint check (promised_cents between 1 and 9999999999),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (id, wedding_id)
);

create unique index contributors_name_key on public.contributors (wedding_id, lower(name));

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  category_id uuid,
  name public.label not null,
  status public.vendor_status not null default 'researching',
  contact_name text check (char_length(contact_name) <= 80),
  phone text check (char_length(phone) <= 30),
  email text check (char_length(email) <= 120),
  instagram text check (char_length(instagram) <= 80),
  website text check (char_length(website) <= 300),
  quote_cents bigint check (quote_cents between 1 and 9999999999),
  quote_details public.long_text,
  capacity integer check (capacity between 1 and 10000),
  rating smallint check (rating between 1 and 5),
  visit_on date check (visit_on between date '2000-01-01' and date '2100-12-31'),
  notes public.long_text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id),
  foreign key (category_id, wedding_id) references public.budget_categories (id, wedding_id)
    on delete set null (category_id)
);

create index vendors_wedding_idx on public.vendors (wedding_id, status);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  category_id uuid not null,
  vendor_id uuid,
  title public.label not null,
  estimated_cents bigint check (estimated_cents between 0 and 9999999999),
  contracted_cents bigint check (contracted_cents between 0 and 9999999999),
  notes public.long_text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id),
  foreign key (category_id, wedding_id) references public.budget_categories (id, wedding_id),
  foreign key (vendor_id, wedding_id) references public.vendors (id, wedding_id) on delete set null (vendor_id)
);

create index expenses_wedding_idx on public.expenses (wedding_id, category_id);
create unique index expenses_vendor_key on public.expenses (vendor_id) where vendor_id is not null;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  expense_id uuid not null,
  amount_cents bigint not null check (amount_cents between 1 and 9999999999),
  due_on date not null check (due_on between date '2000-01-01' and date '2100-12-31'),
  paid_on date check (paid_on between date '2000-01-01' and date '2100-12-31'),
  method public.payment_method,
  contributor_id uuid,
  installment_number smallint check (installment_number between 1 and 120),
  installment_count smallint check (installment_count between 1 and 120),
  note text check (char_length(note) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  foreign key (expense_id, wedding_id) references public.expenses (id, wedding_id) on delete cascade,
  foreign key (contributor_id, wedding_id) references public.contributors (id, wedding_id) on delete set null (contributor_id),
  check (installment_number <= installment_count)
);

create index payments_wedding_idx on public.payments (wedding_id, due_on);
create index payments_expense_idx on public.payments (expense_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  title text not null check (char_length(title) between 1 and 120 and title = btrim(title) and title !~ '[[:cntrl:]]'),
  notes public.long_text,
  area public.task_area not null default 'geral',
  offset_days integer check (offset_days between -400 and 1200),
  due_on date check (due_on between date '2000-01-01' and date '2100-12-31'),
  assignee_id uuid references auth.users on delete set null,
  assignee_label text check (char_length(assignee_label) between 1 and 40),
  vendor_id uuid,
  template_key text check (char_length(template_key) <= 40),
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id),
  foreign key (vendor_id, wedding_id) references public.vendors (id, wedding_id) on delete set null (vendor_id)
);

create index tasks_wedding_idx on public.tasks (wedding_id);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name public.label not null,
  side public.guest_side not null default 'both',
  list public.guest_list not null default 'a',
  phone text check (char_length(phone) <= 30),
  address text check (char_length(address) <= 300),
  notes public.long_text,
  save_the_date_on date check (save_the_date_on between date '2000-01-01' and date '2100-12-31'),
  invited_on date check (invited_on between date '2000-01-01' and date '2100-12-31'),
  gift text check (char_length(gift) <= 120),
  thanked_on date check (thanked_on between date '2000-01-01' and date '2100-12-31'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id)
);

create index households_wedding_idx on public.households (wedding_id, list);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  household_id uuid not null,
  name public.label not null,
  age_band public.age_band not null default 'adult',
  rsvp public.rsvp_status not null default 'pending',
  is_plus_one boolean not null default false,
  dietary text check (char_length(dietary) <= 120),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  foreign key (household_id, wedding_id) references public.households (id, wedding_id) on delete cascade
);

create index guests_household_idx on public.guests (household_id);
create index guests_wedding_idx on public.guests (wedding_id);

create trigger vendors_touch before update on public.vendors for each row execute function private.touch();
create trigger expenses_touch before update on public.expenses for each row execute function private.touch();
create trigger payments_touch before update on public.payments for each row execute function private.touch();
create trigger tasks_touch before update on public.tasks for each row execute function private.touch();
create trigger households_touch before update on public.households for each row execute function private.touch();
create trigger guests_touch before update on public.guests for each row execute function private.touch();

create trigger budget_categories_quota before insert on public.budget_categories
  for each row execute function private.enforce_wedding_quota('60');
create trigger contributors_quota before insert on public.contributors
  for each row execute function private.enforce_wedding_quota('20');
create trigger vendors_quota before insert on public.vendors
  for each row execute function private.enforce_wedding_quota('500');
create trigger expenses_quota before insert on public.expenses
  for each row execute function private.enforce_wedding_quota('500');
create trigger payments_quota before insert on public.payments
  for each row execute function private.enforce_wedding_quota('3000');
create trigger tasks_quota before insert on public.tasks
  for each row execute function private.enforce_wedding_quota('600');
create trigger households_quota before insert on public.households
  for each row execute function private.enforce_wedding_quota('1500');
create trigger guests_quota before insert on public.guests
  for each row execute function private.enforce_wedding_quota('4000');

alter table public.budget_categories enable row level security;
alter table public.contributors enable row level security;
alter table public.vendors enable row level security;
alter table public.expenses enable row level security;
alter table public.payments enable row level security;
alter table public.tasks enable row level security;
alter table public.households enable row level security;
alter table public.guests enable row level security;

create policy "members read" on public.budget_categories for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "editors write" on public.budget_categories for all to authenticated
  using (private.can_edit(wedding_id)) with check (private.can_edit(wedding_id));

create policy "members read" on public.contributors for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "editors write" on public.contributors for all to authenticated
  using (private.can_edit(wedding_id)) with check (private.can_edit(wedding_id));

create policy "members read" on public.vendors for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "editors write" on public.vendors for all to authenticated
  using (private.can_edit(wedding_id)) with check (private.can_edit(wedding_id));

create policy "members read" on public.expenses for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "editors write" on public.expenses for all to authenticated
  using (private.can_edit(wedding_id)) with check (private.can_edit(wedding_id));

create policy "members read" on public.payments for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "editors write" on public.payments for all to authenticated
  using (private.can_edit(wedding_id)) with check (private.can_edit(wedding_id));

create policy "members read" on public.tasks for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "helpers write" on public.tasks for all to authenticated
  using (private.can_help(wedding_id)) with check (private.can_help(wedding_id));

create policy "members read" on public.households for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "helpers write" on public.households for all to authenticated
  using (private.can_help(wedding_id)) with check (private.can_help(wedding_id));

create policy "members read" on public.guests for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "helpers write" on public.guests for all to authenticated
  using (private.can_help(wedding_id)) with check (private.can_help(wedding_id));

grant select, delete on public.budget_categories to authenticated;
grant insert (id, wedding_id, name, icon, planned_cents, sort_order) on public.budget_categories to authenticated;
grant update (name, icon, planned_cents, sort_order) on public.budget_categories to authenticated;

grant select, delete on public.contributors to authenticated;
grant insert (id, wedding_id, name, promised_cents, sort_order) on public.contributors to authenticated;
grant update (name, promised_cents, sort_order) on public.contributors to authenticated;

grant select, delete on public.vendors to authenticated;
grant insert (id, wedding_id, category_id, name, status, contact_name, phone, email, instagram, website,
  quote_cents, quote_details, capacity, rating, visit_on, notes) on public.vendors to authenticated;
grant update (category_id, name, status, contact_name, phone, email, instagram, website,
  quote_cents, quote_details, capacity, rating, visit_on, notes) on public.vendors to authenticated;

grant select, delete on public.expenses to authenticated;
grant insert (id, wedding_id, category_id, vendor_id, title, estimated_cents, contracted_cents, notes)
  on public.expenses to authenticated;
grant update (category_id, vendor_id, title, estimated_cents, contracted_cents, notes) on public.expenses to authenticated;

grant select, delete on public.payments to authenticated;
grant insert (id, wedding_id, expense_id, amount_cents, due_on, paid_on, method, contributor_id,
  installment_number, installment_count, note) on public.payments to authenticated;
grant update (amount_cents, due_on, paid_on, method, contributor_id, note) on public.payments to authenticated;

grant select, delete on public.tasks to authenticated;
grant insert (id, wedding_id, title, notes, area, offset_days, due_on, assignee_id, assignee_label, vendor_id,
  template_key, done_at) on public.tasks to authenticated;
grant update (title, notes, area, offset_days, due_on, assignee_id, assignee_label, vendor_id, done_at)
  on public.tasks to authenticated;

grant select, delete on public.households to authenticated;
grant insert (id, wedding_id, name, side, list, phone, address, notes, save_the_date_on, invited_on, gift, thanked_on)
  on public.households to authenticated;
grant update (name, side, list, phone, address, notes, save_the_date_on, invited_on, gift, thanked_on)
  on public.households to authenticated;

grant select, delete on public.guests to authenticated;
grant insert (id, wedding_id, household_id, name, age_band, rsvp, is_plus_one, dietary, sort_order)
  on public.guests to authenticated;
grant update (name, age_band, rsvp, is_plus_one, dietary, sort_order) on public.guests to authenticated;

create function public.hire_vendor(
  p_vendor_id uuid,
  p_expense_id uuid,
  p_category_id uuid,
  p_title text,
  p_contracted_cents bigint,
  p_payments jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_wedding uuid;
  v_created uuid;
begin
  select wedding_id into v_wedding from public.vendors where id = p_vendor_id;
  if v_wedding is null then
    raise exception 'vendor not found' using errcode = 'P0002';
  end if;
  if jsonb_array_length(p_payments) > 60 then
    raise exception 'too many payments' using errcode = '22023';
  end if;

  update public.vendors set status = 'hired', category_id = coalesce(category_id, p_category_id)
  where id = p_vendor_id;

  insert into public.expenses (id, wedding_id, category_id, vendor_id, title, contracted_cents)
  values (p_expense_id, v_wedding, p_category_id, p_vendor_id, p_title, p_contracted_cents)
  on conflict (id) do nothing
  returning id into v_created;

  if v_created is null then
    return;
  end if;

  insert into public.payments (id, wedding_id, expense_id, amount_cents, due_on, installment_number, installment_count, note)
  select p.id, v_wedding, p_expense_id, p.amount_cents, p.due_on, p.installment_number, p.installment_count, p.note
  from jsonb_to_recordset(p_payments) as p(
    id uuid, amount_cents bigint, due_on date, installment_number smallint, installment_count smallint, note text
  );
end;
$$;

create function public.create_wedding(
  p_id uuid,
  p_partner_a text,
  p_partner_b text,
  p_ceremony public.ceremony_kind,
  p_tasks jsonb,
  p_categories jsonb,
  p_contributor text,
  p_date date default null,
  p_city text default null,
  p_guest_estimate integer default null,
  p_budget_cents bigint default null
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

  insert into public.weddings (id, partner_a, partner_b, wedding_date, city, ceremony, guest_estimate, budget_cents, created_by)
  values (p_id, p_partner_a, p_partner_b, p_date, p_city, p_ceremony, p_guest_estimate, p_budget_cents, v_user);

  insert into public.wedding_members (wedding_id, user_id, role) values (p_id, v_user, 'couple');

  insert into public.tasks (wedding_id, title, notes, area, offset_days, template_key)
  select p_id, t.title, t.notes, t.area, t.offset_days, t.template_key
  from jsonb_to_recordset(p_tasks) as t(title text, notes text, area text, offset_days integer, template_key text);

  insert into public.budget_categories (wedding_id, name, icon, planned_cents, sort_order)
  select p_id, c.value ->> 'name', c.value ->> 'icon', (c.value ->> 'planned_cents')::bigint, (c.ord - 1)::smallint
  from jsonb_array_elements(p_categories) with ordinality as c(value, ord);

  insert into public.contributors (wedding_id, name) values (p_id, p_contributor);

  update public.profiles set current_wedding_id = p_id where id = v_user;

  return p_id;
end;
$$;

grant execute on function public.hire_vendor(uuid, uuid, uuid, text, bigint, jsonb) to authenticated;
grant execute on function public.create_wedding(uuid, text, text, public.ceremony_kind, jsonb, jsonb, text, date, text, integer, bigint)
  to authenticated;
