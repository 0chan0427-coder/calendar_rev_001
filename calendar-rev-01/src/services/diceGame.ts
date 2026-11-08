import {supabase} from '../lib/supabase';
export interface DicePlayer{userId:string;name:string;seat:number;ready:boolean}
export interface DiceRoom{id:string;code:string;hostId:string;stake:number;capacity:number;status:'waiting'|'rolling'|'tie'|'finished'|'cancelled';round:number;eligible:string[];players:DicePlayer[];pot:number;rolls:Record<string,[number,number]>;history:{round:number;rolls:Record<string,[number,number]>;leaders:string[]}[];winnerId:string|null;nextAt:string|null;serverTime:string}
export interface DiceOffer{code:string;stake:number;capacity:number;count:number;hostName:string}
async function rpc<T>(name:string,args:Record<string,unknown>={}){const {data,error}=await supabase.rpc(name,args);if(error)throw error;return data as T;}
export const getDiceGame=(id:string|null=null)=>rpc<DiceRoom|null>('get_world_dice_game',{p_id:id});
export const createDiceGame=(stake:number,capacity:number,requestId:string)=>rpc<DiceRoom>('create_world_dice_game',{p_stake:stake,p_capacity:capacity,p_request_id:requestId});
export const getDiceOffer=(code:string)=>rpc<DiceOffer>('get_world_dice_offer',{p_code:code});
export const joinDiceGame=(code:string,stake:number)=>rpc<DiceRoom>('join_world_dice_game',{p_code:code,p_expected_stake:stake});
export const readyDiceGame=(id:string,ready:boolean)=>rpc<DiceRoom>('ready_world_dice_game',{p_id:id,p_ready:ready});
export const leaveDiceGame=(id:string)=>rpc<{success:boolean}>('leave_world_dice_game',{p_id:id});
