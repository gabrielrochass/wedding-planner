create type public.idea_status as enum ('idea', 'approved', 'discarded');
create type public.party_invite as enum ('pending', 'ordered', 'delivered');

create domain public.idea_board as text
  check (value in (
    'decoracao', 'papelaria', 'bolo-doces', 'traje', 'fotos', 'lembrancinhas',
    'padrinhos', 'atividades', 'votos', 'outros'
  ));

create domain public.music_moment as text
  check (value in (
    'entrada-padrinhos', 'entrada-noivo', 'entrada-pais', 'entrada-floristas', 'entrada-aliancas',
    'entrada-noiva', 'votos', 'beijo', 'saida', 'louvor-cerimonia', 'entrada-salao', 'primeira-danca',
    'louvor-ceia', 'buque', 'bolo', 'festa', 'nao-tocar'
  ));

create domain public.party_role as text
  check (value in (
    'padrinho', 'madrinha', 'dama', 'pajem', 'florista', 'aliancas', 'pais', 'celebrante', 'testemunha', 'outro'
  ));

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  board public.idea_board not null default 'outros',
  title public.label not null,
  notes public.long_text,
  url text check (char_length(url) <= 500 and url ~ '^https?://'),
  image_path text check (char_length(image_path) <= 300),
  status public.idea_status not null default 'idea',
  estimate_cents bigint check (estimate_cents between 1 and 9999999999),
  vendor_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id),
  foreign key (vendor_id, wedding_id) references public.vendors (id, wedding_id) on delete set null (vendor_id)
);

create index ideas_wedding_idx on public.ideas (wedding_id, board);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  moment public.music_moment not null,
  title public.label not null,
  artist text check (char_length(artist) <= 80),
  url text check (char_length(url) <= 500 and url ~ '^https?://'),
  chosen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id)
);

create index songs_wedding_idx on public.songs (wedding_id, moment);

create table public.party_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name public.label not null,
  role public.party_role not null,
  side public.guest_side not null default 'both',
  pair_id uuid,
  entrance_order integer not null default 0 check (entrance_order between 0 and 1000),
  attire text check (char_length(attire) <= 120),
  invite_status public.party_invite not null default 'pending',
  phone text check (char_length(phone) <= 30),
  notes public.long_text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id),
  foreign key (pair_id, wedding_id) references public.party_members (id, wedding_id) on delete set null (pair_id),
  check (pair_id is distinct from id)
);

create index party_members_wedding_idx on public.party_members (wedding_id, entrance_order);

create table public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  starts_at time not null,
  ends_at time,
  title public.label not null,
  place text check (char_length(place) <= 120),
  responsible text check (char_length(responsible) <= 80),
  notes public.long_text,
  song_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  unique (id, wedding_id),
  foreign key (song_id, wedding_id) references public.songs (id, wedding_id) on delete set null (song_id)
);

create index timeline_items_wedding_idx on public.timeline_items (wedding_id, starts_at);

create trigger ideas_touch before update on public.ideas for each row execute function private.touch();
create trigger songs_touch before update on public.songs for each row execute function private.touch();
create trigger party_members_touch before update on public.party_members for each row execute function private.touch();
create trigger timeline_items_touch before update on public.timeline_items for each row execute function private.touch();

create trigger ideas_quota before insert on public.ideas
  for each row execute function private.enforce_wedding_quota('1000');
create trigger songs_quota before insert on public.songs
  for each row execute function private.enforce_wedding_quota('500');
create trigger party_members_quota before insert on public.party_members
  for each row execute function private.enforce_wedding_quota('100');
create trigger timeline_items_quota before insert on public.timeline_items
  for each row execute function private.enforce_wedding_quota('200');

alter table public.ideas enable row level security;
alter table public.songs enable row level security;
alter table public.party_members enable row level security;
alter table public.timeline_items enable row level security;

create policy "members read" on public.ideas for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "helpers write" on public.ideas for all to authenticated
  using (private.can_help(wedding_id)) with check (private.can_help(wedding_id));

create policy "members read" on public.songs for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "helpers write" on public.songs for all to authenticated
  using (private.can_help(wedding_id)) with check (private.can_help(wedding_id));

create policy "members read" on public.party_members for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "helpers write" on public.party_members for all to authenticated
  using (private.can_help(wedding_id)) with check (private.can_help(wedding_id));

create policy "members read" on public.timeline_items for select to authenticated
  using (private.member_role(wedding_id) is not null);
create policy "helpers write" on public.timeline_items for all to authenticated
  using (private.can_help(wedding_id)) with check (private.can_help(wedding_id));

grant select, delete on public.ideas to authenticated;
grant insert (id, wedding_id, board, title, notes, url, image_path, status, estimate_cents, vendor_id)
  on public.ideas to authenticated;
grant update (board, title, notes, url, image_path, status, estimate_cents, vendor_id) on public.ideas to authenticated;

grant select, delete on public.songs to authenticated;
grant insert (id, wedding_id, moment, title, artist, url, chosen) on public.songs to authenticated;
grant update (moment, title, artist, url, chosen) on public.songs to authenticated;

grant select, delete on public.party_members to authenticated;
grant insert (id, wedding_id, name, role, side, pair_id, entrance_order, attire, invite_status, phone, notes)
  on public.party_members to authenticated;
grant update (name, role, side, pair_id, entrance_order, attire, invite_status, phone, notes)
  on public.party_members to authenticated;

grant select, delete on public.timeline_items to authenticated;
grant insert (id, wedding_id, starts_at, ends_at, title, place, responsible, notes, song_id)
  on public.timeline_items to authenticated;
grant update (starts_at, ends_at, title, place, responsible, notes, song_id) on public.timeline_items to authenticated;

create function private.storage_wedding(p_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(p_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(p_name, '/', 1)::uuid
  end
$$;

grant execute on function private.storage_wedding(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ideias', 'ideias', false, 3145728, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "members read idea images" on storage.objects for select to authenticated
  using (bucket_id = 'ideias' and private.member_role(private.storage_wedding(name)) is not null);

create policy "helpers add idea images" on storage.objects for insert to authenticated
  with check (bucket_id = 'ideias' and private.can_help(private.storage_wedding(name)));

create policy "helpers remove idea images" on storage.objects for delete to authenticated
  using (bucket_id = 'ideias' and private.can_help(private.storage_wedding(name)));
