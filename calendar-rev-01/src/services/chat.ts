import { supabase } from '../lib/supabase';

export const listMessages = (roomIds?: string[]) => {
  let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
  if (roomIds?.length) query = query.in('room_id', roomIds);
  return query;
};
export const createMessage = (roomId: string, userId: string, content: string) => supabase.from('messages').insert([{ room_id: roomId, user_id: userId, content }]);
export const subscribeToMessages = (onInsert: (message: any) => void) =>
  supabase.channel('calendar-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => onInsert(payload.new)).subscribe();
export const removeMessageChannel = (channel: ReturnType<typeof supabase.channel>) => supabase.removeChannel(channel);
