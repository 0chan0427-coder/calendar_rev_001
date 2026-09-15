import { supabase } from '../lib/supabase';

export const ensureWorldProfile = async (userId: string) =>
  await supabase.rpc('ensure_world_profile', { p_user_id: userId });

export const syncWorldProfiles = async () =>
  await supabase.rpc('sync_world_profiles');

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


export const createWorldGuestbookSecure = (ownerId: string, content: string, isSecret: boolean) =>
  supabase.rpc('create_world_guestbook', { p_owner_id: ownerId, p_content: content, p_is_secret: isSecret });

export const listWorldGuestbookSecure = (ownerId: string) =>
  supabase.rpc('list_world_guestbook', { p_owner_id: ownerId });

export const createWorldGuestbookReply = (guestbookId: string, content: string) =>
  supabase.rpc('create_world_guestbook_reply', { p_guestbook_id: guestbookId, p_content: content });

export const listWorldTodayAttendance = () =>
  supabase.rpc('list_world_today_attendance');

export const listWorldNotifications = () =>
  supabase.rpc('list_world_notifications', { p_limit: 50 });

export const markWorldNotificationsRead = () =>
  supabase.rpc('mark_world_notifications_read');

export const sendWorldGift = (recipientId: string, itemId: string) =>
  supabase.rpc('send_world_gift', { p_recipient_id: recipientId, p_item_id: itemId });

export const listWorldRankingHistory = () =>
  supabase.from('world_weekly_scores').select('*').order('week_start', { ascending: false }).order('weekly_score', { ascending: false }).limit(1000);

export const listWorldItemCatalog = () =>
  supabase.from('world_item_catalog').select('*').eq('is_active', true).order('sort_order', { ascending: true }).order('item_name', { ascending: true });

export const listWorldItemCatalogAdmin = () =>
  supabase.from('world_item_catalog').select('*').order('sort_order', { ascending: true }).order('item_name', { ascending: true });

export const checkWorldAdmin = () => supabase.rpc('is_admin');

export const adminUpsertWorldItem = (item: Record<string, unknown>) =>
  supabase.rpc('admin_upsert_world_item', {
    p_item_id: item.item_id,
    p_item_name: item.item_name,
    p_item_type: item.item_type,
    p_price: item.price,
    p_category: item.category,
    p_subcategory: item.subcategory,
    p_description: item.description,
    p_image_url: item.image_url ?? null,
    p_placement_type: item.placement_type,
    p_min_scale: item.min_scale,
    p_max_scale: item.max_scale,
    p_default_z_index: item.default_z_index,
    p_animation_type: item.animation_type,
    p_is_active: item.is_active,
    p_sort_order: item.sort_order,
  });

export const adminDeleteWorldItem = (itemId: string) =>
  supabase.rpc('admin_delete_world_item', { p_item_id: itemId });

export const uploadWorldItemImage = async (file: File, itemId: string) => {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const path = `${itemId}/${crypto.randomUUID()}-${safeName}`;
  const upload = await supabase.storage.from('world-items').upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (upload.error) return { data: null, error: upload.error };
  const { data } = supabase.storage.from('world-items').getPublicUrl(path);
  return { data: data.publicUrl, error: null };
};

export const listWorldCompanions = (userId: string) =>
  supabase.from('world_companions').select('*').eq('user_id', userId).order('created_at', { ascending: true });

export const purchaseWorldAnimal = (userId: string, itemId: string, name: string) =>
  supabase.rpc('purchase_world_animal', { p_user_id: userId, p_item_id: itemId, p_name: name });

export const setWorldActiveCompanion = (userId: string, companionId: string) =>
  supabase.rpc('set_world_active_companion', { p_user_id: userId, p_companion_id: companionId });

export const renameWorldCompanion = (userId: string, companionId: string, name: string) =>
  supabase.rpc('rename_world_companion', { p_user_id: userId, p_companion_id: companionId, p_name: name });
