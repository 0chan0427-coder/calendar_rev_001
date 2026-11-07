import {supabase} from '../lib/supabase';
export interface EnglishQuestion{id:string;number:number;prompt:string;choices:string[];expiresAt:string;correctIndex?:number;chosen?:number;correct?:boolean;explanation?:string;points?:number}
export interface EnglishRun{id:string;score:number;status:'question'|'review'|'lost'|'quit'|'completed';reason:string|null;question:EnglishQuestion|null}
export interface EnglishState{serverNow:string;run:EnglishRun|null;best:number;todayBest:number;todayPoints:number;dailyCap:number;rankings:{user_id:string;name:string;score:number;reached_at:string}[]}
async function rpc(name:string,args:Record<string,unknown>={}):Promise<EnglishState>{const{data,error}=await supabase.rpc(name,args);if(error)throw error;return data as EnglishState;}
export const getEnglish=()=>rpc('get_world_english_state');
export type EnglishAction={type:'start';request:string}|{type:'answer';run:string;turn:string;choice:number;request:string}|{type:'next';run:string;turn:string}|{type:'quit';run:string};
export function mutateEnglish(a:EnglishAction){switch(a.type){case'start':return rpc('start_world_english',{p_request_id:a.request});case'answer':return rpc('answer_world_english',{p_run_id:a.run,p_turn_id:a.turn,p_choice:a.choice,p_request_id:a.request});case'next':return rpc('next_world_english',{p_run_id:a.run,p_turn_id:a.turn});case'quit':return rpc('quit_world_english',{p_run_id:a.run});}}
