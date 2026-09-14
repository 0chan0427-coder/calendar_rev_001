-- 씩씩이 월드 1차 데이터/경제 시스템
create table if not exists public.world_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null default '',
  status_message text not null default '오늘도 힘내자!',
  today_visits integer not null default 0,
  total_visits integer not null default 0,
  likes integer not null default 0,
  scene_type text not null default 'interior' check (scene_type in ('interior','exterior')),
  wallpaper_id text not null default 'wallpaper-ivory',
  floor_id text not null default 'floor-wood',
  window_id text not null default 'window-day',
  my_bgm_id text,
  updated_at timestamptz not null default now(),
  today_visit_date date not null default current_date
);

create table if not exists public.world_points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  reference_key text,
  created_at timestamptz not null default now()
);
create unique index if not exists world_points_unique_reference on public.world_points_ledger(user_id, reference_key) where reference_key is not null;

create table if not exists public.world_daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null default current_date,
  activity_type text not null check (activity_type in ('attendance','chat','visit')),
  target_user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index if not exists world_daily_attendance_chat_unique on public.world_daily_activity(user_id, activity_date, activity_type) where activity_type in ('attendance','chat');
create unique index if not exists world_daily_visit_unique on public.world_daily_activity(user_id, activity_date, activity_type, target_user_id) where activity_type = 'visit';

create table if not exists public.world_weekly_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  weekly_score integer not null default 0,
  attendance_point integer not null default 0,
  chat_point integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, week_start)
);

create table if not exists public.world_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  purchased_at timestamptz not null default now(),
  unique(user_id, item_id)
);

create table if not exists public.world_guestbook (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  writer_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamptz not null default now()
);

create table if not exists public.world_likes (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(owner_id, user_id)
);

alter table public.world_profiles enable row level security;
alter table public.world_points_ledger enable row level security;
alter table public.world_daily_activity enable row level security;
alter table public.world_weekly_scores enable row level security;
alter table public.world_inventory enable row level security;
alter table public.world_guestbook enable row level security;
alter table public.world_likes enable row level security;

create policy "world profiles readable by authenticated" on public.world_profiles for select to authenticated using (true);
create policy "own world profile update" on public.world_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own points readable" on public.world_points_ledger for select to authenticated using (auth.uid() = user_id);
create policy "daily activity readable" on public.world_daily_activity for select to authenticated using (auth.uid() = user_id);
create policy "weekly ranking readable" on public.world_weekly_scores for select to authenticated using (true);
create policy "own inventory readable" on public.world_inventory for select to authenticated using (auth.uid() = user_id);
create policy "guestbook readable" on public.world_guestbook for select to authenticated using (true);
create policy "guestbook insert" on public.world_guestbook for insert to authenticated with check (auth.uid() = writer_id);
create policy "likes readable" on public.world_likes for select to authenticated using (true);

