-- 씩씩이들의 공유캘린더 - 2단계: 새 코드 배포 후 RLS 보안 적용
-- 주의: 001_schema_compatibility.sql 실행 + 새 코드 배포가 끝난 뒤 실행하세요.
-- 이 단계에서 기존의 넓은 RLS 정책을 교체합니다.

begin;

-- 1) role/status/email 보안 필드 보호
create or replace function public.protect_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() <> old.id and not public.is_admin() then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  if auth.uid() = old.id and not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
    new.email := old.email;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_security_fields on public.profiles;
create trigger trg_protect_profile_security_fields
before update on public.profiles
for each row execute function public.protect_profile_security_fields();

-- 2) 기존 정책 제거
-- 정책 이름이 무엇이었는지와 관계없이 대상 테이블의 기존 정책을 모두 제거합니다.
do $$
declare
  t text;
  p record;
begin
  foreach t in array array[
    'profiles','rooms','room_members','events','comments','messages',
    'votes','vote_options','vote_records','settlements','settlement_items','push_subscriptions'
  ] loop
    for p in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', p.policyname, t);
    end loop;
  end loop;
end $$;

-- 3) RLS 활성화
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.events enable row level security;
alter table public.comments enable row level security;
alter table public.messages enable row level security;
alter table public.votes enable row level security;
alter table public.vote_options enable row level security;
alter table public.vote_records enable row level security;
alter table public.settlements enable row level security;
alter table public.settlement_items enable row level security;
alter table public.push_subscriptions enable row level security;

-- 4) profiles
create policy profiles_select on public.profiles
for select to authenticated
using (status = 'approved' or id = auth.uid() or public.is_admin());

create policy profiles_update on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- 5) rooms
create policy rooms_select on public.rooms
for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.room_members rm
  where rm.room_id = rooms.id and rm.user_id = auth.uid()
));

create policy rooms_insert on public.rooms
for insert to authenticated
with check (public.is_admin());

create policy rooms_update on public.rooms
for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy rooms_delete on public.rooms
for delete to authenticated
using (public.is_admin());

-- 6) room_members
create policy room_members_select on public.room_members
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy room_members_insert on public.room_members
for insert to authenticated
with check (public.is_admin());

create policy room_members_delete on public.room_members
for delete to authenticated
using (public.is_admin());

-- 7) events
create policy events_select on public.events
for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.room_members rm
  where rm.room_id = events.room_id and rm.user_id = auth.uid()
));

create policy events_insert on public.events
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (select 1 from public.room_members rm where rm.room_id = events.room_id and rm.user_id = auth.uid())
);

create policy events_update on public.events
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (
  (user_id = auth.uid() and exists (select 1 from public.room_members rm where rm.room_id = events.room_id and rm.user_id = auth.uid()))
  or public.is_admin()
);

create policy events_delete on public.events
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

-- 8) comments
create policy comments_select on public.comments
for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.events e
  join public.room_members rm on rm.room_id = e.room_id
  where e.id = comments.event_id and rm.user_id = auth.uid()
));

create policy comments_insert on public.comments
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.events e
    join public.room_members rm on rm.room_id = e.room_id
    where e.id = comments.event_id and rm.user_id = auth.uid()
  )
);

create policy comments_delete on public.comments
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

-- 9) messages
create policy messages_select on public.messages
for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.room_members rm
  where rm.room_id = messages.room_id and rm.user_id = auth.uid()
));

create policy messages_insert on public.messages
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (select 1 from public.room_members rm where rm.room_id = messages.room_id and rm.user_id = auth.uid())
);

create policy messages_delete on public.messages
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

-- 10) votes
create policy votes_select on public.votes
for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.room_members rm
  where rm.room_id = votes.room_id and rm.user_id = auth.uid()
));

create policy votes_insert on public.votes
for insert to authenticated
with check (
  user_id = auth.uid()
  and room_id is not null
  and exists (select 1 from public.room_members rm where rm.room_id = votes.room_id and rm.user_id = auth.uid())
);

create policy votes_update on public.votes
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy votes_delete on public.votes
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

-- 11) vote_options / vote_records
create policy vote_options_select on public.vote_options
for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.votes v
  join public.room_members rm on rm.room_id = v.room_id
  where v.id = vote_options.vote_id and rm.user_id = auth.uid()
));

create policy vote_options_insert on public.vote_options
for insert to authenticated
with check (public.is_admin() or exists (
  select 1 from public.votes v
  where v.id = vote_options.vote_id and v.user_id = auth.uid()
));

create policy vote_options_delete on public.vote_options
for delete to authenticated
using (public.is_admin() or exists (
  select 1 from public.votes v
  where v.id = vote_options.vote_id and v.user_id = auth.uid()
));

create policy vote_records_select on public.vote_records
for select to authenticated
using (public.is_admin() or user_id = auth.uid() or exists (
  select 1 from public.votes v
  join public.room_members rm on rm.room_id = v.room_id
  where v.id = vote_records.vote_id and rm.user_id = auth.uid()
));

create policy vote_records_insert on public.vote_records
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.votes v
    join public.room_members rm on rm.room_id = v.room_id
    where v.id = vote_records.vote_id and rm.user_id = auth.uid()
  )
);

create policy vote_records_delete on public.vote_records
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

-- 12) settlements / settlement_items
create policy settlements_select on public.settlements
for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.room_members rm where rm.room_id = settlements.room_id and rm.user_id = auth.uid()
));

create policy settlements_insert on public.settlements
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (select 1 from public.room_members rm where rm.room_id = settlements.room_id and rm.user_id = auth.uid())
);

create policy settlements_update on public.settlements
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy settlements_delete on public.settlements
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy settlement_items_select on public.settlement_items
for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.settlements s
  join public.room_members rm on rm.room_id = s.room_id
  where s.id = settlement_items.settlement_id and rm.user_id = auth.uid()
));

create policy settlement_items_insert on public.settlement_items
for insert to authenticated
with check (exists (
  select 1 from public.settlements s
  join public.room_members rm on rm.room_id = s.room_id
  where s.id = settlement_items.settlement_id and rm.user_id = auth.uid()
));

create policy settlement_items_update on public.settlement_items
for update to authenticated
using (public.is_admin() or exists (
  select 1 from public.settlements s
  where s.id = settlement_items.settlement_id and (s.user_id = auth.uid() or public.is_admin())
))
with check (public.is_admin() or exists (
  select 1 from public.settlements s
  where s.id = settlement_items.settlement_id and (s.user_id = auth.uid() or public.is_admin())
));

create policy settlement_items_delete on public.settlement_items
for delete to authenticated
using (public.is_admin() or exists (
  select 1 from public.settlements s
  where s.id = settlement_items.settlement_id and (s.user_id = auth.uid() or public.is_admin())
));

-- 13) push subscriptions
create policy push_subscriptions_manage on public.push_subscriptions
for all to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

commit;
