-- 씩씩이 월드 7차: 포인트샵 구조화 + 관리자 아이템 관리

alter table public.world_item_catalog add column if not exists category text not null default '기타';
alter table public.world_item_catalog add column if not exists subcategory text not null default '';
alter table public.world_item_catalog add column if not exists description text not null default '';
alter table public.world_item_catalog add column if not exists image_url text;
alter table public.world_item_catalog add column if not exists placement_type text not null default 'none';
alter table public.world_item_catalog add column if not exists min_scale numeric not null default 0.5;
alter table public.world_item_catalog add column if not exists max_scale numeric not null default 1.5;
alter table public.world_item_catalog add column if not exists default_z_index integer not null default 12;
alter table public.world_item_catalog add column if not exists animation_type text not null default 'none';
alter table public.world_item_catalog add column if not exists is_active boolean not null default true;
alter table public.world_item_catalog add column if not exists sort_order integer not null default 0;
alter table public.world_item_catalog add column if not exists updated_at timestamptz not null default now();

-- 기존 테스트 카탈로그를 새 카테고리 체계에 맞춘다.
update public.world_item_catalog set
  category = case
    when item_type='furniture' then '가구'
    when item_type='props' then '소품'
    when item_type='wallpaper' then '벽지'
    when item_type='floor' then '바닥'
    when item_type='animal' then '동물'
    when item_type='theme' then '테마'
    else '기타'
  end,
  subcategory = case
    when item_id in ('dragon-red','dragon-gold','unicorn') then '드래곤/판타지'
    when item_type='animal' then '동물'
    when item_type='furniture' then '가구'
    when item_type='props' then '소품'
    when item_type='wallpaper' then '벽지'
    when item_type='floor' then '바닥'
    when item_type='theme' then '테마'
    else ''
  end,
  placement_type = case when item_type in ('furniture','props') then 'room' else 'none' end,
  updated_at = now();

-- 기본 카탈로그는 현재 코드의 설명/이모지 fallback을 사용하므로 image_url은 비워 둔다.
-- 관리자에게 업로드된 이미지는 image_url에 Supabase Storage 공개 URL을 저장한다.

-- 관리자용 이미지 저장소. 기존 버킷이 있으면 그대로 사용한다.
insert into storage.buckets (id, name, public)
values ('world-items', 'world-items', true)
on conflict (id) do update set public=true;

create policy "world items public read" on storage.objects
  for select to public using (bucket_id='world-items');
create policy "world items admin insert" on storage.objects
  for insert to authenticated with check (bucket_id='world-items' and public.is_admin());
create policy "world items admin update" on storage.objects
  for update to authenticated using (bucket_id='world-items' and public.is_admin()) with check (bucket_id='world-items' and public.is_admin());
create policy "world items admin delete" on storage.objects
  for delete to authenticated using (bucket_id='world-items' and public.is_admin());

-- 관리자만 카탈로그를 추가/수정/삭제할 수 있다.
drop policy if exists "world item catalog admin insert" on public.world_item_catalog;
drop policy if exists "world item catalog admin update" on public.world_item_catalog;
drop policy if exists "world item catalog admin delete" on public.world_item_catalog;
create policy "world item catalog admin insert" on public.world_item_catalog
  for insert to authenticated with check (public.is_admin());
create policy "world item catalog admin update" on public.world_item_catalog
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "world item catalog admin delete" on public.world_item_catalog
  for delete to authenticated using (public.is_admin());

-- 관리자에게 카탈로그 전체를 관리할 수 있는 RPC를 제공한다.
create or replace function public.admin_upsert_world_item(
  p_item_id text,
  p_item_name text,
  p_item_type text,
  p_price integer,
  p_category text,
  p_subcategory text,
  p_description text,
  p_image_url text,
  p_placement_type text,
  p_min_scale numeric,
  p_max_scale numeric,
  p_default_z_index integer,
  p_animation_type text,
  p_is_active boolean,
  p_sort_order integer
) returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  if p_item_id is null or trim(p_item_id) = '' then raise exception 'invalid item id'; end if;
  if p_item_name is null or trim(p_item_name) = '' then raise exception 'invalid item name'; end if;
  if p_price < 0 or mod(p_price,100) <> 0 then raise exception 'price must be a multiple of 100'; end if;
  if p_min_scale <= 0 or p_max_scale < p_min_scale then raise exception 'invalid scale'; end if;
  insert into world_item_catalog(item_id,item_name,item_type,price,category,subcategory,description,image_url,placement_type,min_scale,max_scale,default_z_index,animation_type,is_active,sort_order,updated_at)
  values(trim(p_item_id),trim(p_item_name),trim(p_item_type),p_price,coalesce(nullif(trim(p_category),''),'기타'),coalesce(trim(p_subcategory),''),coalesce(trim(p_description),''),nullif(trim(coalesce(p_image_url,'')),''),coalesce(nullif(trim(p_placement_type),''),'none'),p_min_scale,p_max_scale,p_default_z_index,coalesce(nullif(trim(p_animation_type),''),'none'),p_is_active,p_sort_order,now())
  on conflict(item_id) do update set
    item_name=excluded.item_name,item_type=excluded.item_type,price=excluded.price,category=excluded.category,subcategory=excluded.subcategory,description=excluded.description,image_url=excluded.image_url,placement_type=excluded.placement_type,min_scale=excluded.min_scale,max_scale=excluded.max_scale,default_z_index=excluded.default_z_index,animation_type=excluded.animation_type,is_active=excluded.is_active,sort_order=excluded.sort_order,updated_at=now();
  return jsonb_build_object('success',true,'item_id',trim(p_item_id));
end; $$;
grant execute on function public.admin_upsert_world_item(text,text,text,integer,text,text,text,text,text,numeric,numeric,integer,text,boolean,integer) to authenticated;

create or replace function public.admin_delete_world_item(p_item_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  delete from world_item_catalog where item_id=p_item_id;
  return jsonb_build_object('success',true);
end; $$;
grant execute on function public.admin_delete_world_item(text) to authenticated;
