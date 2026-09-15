-- 씩씩이 월드 6차: 방명록 답글/비밀글, 오늘 출석, 역대 랭킹, 알림, 선물

create table if not exists public.world_guestbook_replies (
  id uuid primary key default gen_random_uuid(),
  guestbook_id uuid not null references public.world_guestbook(id) on delete cascade,
  writer_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamptz not null default now()
);

alter table public.world_guestbook add column if not exists is_secret boolean not null default false;

create table if not exists public.world_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists world_notifications_user_created on public.world_notifications(user_id, created_at desc);

create table if not exists public.world_gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  price integer not null check (price >= 0),
  created_at timestamptz not null default now()
);
create index if not exists world_gifts_recipient_created on public.world_gifts(recipient_id, created_at desc);

create table if not exists public.world_item_catalog (
  item_id text primary key,
  item_name text not null,
  item_type text not null,
  price integer not null check (price >= 0)
);

insert into public.world_item_catalog(item_id,item_name,item_type,price) values
('wallpaper-ivory','아이보리 벽지','wallpaper',0),('wallpaper-check','체크무늬 벽지','wallpaper',1000),('wallpaper-flower','꽃무늬 벽지','wallpaper',1500),
('floor-wood','따뜻한 나무 바닥','floor',0),('floor-check','체크 러그 바닥','floor',1000),
('sofa-basic','포근한 소파','furniture',0),('table','작은 테이블','furniture',0),('chair','기본 의자','furniture',0),('plant','작은 화분','props',0),('lamp','스탠드 조명','furniture',0),
('sofa-check','체크 소파','furniture',2000),('cactus','작은 선인장','props',500),('cherry-pot','벚꽃 화분','props',1000),
('cat-white','하얀 고양이','animal',1000),('cat-ribbon','빨간 리본 고양이','animal',2000),('dog-brown','갈색 강아지','animal',1500),('dog-sunglasses','선글라스 강아지','animal',2500),
('rabbit','토끼','animal',1500),('panda','판다','animal',2000),('fox','여우','animal',2000),('tiger','호랑이','animal',2500),('elephant','코끼리','animal',3000),('crocodile','악어','animal',2500),('eagle','독수리','animal',3000),('whale','고래','animal',3000),
('dragon-red','붉은 용','animal',5000),('dragon-gold','황금 용','animal',7000),('unicorn','유니콘','animal',5000),('piano','작은 피아노','furniture',5000),('christmas-room','크리스마스 방','theme',10000),('special-garden','특별한 정원','theme',15000)
on conflict (item_id) do update set item_name=excluded.item_name,item_type=excluded.item_type,price=excluded.price;

alter table public.world_guestbook_replies enable row level security;
alter table public.world_notifications enable row level security;
alter table public.world_gifts enable row level security;
alter table public.world_item_catalog enable row level security;

create policy "world item catalog readable" on public.world_item_catalog for select to authenticated using (true);
create policy "own notifications readable" on public.world_notifications for select to authenticated using (auth.uid() = user_id);
create policy "own notifications update" on public.world_notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own gifts readable" on public.world_gifts for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- 기존 guestbook 공개 SELECT 정책은 비밀글 내용을 노출할 수 있으므로 제거한다.
drop policy if exists "guestbook readable" on public.world_guestbook;
drop policy if exists "guestbook insert" on public.world_guestbook;

-- 답글은 직접 SELECT하지 않고 아래 보안 RPC를 통해서만 조회한다.
create policy "guestbook replies owner or writer readable" on public.world_guestbook_replies
  for select to authenticated
  using (
    auth.uid() = writer_id
    or exists(select 1 from public.world_guestbook g where g.id=guestbook_id and g.owner_id=auth.uid())
  );

