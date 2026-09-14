import { supabase } from '../lib/supabase';

export const listVotes = (roomIds?: string[]) => {
  let query = supabase.from('votes').select('*').order('created_at', { ascending: false });
  if (roomIds?.length) query = query.in('room_id', roomIds);
  return query;
};
export const getVoteDetails = (voteId: string) => Promise.all([
  supabase.from('vote_options').select('*').eq('vote_id', voteId),
  supabase.from('vote_records').select('*').eq('vote_id', voteId)
]);
export const createVote = (vote: Record<string, unknown>) => supabase.from('votes').insert([vote]).select().single();
export const createVoteOptions = (options: { vote_id: string; content: string }[]) => supabase.from('vote_options').insert(options);
export const replaceUserVote = async (voteId: string, userId: string, optionIds: string[]) => {
  const { error } = await supabase.from('vote_records').delete().match({ vote_id: voteId, user_id: userId });
  if (error) return { error };
  return supabase.from('vote_records').insert(optionIds.map(option_id => ({ vote_id: voteId, option_id, user_id: userId })));
};
export const updateVoteStatus = (voteId: string, status: string) => supabase.from('votes').update({ status }).eq('id', voteId);
export const deleteVote = (voteId: string) => supabase.from('votes').delete().eq('id', voteId);
