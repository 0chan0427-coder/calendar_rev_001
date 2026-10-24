-- V056. Run after 023, 024, 025. No companion IDs, receipts, names or bond progress are replaced.
begin;
alter table public.world_wearable_catalog drop constraint if exists world_wearable_catalog_target_check;
alter table public.world_wearable_catalog add constraint world_wearable_catalog_target_check check(target in ('avatar','cat','companion'));
alter table public.world_wearable_catalog add column if not exists compatible_species text[];
alter table public.world_wearable_catalog drop constraint if exists world_wearable_companion_species_check;
alter table public.world_wearable_catalog add constraint world_wearable_companion_species_check check(target<>'companion' or coalesce(cardinality(compatible_species),0)>0);
insert into public.world_wearable_catalog(item_id,target,slot,price,compatible_species) values('sunglasses-dog','companion','glasses',1000,array['dog'])
on conflict(item_id) do update set target=excluded.target,slot=excluded.slot,price=excluded.price,compatible_species=excluded.compatible_species;
-- Legacy decorated animal IDs remain as ownership/refund aliases, but cannot be sold again.
update public.world_item_catalog set is_active=false where item_id in('cat-ribbon','adult-cat-ribbon','dog-sunglasses','adult-dog-sunglasses');
update public.world_item_catalog set item_name=case
 when item_id in('cat-ribbon','cat-white') then '아기 하얀 고양이'
 when item_id in('adult-cat-ribbon','adult-cat-white') then '하얀 고양이'
 when item_id in('dog-sunglasses','dog-brown') then '아기 갈색 강아지'
 when item_id in('adult-dog-sunglasses','adult-dog-brown') then '갈색 강아지' else item_name end
where item_id in('cat-ribbon','cat-white','adult-cat-ribbon','adult-cat-white','dog-sunglasses','dog-brown','adult-dog-sunglasses','adult-dog-brown');
create table if not exists public.world_companion_legacy_conversions(
 companion_id uuid primary key,
 user_id uuid not null references public.profiles(id) on delete cascade,
 wearable_id text not null references public.world_wearable_catalog(item_id),
 converted_at timestamptz not null default now()
);
alter table public.world_companion_legacy_conversions enable row level security;
revoke all on public.world_companion_legacy_conversions from public,anon,authenticated;
grant select on public.world_companion_legacy_conversions to authenticated;
grant all on public.world_companion_legacy_conversions to service_role;
drop policy if exists "own legacy conversions" on public.world_companion_legacy_conversions;
create policy "own legacy conversions" on public.world_companion_legacy_conversions for select to authenticated using(user_id=auth.uid());
do $$declare c record;added integer;wear text;wear_slot text;
begin
 for c in select * from public.world_companions where item_id in('cat-ribbon','adult-cat-ribbon','dog-sunglasses','adult-dog-sunglasses') loop
  wear:=case when c.item_id like '%cat-ribbon' then 'ribbon-cat' else 'sunglasses-dog' end;
  wear_slot:=case when wear='ribbon-cat' then 'accessory' else 'glasses' end;
  insert into public.world_companion_legacy_conversions(companion_id,user_id,wearable_id) values(c.id,c.user_id,wear) on conflict do nothing;
  get diagnostics added=row_count;
  if added=1 then
   insert into public.world_wardrobe(user_id,item_id) values(c.user_id,wear) on conflict do nothing;
   insert into public.world_equipment(user_id,target_id,slot,item_id) values(c.user_id,c.id::text,wear_slot,wear) on conflict do nothing;
  end if;
 end loop;
end;$$;
create or replace function public.save_world_appearance(p_target_id text,p_equipment jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid();t text;pair record;item record;animal text;species text;
begin
 if u is null then raise exception 'authentication required';end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 if p_target_id='avatar' then t:='avatar';
 else
  select item_id into animal from world_companions where id::text=p_target_id and user_id=u for update;
  if not found then raise exception 'not your compatible companion';end if;
  if animal ~ '^(adult-)?cat-' then t:='cat';
  else t:='companion';end if;
  species:=split_part(regexp_replace(animal,'^adult-',''),'-',1);
 end if;
 if p_equipment is null or jsonb_typeof(p_equipment)<>'object' then raise exception 'invalid equipment';end if;
 for pair in select key,value from jsonb_each_text(p_equipment) loop
  select * into item from world_wearable_catalog where item_id=pair.value;
  if not found then raise exception 'unknown wearable';end if;
  if item.target<>t or item.slot<>pair.key or (t='companion' and not coalesce(species=any(item.compatible_species),false)) then raise exception 'incompatible slot';end if;
  if item.price>0 and not exists(select 1 from world_wardrobe where user_id=u and item_id=item.item_id) then raise exception 'item not owned';end if;
 end loop;
 delete from world_equipment where user_id=u and target_id=p_target_id;
 insert into world_equipment(user_id,target_id,slot,item_id) select u,p_target_id,key,value from jsonb_each_text(p_equipment);
 -- Purchased ribbon and reward necklace share a neck slot. A deliberate ribbon save replaces the necklace.
 if t='cat' and p_equipment->>'accessory'='ribbon-cat' then update world_companions set reward_accessory=false,updated_at=now() where id::text=p_target_id and user_id=u;end if;
 return jsonb_build_object('success',true);
end;$$;
revoke all on function public.save_world_appearance(text,jsonb) from public,anon;
grant execute on function public.save_world_appearance(text,jsonb) to authenticated;
commit;
