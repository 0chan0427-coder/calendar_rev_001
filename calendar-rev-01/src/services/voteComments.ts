import {supabase} from '../lib/supabase';
export interface VoteComment{id:string;vote_id:string;user_id:string;body:string;created_at:string;updated_at:string}
export const listVoteComments=(voteId:string)=>supabase.from('vote_comments').select('*').eq('vote_id',voteId).order('created_at').order('id');
export const addVoteComment=(voteId:string,userId:string,body:string)=>supabase.from('vote_comments').insert({vote_id:voteId,user_id:userId,body:body.trim()}).select().single();
export const editVoteComment=(id:string,body:string)=>supabase.from('vote_comments').update({body:body.trim()}).eq('id',id).select().single();
export const removeVoteComment=(id:string)=>supabase.from('vote_comments').delete().eq('id',id).select('id').single();
