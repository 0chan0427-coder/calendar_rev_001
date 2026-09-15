import { supabase } from '../lib/supabase';

export const ensureWorldProfile = async (userId: string) =>
  await supabase.rpc('ensure_world_profile', { p_user_id: userId });

export const awardWorldWeeklyBonuses = async (week: string) =>
  await supabase.rpc('award_world_weekly_bonuses', { p_week_start: week });

export const recordWorldActivity = async (
  userId: string,
  activityType: 'attendance' | 'chat' | 'visit',
  targetUserId?: string,
) => await supabase.rpc('record_world_daily_activity', {
  p_user_id: userId,
  p_activity_type: activityType,
  p_target_user_id: targetUserId ?? null,
});

export const getWorldProfile = (userId: string) =>
  supabase.from('world_profiles').select('*').eq('user_id', userId).maybeSingle();

export const getWorldProfiles = () =>
  supabase.from('world_profiles').select('*').order('display_name', { ascending: true });

export const updateWorldProfile = (userId: string, values: Record<string, unknown>) =>
  supabase.from('world_profiles').update(values).eq('user_id', userId);

export const getWorldPoints = async (userId: string) => {
  const { data, error } = await supabase
    .from('world_points_ledger')
    .select('amount')
    .eq('user_id', userId);
  if (error) return { data: null, error };
  return { data: (data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0), error: null };
};

export const getWorldDailyStatus = (userId: string, dateKey: string) =>
  supabase.from('world_daily_activity').select('*').eq('user_id', userId).eq('activity_date', dateKey);

export const visitWorldHome = (visitorId: string, ownerId: string) =>
  supabase.rpc('visit_world_home', { p_visitor_id: visitorId, p_owner_id: ownerId });

export const toggleWorldLike = (userId: string, ownerId: string) =>
  supabase.rpc('toggle_world_like', { p_user_id: userId, p_owner_id: ownerId });

export const listWorldRanking = (weekStart: string) =>
  supabase.from('world_weekly_scores').select('*').eq('week_start', weekStart).order('weekly_score', { ascending: false }).limit(100);

export const listLastWeekWinner = (weekStart: string) =>
  supabase.from('world_weekly_scores').select('*').eq('week_start', weekStart).order('weekly_score', { ascending: false }).limit(1);

export const purchaseWorldItem = (userId: string, itemId: string, price: number) =>
  supabase.rpc('purchase_world_item', { p_user_id: userId, p_item_id: itemId, p_price: price });

export const listWorldInventory = (userId: string) =>
  supabase.from('world_inventory').select('*').eq('user_id', userId);

export const listWorldGuestbook = (ownerId: string) =>
  supabase.from('world_guestbook').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }).limit(50);

export const createWorldGuestbook = (ownerId: string, writerId: string, content: string) =>
  supabase.from('world_guestbook').insert([{ owner_id: ownerId, writer_id: writerId, content }]);


export const listWorldRoomItems = (userId: string) =>
  supabase.from('world_room_items').select('*').eq('user_id', userId).order('z_index', { ascending: true });

export const addWorldRoomItem = (userId: string, itemId: string, x = 25, y = 38, scale = 0.5, zIndex = 12) =>
  supabase.rpc('place_world_room_item', { p_user_id: userId, p_item_id: itemId, p_x: x, p_y: y, p_scale: scale, p_z_index: zIndex });

export const updateWorldRoomItem = (userId: string, id: string, values: { x?: number; y?: number; scale?: number; z_index?: number }) =>
  supabase.from('world_room_items').update(values).eq('id', id).eq('user_id', userId);

export const deleteWorldRoomItem = (userId: string, id: string) =>
  supabase.rpc('remove_world_room_item', { p_user_id: userId, p_room_item_id: id });
