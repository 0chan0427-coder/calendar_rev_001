import { supabase } from '../lib/supabase';

export const listSettlements = (roomIds: string[]) => roomIds.length
  ? supabase.from('settlements').select('*').in('room_id', roomIds).order('created_at', { ascending: false })
  : Promise.resolve({ data: [], error: null });
export const getSettlementItems = (settlementId: string) => supabase.from('settlement_items').select('*').eq('settlement_id', settlementId);
export const createSettlement = (settlement: Record<string, unknown>) => supabase.from('settlements').insert([settlement]).select().single();
export const createSettlementItems = (items: Record<string, unknown>[]) => supabase.from('settlement_items').insert(items);
export const updateSettlementItemPaid = (itemId: string, isPaid: boolean) => supabase.from('settlement_items').update({ is_paid: isPaid }).eq('id', itemId);
export const deleteSettlement = (settlementId: string) => supabase.from('settlements').delete().eq('id', settlementId);
