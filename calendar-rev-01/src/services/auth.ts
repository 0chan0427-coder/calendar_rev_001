import { supabase } from '../lib/supabase';

export const getSession = () => supabase.auth.getSession();
export const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
export const signUp = (email: string, password: string, name: string, color: string) =>
  supabase.auth.signUp({ email, password, options: { data: { name, color } } });
export const signOut = () => supabase.auth.signOut();
export const onAuthStateChange = (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) => supabase.auth.onAuthStateChange(callback);
