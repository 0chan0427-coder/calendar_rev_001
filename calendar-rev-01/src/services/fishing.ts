import type {FightProfile,FightState} from '../data/fishingFight';
import {supabase} from '../lib/supabase';
export interface FishSpecies{id:string;name:string;tier:number;locations:string[];weight:number;min_cm:number;max_cm:number;base_price:number;display_percent:number;image_path:string;crop:number[]}
export interface FishingBait{id:string;name:string;pack_size:number;pack_price:number;modifiers:number[];size_bias:number;effect:string}
export interface CaughtFish{id:string;species_id:string;length_cm:number;sale_value:number;caught_at:string;locked:boolean;displayed?:boolean;sold_at?:string|null}
export interface FishingFight{state:FightState;profile:FightProfile;started_at:string;expires_at:string;paused:boolean;pause_remaining_ms:number}
export interface FishingCast{id:string;location:string;bait_id:string;status:string;started_at:string;bite_at:string;expires_at:string;fight?:FishingFight|null}
export interface FishingState{server_now:string;day:string;locations:{id:string;name:string}[];sale_cap:number;bag_capacity:number;balance:number;sold_today:number;species:FishSpecies[];baits:FishingBait[];bait_purchases:{id:string;bait_id:string;quantity:number;remaining:number;amount:number;created_at:string;refunded_at:string|null}[];bait_stock:Record<string,number>;bag:CaughtFish[];book:{species_id:string;count:number;max_cm:number;first_caught:string}[];milestones:number[];active_cast:FishingCast|null}
export interface FishingResult{success:boolean;reason?:string;cast?:FishingCast;status?:string;fish?:CaughtFish;book_bonus?:number;amount?:number;cost?:number;remaining?:number;replayed?:boolean}
export interface FishAquarium{owner_name:string;fish:(CaughtFish&{species:FishSpecies})|null}
export interface FishRankings{records:{user_id:string;display_name:string;length_cm:number;caught_at:string}[];collection:{user_id:string;display_name:string;species_count:number}[]}
export async function fishingRpc<T>(name:string,args:Record<string,unknown>={}):Promise<T>{const {data,error}=await supabase.rpc(name,args);if(error)throw error;return data as T;}
export const getFishing=()=>fishingRpc<FishingState>('get_world_fishing_state');
export const startFishing=(location:string,bait:string,request:string)=>fishingRpc<FishingResult>('start_world_fishing',{p_location:location,p_bait_id:bait,p_request_id:request});
export const finishFishing=(id:string,action='hook')=>fishingRpc<FishingResult>('finish_world_fishing',{p_cast_id:id,p_action:action});
export const buyBait=(id:string,request:string,price:number)=>fishingRpc<FishingResult>('buy_world_fishing_bait',{p_bait_id:id,p_request_id:request,p_expected_price:price});
export const refundBait=(id:string)=>fishingRpc<FishingResult>('refund_world_fishing_bait',{p_purchase_id:id});
export const sellFish=(ids:string[],request:string)=>fishingRpc<FishingResult>('sell_world_fishing_catches',{p_catch_ids:ids,p_request_id:request});
export const lockFish=(id:string,locked:boolean)=>fishingRpc<FishingResult>('lock_world_fishing_catch',{p_catch_id:id,p_locked:locked});
export const displayFish=(id:string|null)=>fishingRpc<FishingResult>('set_world_fishing_aquarium',{p_catch_id:id});
export const getAquarium=(owner:string)=>fishingRpc<FishAquarium>('get_world_fishing_aquarium',{p_owner_id:owner});
export const getFishingRankings=(id:string)=>fishingRpc<FishRankings>('get_world_fishing_rankings',{p_species_id:id});
export const FISH_TIERS=['일반','고급','희귀','매우 희귀','극희귀'];
export const fishingReason=(reason?:string)=>({no_unused_bait:'환불할 미사용 미끼가 없어요.',price_changed:'미끼 가격이 변경됐어요. 변경된 가격을 확인해주세요.',cast_active:'진행 중인 낚시를 먼저 마쳐주세요.',bag_full:'보관함이 가득 찼어요. 물고기를 판매한 뒤 다시 시도해주세요.',no_bait:'선택한 미끼가 없어요.',too_early:'아직 입질 전이에요. 찌가 움직이면 낚아주세요.',insufficient_points:'포인트가 부족해요.',not_owned:'보관 상태가 바뀌었어요. 목록을 다시 확인해주세요.',protected:'잠금 또는 전시 중인 물고기는 판매할 수 없어요.',daily_cap:'선택 금액이 오늘 남은 판매 한도를 넘어요. 수량을 줄이거나 내일 판매해주세요.'} as Record<string,string>)[reason||'']||'처리하지 못했어요. 새로고침 후 상태를 확인해주세요.';
export function fishOdds(species:FishSpecies[],bait:FishingBait,location:string){const available=species.filter(s=>s.locations.includes(location));const total=available.reduce((n,s)=>n+s.weight*Number(bait.modifiers[s.tier]),0);return available.map(s=>({species:s,chance:s.weight*Number(bait.modifiers[s.tier])/total*100}));}

export const updateFishingFight=(id:string,from:number,inputs:boolean[],request:string)=>fishingRpc<FishingResult>('update_world_fishing_fight',{p_cast_id:id,p_from_tick:from,p_inputs:inputs,p_request_id:request});
export const pauseFishingFight=(id:string,paused:boolean)=>fishingRpc<FishingResult>('pause_world_fishing_fight',{p_cast_id:id,p_pause:paused});
