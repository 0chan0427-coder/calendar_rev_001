-- V055. Run after 024. Extends special forms without resetting care, rewards or hearts.
begin;
create table if not exists public.world_companion_special_catalog(
 sprite_key text primary key,
 image_path text not null,
 is_ready boolean not null default true
);
alter table public.world_companion_special_catalog enable row level security;
revoke all on public.world_companion_special_catalog from anon,authenticated;
grant select on public.world_companion_special_catalog to authenticated;
grant all on public.world_companion_special_catalog to service_role;
drop policy if exists "special catalog read" on public.world_companion_special_catalog;
create policy "special catalog read" on public.world_companion_special_catalog for select to authenticated using(true);
insert into public.world_companion_special_catalog(sprite_key,image_path,is_ready) values
 ('adult-cat-ginger','/world/bond-055-01/adult-cat-ginger.png',true),
 ('adult-cat-gray','/world/bond-055-01/adult-cat-gray.png',true),
 ('adult-cat-ivory','/world/bond-054/adult-moon-cat.png',true),
 ('adult-crocodile','/world/bond-055-01/adult-crocodile.png',true),
 ('adult-dog','/world/bond-055-01/adult-dog.png',true),
 ('adult-dragon-black','/world/bond-055-01/adult-dragon-black.png',true),
 ('adult-dragon-blue','/world/bond-055-01/adult-dragon-blue.png',true),
 ('adult-dragon-crown','/world/bond-055-01/adult-dragon-crown.png',true),
 ('adult-dragon-glowing','/world/bond-055-01/adult-dragon-glowing.png',true),
 ('adult-dragon-gold','/world/bond-055-01/adult-dragon-gold.png',true),
 ('adult-dragon-green','/world/bond-055-01/adult-dragon-green.png',true),
 ('adult-dragon-red','/world/bond-055-01/adult-dragon-red.png',true),
 ('adult-eagle','/world/bond-055-01/adult-eagle.png',true),
 ('adult-elephant','/world/bond-055-01/adult-elephant.png',true),
 ('adult-fox','/world/bond-055-01/adult-fox.png',true),
 ('adult-panda','/world/bond-055-01/adult-panda.png',true),
 ('adult-rabbit','/world/bond-055-01/adult-rabbit.png',true),
 ('adult-tiger','/world/bond-055-01/adult-tiger.png',true),
 ('adult-unicorn','/world/bond-055-01/adult-unicorn.png',true),
 ('adult-whale','/world/bond-055-01/adult-whale.png',true),
 ('cat-ginger','/world/bond-055-01/cat-ginger.png',true),
 ('cat-gray','/world/bond-055-02/cat-gray.png',true),
 ('cat-ivory','/world/bond-054/baby-moon-cat.png',true),
 ('crocodile','/world/bond-055-02/crocodile.png',true),
 ('dog','/world/bond-055-02/dog.png',true),
 ('dragon-baby','/world/bond-055-02/dragon-baby.png',true),
 ('dragon-black','/world/bond-055-02/dragon-black.png',true),
 ('dragon-blue','/world/bond-055-02/dragon-blue.png',true),
 ('dragon-crown','/world/bond-055-02/dragon-crown.png',true),
 ('dragon-glowing','/world/bond-055-02/dragon-glowing.png',true),
 ('dragon-gold','/world/bond-055-02/dragon-gold.png',true),
 ('dragon-green','/world/bond-055-02/dragon-green.png',true),
 ('dragon-red','/world/bond-055-02/dragon-red.png',true),
 ('eagle','/world/bond-055-02/eagle.png',true),
 ('elephant','/world/bond-055-02/elephant.png',true),
 ('fox','/world/bond-055-02/fox.png',true),
 ('panda','/world/bond-055-02/panda.png',true),
 ('rabbit','/world/bond-055-02/rabbit.png',true),
 ('tiger','/world/bond-055-02/tiger.png',true),
 ('unicorn','/world/bond-055-02/unicorn.png',true),
 ('whale','/world/bond-055-02/whale.png',true)
on conflict(sprite_key) do update set image_path=excluded.image_path,is_ready=excluded.is_ready;

-- Mirrors companionSpecialKey: aliases first, explicit cat coat next.
create or replace function public.world_companion_special_key(p_item_id text,p_coat text default null)
returns text language plpgsql immutable set search_path=public as $$
declare k text:=replace(lower(p_item_id),'_','-');prefix text;
begin
 k:=case k
 when 'cat-white' then 'cat-ivory' when 'cat-ribbon' then 'cat-ivory'
 when 'adult-cat-white' then 'adult-cat-ivory' when 'adult-cat-ribbon' then 'adult-cat-ivory'
 when 'dog-brown' then 'dog' when 'dog-sunglasses' then 'dog'
 when 'adult-dog-brown' then 'adult-dog' when 'adult-dog-sunglasses' then 'adult-dog'
 when 'dragon' then 'dragon-red' else k end;
 if k ~ '^(adult-)?cat-' then
  prefix:=case when k like 'adult-%' then 'adult-' else '' end;
  if p_coat='cat-cheese' then k:=prefix||'cat-ginger';
  elsif p_coat='cat-gray' then k:=prefix||'cat-gray';
  elsif p_coat='cat-ivory' then k:=prefix||'cat-ivory';end if;
 end if;
 return k;
end;$$;
revoke all on function public.world_companion_special_key(text,text) from public,anon,authenticated;

create or replace function public.set_world_companion_reward(p_companion_id uuid,p_kind text,p_enabled boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c world_companions;coat text;k text;
begin
 if auth.uid() is null then raise exception 'authentication required';end if;
 if p_kind is null or p_kind not in ('accessory','special') or p_enabled is null then raise exception 'invalid reward';end if;
 select * into c from world_companions where id=p_companion_id and user_id=auth.uid() for update;
 if not found then raise exception 'companion not found';end if;
 if p_enabled and not exists(select 1 from world_companion_rewards where user_id=c.user_id and item_id=c.item_id and kind=p_kind) then raise exception 'reward locked';end if;
 if p_enabled and p_kind='special' then
  select item_id into coat from world_equipment where user_id=c.user_id and target_id=c.id::text and slot='coat';
  k:=world_companion_special_key(c.item_id,coat);
  if not exists(select 1 from world_companion_special_catalog where sprite_key=k and is_ready) then raise exception 'special artwork not registered';end if;
 end if;
 update world_companions set reward_accessory=case when p_kind='accessory' then p_enabled else reward_accessory end,
 special_form=case when p_kind='special' then p_enabled else special_form end,updated_at=now() where id=c.id;
 return get_world_companion_bond(c.id)||jsonb_build_object('success',true);
end;$$;
revoke all on function public.set_world_companion_reward(uuid,text,boolean) from public,anon;
grant execute on function public.set_world_companion_reward(uuid,text,boolean) to authenticated;
commit;
