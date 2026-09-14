import { supabase } from '../lib/supabase';

export const getProfile = (userId: string) => supabase.from('profiles').select('*').eq('id', userId).single();
export const getProfiles = () => supabase.from('profiles').select('*');
export const getPendingProfiles = () => supabase.from('profiles').select('*').eq('status', 'pending');
export const updateOwnNameRequest = (userId: string, requestedName: string) => supabase.from('profiles').update({ requested_name: requestedName, name_status: 'pending' }).eq('id', userId);
export const updateProfileColor = (userId: string, color: string) => supabase.from('profiles').update({ color }).eq('id', userId);
export const approveUser = (userId: string) => supabase.from('profiles').update({ status: 'approved' }).eq('id', userId);
export const approveNameChange = (userId: string, name: string) => supabase.from('profiles').update({ name, requested_name: null, name_status: 'approved' }).eq('id', userId);
export const rejectNameChange = (userId: string) => supabase.from('profiles').update({ requested_name: null, name_status: 'approved' }).eq('id', userId);
