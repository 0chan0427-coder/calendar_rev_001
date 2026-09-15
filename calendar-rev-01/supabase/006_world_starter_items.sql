-- 씩씩이 월드 3차: 신규 유저는 빈 방 + 기본 아이템을 아이템함에서 시작
-- 기존 003/004/005를 실행한 뒤 한 번만 실행하세요.

create or replace function public.ensure_world_room_defaults(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;

  -- 004에서 자동 배치했던 테스트용 기본 가구만 제거합니다.
  delete from world_room_items
  where user_id = p_user_id
    and ((item_id = 'sofa-basic' and x = 22 and y = 70 and scale = 0.44)
      or (item_id = 'cactus' and x = 80 and y = 69 and scale = 0.28));

  -- 기본 아이템은 방에 자동 배치하지 않고 아이템함에 지급합니다.
  insert into world_inventory(user_id, item_id)
  values
    (p_user_id, 'sofa-basic'),
    (p_user_id, 'table'),
    (p_user_id, 'chair'),
    (p_user_id, 'plant'),
    (p_user_id, 'lamp')
  on conflict (user_id, item_id) do nothing;

  return jsonb_build_object('created', true, 'starter_items', 5);
end;
$$;

grant execute on function public.ensure_world_room_defaults(uuid) to authenticated;
