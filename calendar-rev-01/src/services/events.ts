import { supabase } from '../lib/supabase';

export const listEvents = (roomIds?: string[]) => {
  let query = supabase.from('events').select('*').order('event_date', { ascending: true });
  if (roomIds?.length) query = query.in('room_id', roomIds);
  return query;
};
export const createEvent = (event: Record<string, unknown>) => supabase.from('events').insert([event]);
export const updateEvent = (eventId: string, event: Record<string, unknown>) => supabase.from('events').update(event).eq('id', eventId);
export const deleteEvent = (eventId: string) => supabase.from('events').delete().eq('id', eventId);
export const listComments = (eventId: string) => supabase.from('comments').select('*').eq('event_id', eventId).order('created_at', { ascending: true });
export const createComment = (eventId: string, userId: string, content: string) => supabase.from('comments').insert([{ event_id: eventId, user_id: userId, content }]);
