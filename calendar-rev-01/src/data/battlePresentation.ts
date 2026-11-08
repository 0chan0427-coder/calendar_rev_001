import type {BattleEvent,BattleFrame,BattleState,BattleTeamEntry} from '../services/petBattle';
export function stateAtFrame(final:BattleState,frame:BattleFrame,logs:string[]):BattleState{
 const teams=frame.teams.map((team,side)=>team.map((entry,index)=>{
  if('hidden'in entry)return{hidden:true,revealed:false,slot:index};
  const pet=final.teams[side][index];if(!pet||'hidden'in pet)return{hidden:true,revealed:false,slot:index};
  return{...pet,...entry};
 })) as [BattleTeamEntry[],BattleTeamEntry[]];
 return{...final,...frame,teams,logs};
}
export const eventDuration=(event:BattleEvent)=>Math.max(600,Math.min(3200,event.durationMs));
export const eventImpact=(event:BattleEvent)=>Math.min(eventDuration(event)-150,Math.max(100,event.impactMs));
