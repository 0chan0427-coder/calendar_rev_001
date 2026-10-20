import {supabase} from '../lib/supabase';
export type PurchaseKind='item'|'animal'|'wearable'|'window';
export interface PurchaseReceipt{id:string;item_id:string;kind:PurchaseKind;item_name:string;companion_name?:string;amount:number;created_at:string;refunded_at:string|null;block_reason:string|null}
export const purchaseQuote=(kind:PurchaseKind,id:string)=>supabase.rpc('get_world_purchase_quote',{p_kind:kind,p_item_id:id});
export const purchaseProduct=(kind:PurchaseKind,id:string,price:number,request:string,name?:string)=>supabase.rpc('purchase_world_product',{p_kind:kind,p_item_id:id,p_expected_price:price,p_request_id:request,p_name:name||null});
export const listPurchaseReceipts=(offset=0)=>supabase.rpc('list_world_purchase_receipts',{p_offset:offset});
export const refundPurchase=(id:string)=>supabase.rpc('refund_world_purchase',{p_receipt_id:id});
export const purchaseReason=(reason?:string)=>({request_refunded:'이 구매 요청은 이미 환불됐어요. 창을 닫고 다시 구매해주세요.',insufficient_points:'포인트가 부족해요.',already_owned:'이미 보유한 품목이에요.',invalid_item:'현재 구매할 수 없는 품목이에요.',free_item:'기본 제공 품목이에요.',price_changed:'가격이 변경됐어요. 다시 확인한 뒤 구매해주세요.',invalid_name:'동물 이름을 1~20자로 입력해주세요.',already_refunded:'이미 환불한 구매예요.',not_found:'본인의 구매 내역을 찾지 못했어요.',not_owned:'회수할 품목이 없어요. 보유 상태를 확인해주세요.',equipped:'착용 중이에요. 미니미 또는 동물 꾸미기에서 해제하고 저장해주세요.',placed:'배치 중이에요. 내 아이템에서 먼저 수거해주세요.',applied:'사용 중인 배경이에요. 기본 벽지·바닥·풍경으로 변경해주세요.',active_animal:'함께하는 동물이에요. 방 꾸미기에서 동물을 선택하고 함께하기를 해제해주세요.'} as Record<string,string>)[reason||'']||'처리하지 못했어요. 잠시 후 다시 시도해주세요.';
