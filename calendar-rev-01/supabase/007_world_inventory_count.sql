-- 씩씩이 월드 4차: 아이템 수량/배치 제한 + 수거 + 안전한 배치
alter table public.world_inventory
  add column if not exists quantity integer not null default 1;

update public.world_inventory set quantity = 1 where quantity is null or quantity < 1;

create or replace function public.purchase_world_item(p_user_id uuid, p_item_id text, p_price integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_balance integer;
  v_quantity integer;
begin
  if auth.uid() <> p_user_id or p_price < 0 then raise exception 'not allowed'; end if;
  select coalesce(sum(amount),0) into v_balance from world_points_ledger where user_id=p_user_id;
  if v_balance < p_price then return jsonb_build_object('success',false,'reason','insufficient_points'); end if;

  insert into world_points_ledger(user_id,amount,reason,reference_key)
    values(p_user_id,-p_price,'월드 아이템 구매','purchase:'||p_item_id||':'||p_user_id::text||':'||extract(epoch from now())::text);

  insert into world_inventory(user_id,item_id,quantity)
    values(p_user_id,p_item_id,1)
    on conflict (user_id,item_id) do update set quantity = world_inventory.quantity + 1, purchased_at = now()
    returning quantity into v_quantity;

  return jsonb_build_object('success',true,'balance',v_balance-p_price,'quantity',v_quantity);
end; $$;
grant execute on function public.purchase_world_item(uuid,text,integer) to authenticated;

create or replace function public.place_world_room_item(
  p_user_id uuid, p_item_id text, p_x numeric default 24, p_y numeric default 38,
  p_scale numeric default 0.50, p_z_index integer default 12
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_quantity integer;
  v_id uuid;
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  if p_scale < 0.25 or p_scale > 1.10 then raise exception 'invalid scale'; end if;

  select quantity into v_quantity from world_inventory
    where user_id=p_user_id and item_id=p_item_id for update;
  if coalesce(v_quantity,0) <= 0 then
    return jsonb_build_object('success',false,'reason','no_available_item');
  end if;

  insert into world_room_items(user_id,item_id,x,y,scale,z_index)
    values(p_user_id,p_item_id,greatest(4,least(96,p_x)),greatest(5,least(92,p_y)),p_scale,p_z_index)
    returning id into v_id;

  update world_inventory set quantity = quantity - 1 where user_id=p_user_id and item_id=p_item_id;
  return jsonb_build_object('success',true,'id',v_id,'remaining',v_quantity-1);
end; $$;
grant execute on function public.place_world_room_item(uuid,text,numeric,numeric,numeric,integer) to authenticated;

create or replace function public.remove_world_room_item(p_user_id uuid, p_room_item_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_item_id text;
begin
  if auth.uid() <> p_user_id then raise exception 'not allowed'; end if;
  select item_id into v_item_id from world_room_items where id=p_room_item_id and user_id=p_user_id;
  if v_item_id is null then return jsonb_build_object('success',false,'reason','not_found'); end if;

  delete from world_room_items where id=p_room_item_id and user_id=p_user_id;
  insert into world_inventory(user_id,item_id,quantity) values(p_user_id,v_item_id,1)
    on conflict (user_id,item_id) do update set quantity = world_inventory.quantity + 1;
  return jsonb_build_object('success',true,'item_id',v_item_id);
end; $$;
grant execute on function public.remove_world_room_item(uuid,uuid) to authenticated;
