-- 씩씩이 월드 2차: 실제 미니홈 방 꾸미기/배치 저장
create table if not exists public.world_room_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  x numeric(5,2) not null default 50 check (x >= 0 and x <= 100),
  y numeric(5,2) not null default 65 check (y >= 0 and y <= 100),
  scale numeric(4,2) not null default 0.42 check (scale >= 0.2 and scale <= 1.2),
  z_index integer not null default 6,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.world_room_items enable row level security;
drop policy if exists "world room items readable" on public.world_room_items;
drop policy if exists "own world room items insert" on public.world_room_items;
drop policy if exists "own world room items update" on public.world_room_items;
drop policy if exists "own world room items delete" on public.world_room_items;
create policy "world room items readable" on public.world_room_items for select to authenticated using (true);
create policy "own world room items insert" on public.world_room_items for insert to authenticated with check (auth.uid() = user_id);
create policy "own world room items update" on public.world_room_items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own world room items delete" on public.world_room_items for delete to authenticated using (auth.uid() = user_id);

create or replace function public.ensure_world_room_defaults(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  if not exists(select 1 from world_room_items where user_id=p_user_id) then
    insert into world_room_items(user_id,item_id,x,y,scale,z_index) values
      (p_user_id,'sofa-basic',22,70,0.44,5),
      (p_user_id,'cactus',80,69,0.28,6);
  end if;
  return jsonb_build_object('created', true);
end; $$;
grant execute on function public.ensure_world_room_defaults(uuid) to authenticated;