create or replace function public.award_world_weekly_bonuses(p_week_start date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r record; v_rank integer := 0; v_bonus integer; v_count integer := 0;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  for r in select user_id from world_weekly_scores where week_start=p_week_start order by weekly_score desc, updated_at asc, user_id loop
    v_rank := v_rank + 1;
    v_bonus := case when v_rank=1 then 1000 when v_rank=2 then 700 when v_rank=3 then 500 else 300 end;
    insert into world_points_ledger(user_id, amount, reason, reference_key)
      values(r.user_id, v_bonus, '주간 랭킹 보너스', 'weekly-bonus:'||p_week_start::text||':'||r.user_id::text)
      on conflict do nothing;
    if found then v_count := v_count + 1; end if;
  end loop;
  return jsonb_build_object('awarded',v_count);
end; $$;
grant execute on function public.award_world_weekly_bonuses(date) to authenticated;

create or replace function public.ensure_world_profile(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_exists boolean;
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  select exists(select 1 from world_profiles where user_id=p_user_id) into v_exists;
  insert into world_profiles(user_id, display_name)
    select p_user_id, coalesce(display_name, '') from profiles where id=p_user_id
    on conflict (user_id) do update set display_name=excluded.display_name, updated_at=now();
  if not v_exists then
    insert into world_points_ledger(user_id, amount, reason, reference_key)
    values(p_user_id, 3000, '월드 시작 선물', 'welcome:' || p_user_id::text)
    on conflict do nothing;
  end if;
  return jsonb_build_object('created', not v_exists);
end; $$;

grant execute on function public.ensure_world_profile(uuid) to authenticated;

create or replace function public.record_world_daily_activity(p_user_id uuid, p_activity_type text, p_target_user_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_date date := current_date;
  v_inserted integer := 0;
  v_week date := date_trunc('week', current_date)::date;
  v_amount integer;
  v_reason text;
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  if p_activity_type = 'visit' and (p_target_user_id is null or p_target_user_id = p_user_id) then return jsonb_build_object('awarded', false); end if;
  v_amount := case p_activity_type when 'attendance' then 100 when 'chat' then 100 when 'visit' then 100 else 0 end;
  v_reason := case p_activity_type when 'attendance' then '오늘의 출석' when 'chat' then '오늘의 첫 자유채팅' else '멤버 미니홈피 방문' end;
  insert into world_daily_activity(user_id, activity_date, activity_type, target_user_id)
  values(p_user_id, v_date, p_activity_type, p_target_user_id)
  on conflict do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 1 then
    insert into world_points_ledger(user_id, amount, reason, reference_key)
    values(p_user_id, v_amount, v_reason, p_activity_type || ':' || v_date::text || ':' || coalesce(p_target_user_id::text,''))
    on conflict do nothing;
    if p_activity_type in ('attendance','chat') then
      insert into world_weekly_scores(user_id, week_start, weekly_score, attendance_point, chat_point)
      values(p_user_id, v_week, case when p_activity_type='attendance' then 1 else 1 end, case when p_activity_type='attendance' then 1 else 0 end, case when p_activity_type='chat' then 1 else 0 end)
      on conflict(user_id, week_start) do update set
        weekly_score = world_weekly_scores.weekly_score + 1,
        attendance_point = world_weekly_scores.attendance_point + case when p_activity_type='attendance' then 1 else 0 end,
        chat_point = world_weekly_scores.chat_point + case when p_activity_type='chat' then 1 else 0 end,
        updated_at = now();
    end if;
  end if;
  return jsonb_build_object('awarded', v_inserted=1, 'points', case when v_inserted=1 then v_amount else 0 end);
end; $$;

grant execute on function public.record_world_daily_activity(uuid,text,uuid) to authenticated;

create or replace function public.visit_world_home(p_visitor_id uuid, p_owner_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_result jsonb;
begin
  if auth.uid() <> p_visitor_id then raise exception 'not allowed'; end if;
  update world_profiles set total_visits=total_visits+1, today_visits=case when today_visit_date=current_date then today_visits+1 else 1 end, today_visit_date=current_date, updated_at=now() where user_id=p_owner_id;
  select record_world_daily_activity(p_visitor_id,'visit',p_owner_id) into v_result;
  return v_result;
end; $$;
grant execute on function public.visit_world_home(uuid,uuid) to authenticated;

create or replace function public.toggle_world_like(p_user_id uuid, p_owner_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_liked boolean;
begin
  if auth.uid() <> p_user_id or p_user_id=p_owner_id then raise exception 'not allowed'; end if;
  select exists(select 1 from world_likes where owner_id=p_owner_id and user_id=p_user_id) into v_liked;
  if v_liked then delete from world_likes where owner_id=p_owner_id and user_id=p_user_id;
  else insert into world_likes(owner_id,user_id) values(p_owner_id,p_user_id); end if;
  update world_profiles set likes=(select count(*) from world_likes where owner_id=p_owner_id), updated_at=now() where user_id=p_owner_id;
  return jsonb_build_object('liked',not v_liked);
end; $$;
grant execute on function public.toggle_world_like(uuid,uuid) to authenticated;

create or replace function public.purchase_world_item(p_user_id uuid, p_item_id text, p_price integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_balance integer;
begin
  if auth.uid() <> p_user_id or p_price < 0 then raise exception 'not allowed'; end if;
  if exists(select 1 from world_inventory where user_id=p_user_id and item_id=p_item_id) then return jsonb_build_object('success',false,'reason','already_owned'); end if;
  select coalesce(sum(amount),0) into v_balance from world_points_ledger where user_id=p_user_id;
  if v_balance < p_price then return jsonb_build_object('success',false,'reason','insufficient_points'); end if;
  insert into world_points_ledger(user_id,amount,reason,reference_key) values(p_user_id,-p_price,'월드 아이템 구매','purchase:'||p_item_id||':'||p_user_id::text||':'||extract(epoch from now())::text);
  insert into world_inventory(user_id,item_id) values(p_user_id,p_item_id);
  return jsonb_build_object('success',true,'balance',v_balance-p_price);
end; $$;
grant execute on function public.purchase_world_item(uuid,text,integer) to authenticated;
