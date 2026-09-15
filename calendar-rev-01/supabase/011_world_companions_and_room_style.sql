-- 씩씩이 월드 8차: 미니홈피형 배경/커튼 + 동물(펫 통합) 시스템

alter table public.world_profiles
  add column if not exists curtain_id text not null default 'none';

create table if not exists public.world_companions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null references public.world_item_catalog(item_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, item_id)
);

create unique index if not exists world_companions_one_active_per_user
  on public.world_companions(user_id) where is_active = true;

alter table public.world_companions enable row level security;

drop policy if exists "world companions own read" on public.world_companions;
create policy "world companions own read" on public.world_companions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "world companions public read" on public.world_companions;
create policy "world companions public read" on public.world_companions
  for select to authenticated using (true);

create or replace function public.purchase_world_animal(
  p_user_id uuid,
  p_item_id text,
  p_name text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_price integer;
  v_balance integer;
  v_clean_name text := trim(p_name);
  v_id uuid;
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  if v_clean_name = '' or char_length(v_clean_name) > 20 then
    raise exception 'invalid animal name';
  end if;

  select price into v_price
    from world_item_catalog
   where item_id=p_item_id and category='동물' and is_active=true;
  if v_price is null then
    return jsonb_build_object('success',false,'reason','invalid_animal');
  end if;
  if exists(select 1 from world_companions where user_id=p_user_id and item_id=p_item_id) then
    return jsonb_build_object('success',false,'reason','already_owned');
  end if;

  select coalesce(sum(amount),0) into v_balance
    from world_points_ledger where user_id=p_user_id;
  if v_balance < v_price then
    return jsonb_build_object('success',false,'reason','insufficient_points');
  end if;

  insert into world_points_ledger(user_id,amount,reason,reference_key)
    values(p_user_id,-v_price,'동물 구매','animal-purchase:'||p_item_id||':'||p_user_id::text||':'||extract(epoch from now())::text);
  insert into world_inventory(user_id,item_id,quantity)
    values(p_user_id,p_item_id,1)
    on conflict(user_id,item_id) do update set quantity=world_inventory.quantity+1, purchased_at=now();

  update world_companions set is_active=false, updated_at=now() where user_id=p_user_id;
  insert into world_companions(user_id,item_id,name,is_active)
    values(p_user_id,p_item_id,v_clean_name,true)
    returning id into v_id;

  return jsonb_build_object('success',true,'id',v_id,'name',v_clean_name,'balance',v_balance-v_price);
end; $$;
grant execute on function public.purchase_world_animal(uuid,text,text) to authenticated;

create or replace function public.set_world_active_companion(p_user_id uuid, p_companion_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  if not exists(select 1 from world_companions where id=p_companion_id and user_id=p_user_id) then
    return jsonb_build_object('success',false,'reason','not_found');
  end if;
  update world_companions set is_active=false, updated_at=now() where user_id=p_user_id;
  update world_companions set is_active=true, updated_at=now() where id=p_companion_id and user_id=p_user_id;
  return jsonb_build_object('success',true);
end; $$;
grant execute on function public.set_world_active_companion(uuid,uuid) to authenticated;

create or replace function public.rename_world_companion(p_user_id uuid, p_companion_id uuid, p_name text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_name text := trim(p_name);
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  if v_name='' or char_length(v_name)>20 then raise exception 'invalid animal name'; end if;
  update world_companions set name=v_name, updated_at=now()
   where id=p_companion_id and user_id=p_user_id;
  return jsonb_build_object('success',true,'name',v_name);
end; $$;
grant execute on function public.rename_world_companion(uuid,uuid,text) to authenticated;
