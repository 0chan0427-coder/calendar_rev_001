-- 씩씩이 월드 5차: 공유캘린더 승인 멤버를 월드 멤버 목록에 동기화
-- 기존 003~007 이후 한 번 실행하세요.

create or replace function public.ensure_world_profile(p_user_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_welcome_exists boolean;
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;

  insert into public.world_profiles(user_id, display_name)
    select p_user_id, coalesce(name, '') from public.profiles where id=p_user_id
    on conflict (user_id) do update set display_name=excluded.display_name, updated_at=now();

  select exists(
    select 1 from public.world_points_ledger
    where user_id=p_user_id and reference_key='welcome:'||p_user_id::text
  ) into v_welcome_exists;

  if not v_welcome_exists then
    insert into public.world_points_ledger(user_id, amount, reason, reference_key)
    values(p_user_id, 3000, '월드 시작 선물', 'welcome:' || p_user_id::text)
    on conflict do nothing;
  end if;

  return jsonb_build_object('created', not v_welcome_exists);
end; $$;

grant execute on function public.ensure_world_profile(uuid) to authenticated;

create or replace function public.sync_world_profiles()
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_count integer;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  insert into public.world_profiles(user_id, display_name)
  select p.id, coalesce(p.name, '')
  from public.profiles p
  where p.status = 'approved'
  on conflict (user_id) do update set display_name=excluded.display_name, updated_at=now();

  get diagnostics v_count = row_count;
  return jsonb_build_object('synced', v_count);
end; $$;

grant execute on function public.sync_world_profiles() to authenticated;
