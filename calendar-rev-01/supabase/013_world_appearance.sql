-- V030. Existing 001–012 setup is required. Safe to re-run; existing equipment is retained.
begin;
create table if not exists public.world_wearable_catalog (
 item_id text primary key, target text not null check(target in ('avatar','cat')),
 slot text not null, price integer not null check(price>=0 and price%100=0)
);
create table if not exists public.world_wardrobe (
 user_id uuid not null references public.profiles(id) on delete cascade,
 item_id text not null references public.world_wearable_catalog(item_id),
 primary key(user_id,item_id)
);
create table if not exists public.world_equipment (
 user_id uuid not null references public.profiles(id) on delete cascade,
 target_id text not null, slot text not null,
 item_id text not null references public.world_wearable_catalog(item_id),
 primary key(user_id,target_id,slot)
);
alter table public.world_wearable_catalog enable row level security;
alter table public.world_wardrobe enable row level security;
alter table public.world_equipment enable row level security;
drop policy if exists "wearable catalog read" on public.world_wearable_catalog;
create policy "wearable catalog read" on public.world_wearable_catalog for select to authenticated using(true);
drop policy if exists "wardrobe own read" on public.world_wardrobe;
create policy "wardrobe own read" on public.world_wardrobe for select to authenticated using(user_id=auth.uid());
drop policy if exists "equipment member read" on public.world_equipment;
create policy "equipment member read" on public.world_equipment for select to authenticated using(true);
revoke all on public.world_wearable_catalog,public.world_wardrobe,public.world_equipment from anon,authenticated;
grant select on public.world_wearable_catalog,public.world_wardrobe,public.world_equipment to authenticated;
grant all on public.world_wearable_catalog,public.world_wardrobe,public.world_equipment to service_role;

create or replace function public.purchase_world_wearable(p_item_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); p integer; b bigint;
begin
 if u is null then raise exception 'authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 select price into p from world_wearable_catalog where item_id=p_item_id;
 if not found then raise exception 'unknown wearable'; end if;
 if p=0 or exists(select 1 from world_wardrobe where user_id=u and item_id=p_item_id) then return jsonb_build_object('success',true); end if;
 select coalesce(sum(amount),0) into b from world_points_ledger where user_id=u;
 if b<p then return jsonb_build_object('success',false,'reason','insufficient_points'); end if;
 insert into world_points_ledger(user_id,amount,reason,reference_key) values(u,-p,'꾸미기 아이템 구매','wearable:'||u::text||':'||p_item_id);
 insert into world_wardrobe(user_id,item_id) values(u,p_item_id);
 return jsonb_build_object('success',true,'balance',b-p);
end; $$;
revoke all on function public.purchase_world_wearable(text) from public,anon;
grant execute on function public.purchase_world_wearable(text) to authenticated;

create or replace function public.save_world_appearance(p_target_id text,p_equipment jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); t text; pair record; item record;
begin
 if u is null then raise exception 'authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 if p_target_id='avatar' then t:='avatar';
 elsif exists(select 1 from world_companions where id::text=p_target_id and user_id=u and (item_id ilike '%cat%' or item_id like '%고양%')) then t:='cat';
 else raise exception 'not your compatible companion'; end if;
 if jsonb_typeof(p_equipment)<>'object' or p_equipment is null then raise exception 'invalid equipment'; end if;
 for pair in select key,value from jsonb_each_text(p_equipment) loop
  select * into item from world_wearable_catalog where item_id=pair.value;
  if not found then raise exception 'unknown wearable'; end if;
  if item.target<>t or item.slot<>pair.key then raise exception 'incompatible slot'; end if;
  if item.price>0 and not exists(select 1 from world_wardrobe where user_id=u and item_id=item.item_id) then raise exception 'item not owned'; end if;
 end loop;
 delete from world_equipment where user_id=u and target_id=p_target_id;
 insert into world_equipment(user_id,target_id,slot,item_id) select u,p_target_id,key,value from jsonb_each_text(p_equipment);
 return jsonb_build_object('success',true);
end; $$;
revoke all on function public.save_world_appearance(text,jsonb) from public,anon;
grant execute on function public.save_world_appearance(text,jsonb) to authenticated;

alter table public.world_room_items add column if not exists scene_type text not null default 'interior' check(scene_type in ('interior','exterior'));
create or replace function public.place_world_scene_item(p_user_id uuid,p_item_id text,p_x numeric,p_y numeric,p_scale numeric,p_z_index integer,p_scene_type text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q integer; v_id uuid; c record;
begin
 if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'not allowed'; end if;
 if p_scene_type not in ('interior','exterior') or p_scene_type is null then raise exception 'invalid scene'; end if;
 select * into c from world_item_catalog where item_id=p_item_id and is_active=true;
 if not found then raise exception 'unknown item'; end if;
 if c.placement_type<>(case when p_scene_type='exterior' then 'garden' else 'room' end) then raise exception 'wrong scene'; end if;
 if p_scale is null or p_scale<coalesce(c.min_scale,0.25) or p_scale>coalesce(c.max_scale,1.1) then raise exception 'invalid scale'; end if;
 select quantity into q from world_inventory where user_id=p_user_id and item_id=p_item_id for update;
 if coalesce(q,0)<=0 then return jsonb_build_object('success',false,'reason','no_available_item'); end if;
 insert into world_room_items(user_id,item_id,x,y,scale,z_index,scene_type) values(p_user_id,p_item_id,greatest(4,least(96,p_x)),greatest(5,least(92,p_y)),p_scale,p_z_index,p_scene_type) returning id into v_id;
 update world_inventory set quantity=quantity-1 where user_id=p_user_id and item_id=p_item_id;
 return jsonb_build_object('success',true,'id',v_id);
end; $$;
revoke all on function public.place_world_scene_item(uuid,text,numeric,numeric,numeric,integer,text) from public,anon;
grant execute on function public.place_world_scene_item(uuid,text,numeric,numeric,numeric,integer,text) to authenticated;
insert into public.world_wearable_catalog(item_id,target,slot,price) values
('hair-chestnut','avatar','hair',0),
('hair-black','avatar','hair',1500),
('hair-rose','avatar','hair',2000),
('top-mint','avatar','top',0),
('top-pink','avatar','top',1500),
('bottom-mint','avatar','bottom',0),
('bottom-pink','avatar','bottom',1500),
('shoes-cream','avatar','shoes',0),
('ribbon-avatar','avatar','accessory',1000),
('cat-ivory','cat','coat',0),
('cat-cheese','cat','coat',1500),
('cat-gray','cat','coat',1500),
('ribbon-cat','cat','accessory',500)
on conflict(item_id) do update set target=excluded.target,slot=excluded.slot,price=excluded.price;

commit;
