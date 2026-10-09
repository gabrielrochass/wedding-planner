create type public.home_priority as enum ('essential', 'important', 'nice');
create type public.home_status as enum ('missing', 'wishlist', 'bought', 'gifted');

create domain public.home_room as text
  check (value in (
    'cozinha', 'mesa', 'banheiro', 'quarto', 'sala', 'lavanderia',
    'eletro', 'moveis', 'organizacao', 'ferramentas', 'outros'
  ));

create table public.home_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  room public.home_room not null default 'outros',
  name public.label not null,
  quantity smallint not null default 1 check (quantity between 1 and 999),
  priority public.home_priority not null default 'important',
  status public.home_status not null default 'missing',
  estimate_cents bigint check (estimate_cents between 1 and 9999999999),
  paid_cents bigint check (paid_cents between 0 and 9999999999),
  store text check (char_length(store) <= 80),
  url text check (char_length(url) <= 500 and url ~ '^https?://'),
  household_id uuid,
  notes public.long_text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id),
  foreign key (household_id, wedding_id) references public.households (id, wedding_id) on delete set null (household_id)
);

create index home_items_wedding_idx on public.home_items (wedding_id, room);
create index home_items_household_idx on public.home_items (household_id) where household_id is not null;

create trigger home_items_touch before update on public.home_items
  for each row execute function private.touch();

create trigger home_items_quota before insert on public.home_items
  for each row execute function private.enforce_wedding_quota('1000');

alter table public.home_items enable row level security;

create policy "members read" on public.home_items for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "helpers write" on public.home_items for all to authenticated
  using (private.can_help(wedding_id)) with check (private.can_help(wedding_id));

grant select, delete on public.home_items to authenticated;
grant insert (id, wedding_id, room, name, quantity, priority, status, estimate_cents, paid_cents, store, url,
  household_id, notes) on public.home_items to authenticated;
grant update (room, name, quantity, priority, status, estimate_cents, paid_cents, store, url, household_id, notes)
  on public.home_items to authenticated;
