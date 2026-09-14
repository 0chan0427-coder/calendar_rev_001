-- 씩씩이들의 공유캘린더 - 1단계: 스키마 호환성 준비
-- 목적: 기존 앱/RLS를 건드리지 않고 새 코드가 사용할 구조만 먼저 준비합니다.
-- 이 단계는 기존 회원/기존 앱에 대한 접근 정책을 변경하지 않습니다.

begin;

-- 1) 새 코드와 기존 DB의 스키마 차이 보정
alter table public.votes
  add column if not exists room_id uuid references public.rooms(id) on delete cascade;

alter table public.votes
  add column if not exists is_multiple boolean not null default false;

-- 2) 구버전 데이터에 방 정보가 없던 경우, 기존 화면에서 갑자기 사라지지 않도록
-- 현재 첫 번째 방에 연결합니다. 실제 방 배정이 필요하면 이후 데이터 확인 후 조정할 수 있습니다.
update public.votes
set room_id = (
  select id from public.rooms
  order by sort_order nulls last, created_at, id
  limit 1
)
where room_id is null
  and exists (select 1 from public.rooms);

update public.messages
set room_id = (
  select id from public.rooms
  order by sort_order nulls last, created_at, id
  limit 1
)
where room_id is null
  and exists (select 1 from public.rooms);

-- 3) 방 멤버십 테이블 생성
create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create index if not exists idx_room_members_user_id on public.room_members(user_id);
create index if not exists idx_room_members_room_id on public.room_members(room_id);
create index if not exists idx_events_room_id on public.events(room_id);
create index if not exists idx_messages_room_id on public.messages(room_id);
create index if not exists idx_votes_room_id on public.votes(room_id);
create index if not exists idx_settlements_room_id on public.settlements(room_id);

-- 4) 기존 승인 사용자들을 기존 모든 방에 연결
insert into public.room_members (room_id, user_id)
select r.id, p.id
from public.rooms r
cross join public.profiles p
where p.status = 'approved'
on conflict (room_id, user_id) do nothing;

-- 5) 관리자 판별 함수
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'approved'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 6) 승인된 사용자가 기존/새 방에 자동 참여하도록 준비
create or replace function public.add_approved_profile_to_rooms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    insert into public.room_members (room_id, user_id)
    select id, new.id from public.rooms
    on conflict (room_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profile_approved_room_members on public.profiles;
create trigger trg_profile_approved_room_members
after insert or update of status on public.profiles
for each row execute function public.add_approved_profile_to_rooms();

create or replace function public.add_approved_profiles_to_new_room()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.room_members (room_id, user_id)
  select new.id, id from public.profiles where status = 'approved'
  on conflict (room_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_room_create_members on public.rooms;
create trigger trg_room_create_members
after insert on public.rooms
for each row execute function public.add_approved_profiles_to_new_room();

-- 7) 새로 만든 room_members만 먼저 보호합니다.
-- 기존 테이블의 RLS 정책은 2단계에서 새 코드 배포 후 교체합니다.
alter table public.room_members enable row level security;

drop policy if exists room_members_select on public.room_members;
drop policy if exists room_members_insert on public.room_members;
drop policy if exists room_members_delete on public.room_members;

create policy room_members_select on public.room_members
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy room_members_insert on public.room_members
for insert to authenticated
with check (public.is_admin());

create policy room_members_delete on public.room_members
for delete to authenticated
using (public.is_admin());

commit;
