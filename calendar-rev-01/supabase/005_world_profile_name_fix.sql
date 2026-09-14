-- 씩씩이 월드 오류 수정: 기존 profiles 테이블의 사용자 이름 컬럼은 display_name이 아니라 name입니다.
create or replace function public.ensure_world_profile(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_exists boolean;
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  select exists(select 1 from world_profiles where user_id=p_user_id) into v_exists;
  insert into world_profiles(user_id, display_name)
    select p_user_id, coalesce(name, '') from profiles where id=p_user_id
    on conflict (user_id) do update set display_name=excluded.display_name, updated_at=now();
  if not v_exists then
    insert into world_points_ledger(user_id, amount, reason, reference_key)
    values(p_user_id, 3000, '월드 시작 선물', 'welcome:' || p_user_id::text)
    on conflict do nothing;
  end if;
  return jsonb_build_object('created', not v_exists);
end; $$;

grant execute on function public.ensure_world_profile(uuid) to authenticated;
