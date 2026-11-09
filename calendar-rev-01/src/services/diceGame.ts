import {supabase} from '../lib/supabase';
export interface DicePlayer{userId:string;name:string;seat:number;ready:boolean}
export interface DiceRoom{isOpen:boolean;matchNo:number;lastResult:{match:number;winnerId:string;winnerName:string;pot:number;stake:number}|null;proposal:{id:string;stake:number;approvedBy:string[]}|null;id:string;code:string;hostId:string;stake:number;capacity:number;status:'waiting'|'rolling'|'tie'|'finished'|'cancelled';round:number;eligible:string[];players:DicePlayer[];pot:number;rolls:Record<string,[number,number]>;history:{round:number;rolls:Record<string,[number,number]>;leaders:string[]}[];winnerId:string|null;nextAt:string|null;serverTime:string}
export interface DiceOffer{roomId:string;status:string;code:string;stake:number;capacity:number;count:number;hostName:string}
async function rpc<T>(name:string,args:Record<string,unknown>={}){const {data,error}=await supabase.rpc(name,args);if(error)throw error;return data as T;}
export const getDiceGame=(id:string|null=null)=>rpc<DiceRoom|null>('get_world_dice_game',{p_id:id});
export const createDiceGame=(stake:number,capacity:number,requestId:string,code:string)=>rpc<DiceRoom>('create_world_dice_game',{p_stake:stake,p_capacity:capacity,p_request_id:requestId,p_code:code});
export const getDiceOffer=(code:string)=>rpc<DiceOffer>('get_world_dice_offer',{p_code:code});
export const joinDiceGame=(code:string,stake:number,roomId:string)=>rpc<DiceRoom>('join_world_dice_game',{p_code:code,p_expected_stake:stake,p_room_id:roomId});
export const readyDiceGame=(id:string,ready:boolean,stake:number,matchNo:number,status:string)=>rpc<DiceRoom>('ready_world_dice_game',{p_id:id,p_ready:ready,p_expected_stake:stake,p_match_no:matchNo,p_status:status});
export const leaveDiceGame=(id:string)=>rpc<{success:boolean}>('leave_world_dice_game',{p_id:id});

export const proposeDiceStake=(id:string,stake:number)=>rpc<DiceRoom>('propose_world_dice_stake',{p_id:id,p_stake:stake});
export const respondDiceStake=(id:string,proposalId:string,agree:boolean)=>rpc<DiceRoom>('respond_world_dice_stake',{p_id:id,p_proposal_id:proposalId,p_agree:agree});
