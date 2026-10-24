import {supabase} from '../lib/supabase';
import type {CareAction,RewardKind,CompanionBondState} from '../data/companionBonds';
export async function getCompanionBond(id:string){const {data,error}=await supabase.rpc('get_world_companion_bond',{p_companion_id:id});if(error)throw error;return data as CompanionBondState;}
export async function careCompanion(id:string,action:CareAction){const {data,error}=await supabase.rpc('care_world_companion',{p_companion_id:id,p_action:action});if(error)throw error;return data as CompanionBondState;}
export async function setCompanionReward(id:string,kind:RewardKind,enabled:boolean){const {data,error}=await supabase.rpc('set_world_companion_reward',{p_companion_id:id,p_kind:kind,p_enabled:enabled});if(error)throw error;return data as CompanionBondState;}
export interface DailyHearts {day:string;total:number;today:number;given:boolean}
export async function getDailyHearts(ownerId:string){const {data,error}=await supabase.rpc('get_world_heart_status',{p_owner_id:ownerId});if(error)throw error;return data as DailyHearts;}
export async function giveDailyHeart(ownerId:string){const {data,error}=await supabase.rpc('give_world_daily_heart',{p_owner_id:ownerId});if(error)throw error;return data as DailyHearts;}