create or replace function public.create_world_guestbook(
  p_owner_id uuid, p_content text, p_is_secret boolean default false
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_name text;
begin
  if auth.uid() is null or p_content is null or char_length(trim(p_content)) not between 1 and 300 then raise exception 'invalid guestbook'; end if;
  insert into world_guestbook(owner_id,writer_id,content,is_secret) values(p_owner_id,auth.uid(),trim(p_content),p_is_secret) returning id into v_id;
  select coalesce(name,'씩씩이') into v_name from profiles where id=auth.uid();
  insert into world_notifications(user_id,notification_type,title,body,related_id)
    values(p_owner_id,'guestbook','💌 방명록','새 방명록이 도착했어요.',v_id);
  return jsonb_build_object('success',true,'id',v_id);
end; $$;
grant execute on function public.create_world_guestbook(uuid,text,boolean) to authenticated;

create or replace function public.create_world_guestbook_reply(
  p_guestbook_id uuid, p_content text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_reply_id uuid; v_owner_id uuid; v_secret boolean;
begin
  if auth.uid() is null or p_content is null or char_length(trim(p_content)) not between 1 and 300 then raise exception 'invalid reply'; end if;
  select owner_id,is_secret into v_owner_id,v_secret from world_guestbook where id=p_guestbook_id;
  if v_owner_id is null then raise exception 'guestbook not found'; end if;
  insert into world_guestbook_replies(guestbook_id,writer_id,content) values(p_guestbook_id,auth.uid(),trim(p_content)) returning id into v_reply_id;
  insert into world_notifications(user_id,notification_type,title,body,related_id)
    values(v_owner_id,'guestbook_reply','💬 방명록 답글',case when v_secret then '비밀 방명록에 답글이 도착했어요.' else '방명록에 답글이 도착했어요.' end,p_guestbook_id);
  return jsonb_build_object('success',true,'id',v_reply_id,'is_secret',v_secret);
end; $$;
grant execute on function public.create_world_guestbook_reply(uuid,text) to authenticated;

create or replace function public.list_world_guestbook(p_owner_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_owner boolean; v_result jsonb;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  v_owner := auth.uid() = p_owner_id;
  select coalesce(jsonb_agg(row_to_json(x) order by x.created_at desc),'[]'::jsonb) into v_result
  from (
    select g.id,
      case when g.is_secret and not v_owner then null else g.writer_id end as writer_id,
      case when g.is_secret and not v_owner then '비밀글 작성자' else coalesce(p.name,'씩씩이') end as writer_name,
      case when g.is_secret and not v_owner then '비밀글입니다.' else g.content end as content,
      g.is_secret,
      g.created_at,
      coalesce((select jsonb_agg(jsonb_build_object(
        'id',r.id,
        'writer_id',case when g.is_secret and not v_owner then null else r.writer_id end,
        'writer_name',case when g.is_secret and not v_owner then '비밀글 작성자' else coalesce(rp.name,'씩씩이') end,
        'content',case when g.is_secret and not v_owner then '비밀글입니다.' else r.content end,
        'created_at',r.created_at
      ) order by r.created_at asc) from world_guestbook_replies r left join profiles rp on rp.id=r.writer_id where r.guestbook_id=g.id),'[]'::jsonb) as replies
    from world_guestbook g left join profiles p on p.id=g.writer_id
    where g.owner_id=p_owner_id
  ) x;
  return v_result;
end; $$;
grant execute on function public.list_world_guestbook(uuid) to authenticated;

create or replace function public.list_world_today_attendance()
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_result jsonb;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('user_id',a.user_id,'display_name',coalesce(w.display_name,p.name,'씩씩이')) order by coalesce(w.display_name,p.name,'씩씩이')),'[]'::jsonb)
    into v_result
  from world_daily_activity a
  left join world_profiles w on w.user_id=a.user_id
  left join profiles p on p.id=a.user_id
  where a.activity_date=current_date and a.activity_type='attendance';
  return v_result;
end; $$;
grant execute on function public.list_world_today_attendance() to authenticated;

create or replace function public.list_world_notifications(p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_result jsonb;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select coalesce(jsonb_agg(row_to_json(x) order by x.created_at desc),'[]'::jsonb) into v_result
  from (select id,notification_type,title,body,related_id,is_read,created_at from world_notifications where user_id=auth.uid() order by created_at desc limit greatest(1,least(p_limit,100))) x;
  return v_result;
end; $$;
grant execute on function public.list_world_notifications(integer) to authenticated;

create or replace function public.mark_world_notifications_read()
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update world_notifications set is_read=true where user_id=auth.uid() and not is_read;
  return jsonb_build_object('success',true);
end; $$;
grant execute on function public.mark_world_notifications_read() to authenticated;

create or replace function public.send_world_gift(
  p_recipient_id uuid, p_item_id text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_price integer; v_name text; v_balance integer; v_gift_id uuid;
begin
  if auth.uid() is null or p_recipient_id=auth.uid() then raise exception 'invalid recipient'; end if;
  select price,item_name into v_price,v_name from world_item_catalog where item_id=p_item_id;
  if v_name is null then raise exception 'item not found'; end if;
  select coalesce(sum(amount),0) into v_balance from world_points_ledger where user_id=auth.uid();
  if v_balance < v_price then return jsonb_build_object('success',false,'reason','insufficient_points'); end if;
  if v_price <= 0 then return jsonb_build_object('success',false,'reason','not_giftable'); end if;

  insert into world_points_ledger(user_id,amount,reason,reference_key)
    values(auth.uid(),-v_price,'월드 아이템 선물','gift:'||p_item_id||':'||auth.uid()::text||':'||p_recipient_id::text||':'||extract(epoch from clock_timestamp())::text);
  insert into world_inventory(user_id,item_id,quantity) values(p_recipient_id,p_item_id,1)
    on conflict(user_id,item_id) do update set quantity=world_inventory.quantity+1;
  insert into world_gifts(sender_id,recipient_id,item_id,price) values(auth.uid(),p_recipient_id,p_item_id,v_price) returning id into v_gift_id;
  insert into world_notifications(user_id,notification_type,title,body,related_id)
    values(p_recipient_id,'gift','🎁 선물 도착',v_name||' 선물이 도착했어요.',v_gift_id);
  return jsonb_build_object('success',true,'gift_id',v_gift_id,'balance',v_balance-v_price);
end; $$;
grant execute on function public.send_world_gift(uuid,text) to authenticated;

-- 구매 가격도 서버 카탈로그를 기준으로 검증한다.
create or replace function public.purchase_world_item(p_user_id uuid, p_item_id text, p_price integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_balance integer; v_quantity integer; v_real_price integer; v_name text;
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  select price,item_name into v_real_price,v_name from world_item_catalog where item_id=p_item_id;
  if v_name is null then raise exception 'item not found'; end if;
  select coalesce(sum(amount),0) into v_balance from world_points_ledger where user_id=p_user_id;
  if v_balance < v_real_price then return jsonb_build_object('success',false,'reason','insufficient_points'); end if;
  insert into world_points_ledger(user_id,amount,reason,reference_key)
    values(p_user_id,-v_real_price,'월드 아이템 구매','purchase:'||p_item_id||':'||p_user_id::text||':'||extract(epoch from clock_timestamp())::text);
  insert into world_inventory(user_id,item_id,quantity) values(p_user_id,p_item_id,1)
    on conflict(user_id,item_id) do update set quantity=world_inventory.quantity+1,purchased_at=now()
    returning quantity into v_quantity;
  return jsonb_build_object('success',true,'balance',v_balance-v_real_price,'quantity',v_quantity);
end; $$;
grant execute on function public.purchase_world_item(uuid,text,integer) to authenticated;

-- 주간 보너스 지급 시 랭킹 결과와 포인트 지급 알림을 함께 만든다.
create or replace function public.award_world_weekly_bonuses(p_week_start date)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r record; v_rank integer:=0; v_bonus integer; v_count integer:=0;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  for r in select user_id,weekly_score from world_weekly_scores where week_start=p_week_start order by weekly_score desc, updated_at asc, user_id loop
    v_rank:=v_rank+1;
    v_bonus:=case when v_rank=1 then 1000 when v_rank=2 then 700 when v_rank=3 then 500 else 300 end;
    insert into world_points_ledger(user_id,amount,reason,reference_key) values(r.user_id,v_bonus,'주간 랭킹 보너스','weekly-bonus:'||p_week_start::text||':'||r.user_id::text) on conflict do nothing;
    if found then
      v_count:=v_count+1;
      insert into world_notifications(user_id,notification_type,title,body) values(r.user_id,'ranking','🏆 주간 랭킹 결과',case when v_rank=1 then '지난주 씩씩이로 선정되었어요!' else '지난주 랭킹 '||v_rank||'위로 포인트가 지급되었어요.' end);
      insert into world_notifications(user_id,notification_type,title,body) values(r.user_id,'points','💰 포인트 지급','주간 랭킹 보너스 '||v_bonus||'P가 지급되었어요.');
    end if;
  end loop;
  return jsonb_build_object('awarded',v_count);
end; $$;
grant execute on function public.award_world_weekly_bonuses(date) to authenticated;
