-- 012: selectable male/female mini-me base
alter table public.world_profiles
  add column if not exists avatar_gender text not null default 'male';

alter table public.world_profiles
  drop constraint if exists world_profiles_avatar_gender_check;

alter table public.world_profiles
  add constraint world_profiles_avatar_gender_check
  check (avatar_gender in ('male','female'));
