import { supabase } from '../lib/supabase';

export const listRooms = () => supabase.from('rooms').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
export const createRoom = (name: string) => supabase.from('rooms').insert([{ name: name.trim() }]);
export const updateRoom = (roomId: string, name: string) => supabase.from('rooms').update({ name: name.trim() }).eq('id', roomId);
export const deleteRoom = (roomId: string) => supabase.from('rooms').delete().eq('id', roomId);
export const updateRoomSortOrder = (roomId: string, sortOrder: number) => supabase.from('rooms').update({ sort_order: sortOrder }).eq('id', roomId);
export const listRoomMembers = (roomId: string) => supabase.from('room_members').select('user_id').eq('room_id', roomId);
