import { supabase } from '../lib/supabase';

export const listSettlements = async (roomIds: string[]) => {
  let query=supabase.from('settlements').select('*').order('created_at', {ascending:false});
  if(roomIds.length)query=query.in('room_id',roomIds);
  const {data,error}=await query;
  if(error||!data)return{data:null,error};
  const items: Record<string,unknown[]>={};
  let progressError=false;
  // Separate queries also support existing databases without an embedded FK relationship.
  for(let offset=0;offset<data.length;offset+=50){
    const ids=data.slice(offset,offset+50).map(row=>row.id);
    for(let page=0;;page++){
      const result=await supabase.from('settlement_items').select('id,settlement_id,user_id,amount,is_paid').in('settlement_id',ids).order('id').range(page*1000,page*1000+999);
      if(result.error){progressError=true;break;}
      for(const item of result.data||[])(items[item.settlement_id]||=[]).push(item);
      if((result.data||[]).length<1000)break;
    }
  }
  return{data:data.map(row=>({...row,settlement_items:progressError?null:items[row.id]||[],progress_unavailable:progressError})),error:null};
};
export const getSettlementItems = (settlementId: string) => supabase.from('settlement_items').select('*').eq('settlement_id', settlementId);
export const createSettlement = (settlement: Record<string, unknown>) => supabase.from('settlements').insert([settlement]).select().single();
export const createSettlementItems = (items: Record<string, unknown>[]) => supabase.from('settlement_items').insert(items);
export const updateSettlementItemPaid = (itemId: string, isPaid: boolean) => supabase.from('settlement_items').update({ is_paid: isPaid }).eq('id', itemId);
export const deleteSettlement = (settlementId: string) => supabase.from('settlements').delete().eq('id', settlementId);
