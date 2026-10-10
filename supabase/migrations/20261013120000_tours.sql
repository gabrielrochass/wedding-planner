alter table public.profiles
  add column tours_seen text[] not null default '{}' check (
    cardinality(tours_seen) <= 40
    and array_to_string(tours_seen, '') ~ '^[a-z-]*$'
  );

grant update (tours_seen) on public.profiles to authenticated;
