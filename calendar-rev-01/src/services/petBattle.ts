import {supabase} from '../lib/supabase';
import type {BattlePet} from '../data/petRoster';
import type {Equipment} from '../data/wardrobe';
export interface BattleFighter extends BattlePet{revealed?:boolean;companionId:string|null;equipment:Equipment;special_form:boolean;reward_accessory:boolean;hp:number;maxHp:number;stages:Record<string,number>;cooldowns:Record<string,number>}
export interface HiddenBattleFighter{hidden:true;revealed:false;slot:number}
export type BattleTeamEntry=BattleFighter|HiddenBattleFighter;
export interface BattleFramePet{hp:number;maxHp:number;stages:Record<string,number>;cooldowns:Record<string,number>;revealed:boolean}
export interface BattleFrame{phase:BattleState['phase'];version:number;turn:number;winner:number|null;teams:[(BattleFramePet|HiddenBattleFighter)[],(BattleFramePet|HiddenBattleFighter)[]];active:[number,number];field:BattleState['field']}
export interface BattleEvent{order:number;kind:'skill'|'switch'|'entry';side:number;slot:number;targetSide:number;targetSlot:number;actorName:string;targetName?:string;skillId?:string;type?:string;category?:string;effect?:string;hit?:boolean;damage?:number;healing?:number;blocked?:boolean;applied?:boolean;changes?:{side:number;slot:number;stat:string;delta:number}[];before:BattleFrame;after:BattleFrame;text:string;durationMs:number;impactMs:number}
export const isBattleFighter=(pet:BattleTeamEntry|undefined):pet is BattleFighter=>Boolean(pet&&!('hidden'in pet));
export interface BattleState{events?:BattleEvent[];animationUntil?:number;phase:'waiting'|'lead'|'turn'|'replace'|'finished';version:number;turn:number;teams:[BattleTeamEntry[],BattleTeamEntry[]];active:[number,number];field:[{guard:number;haste:number},{guard:number;haste:number}];logs:string[];winner:number|null}
export interface BattleRoom{eventsVersion?:number;fogOfWarVersion?:number;id:string;code:string;mode:'ai'|'pvp';side:number;state:BattleState;submitted:boolean;opponentSubmitted:boolean;deadline:string;serverTime:string;opponentName:string}
export type BattleAction={kind:'skill';skill:string}|{kind:'switch';index:number};
async function rpc<T>(name:string,args:Record<string,unknown>){const {data,error}=await supabase.rpc(name,args);if(error)throw error;return data as T;}
export const getPetBattle=(id:string|null=null)=>rpc<BattleRoom|null>('get_pet_battle',{p_id:id});
export const createPetBattle=(team:string[],mode:'ai'|'pvp')=>rpc<BattleRoom>('create_pet_battle',{p_team:team,p_mode:mode});
export const practicePetBattle=(forms:string[])=>rpc<BattleRoom>('practice_pet_battle',{p_forms:forms});
export const joinPetBattle=(code:string,team:string[])=>rpc<BattleRoom>('join_pet_battle',{p_code:code,p_team:team});
export const choosePetBattle=(id:string,version:number,action:BattleAction)=>rpc<BattleRoom>('choose_pet_battle',{p_id:id,p_version:version,p_action:action});
export const leavePetBattle=(id:string)=>rpc<BattleRoom>('leave_pet_battle',{p_id:id});
