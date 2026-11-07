/** V058 deterministic 100ms simulation. PostgreSQL runs the same integer rules before awarding a catch. */
export interface FightProfile{forces:number[];gain:number;step_ms:number;max_ticks:number}
export interface FightState{tick:number;tension:number;progress:number;high:number;low:number;status:'fighting'|'won'|'line_broke'|'hook_lost'|'timed_out'}
export const INITIAL_FIGHT:FightState={tick:0,tension:4500,progress:0,high:0,low:0,status:'fighting'};
export function fishPressure(profile:FightProfile,tick:number){const k=Math.floor(tick/10),m=tick%10;return Math.floor((profile.forces[k%profile.forces.length]*(10-m)+profile.forces[(k+1)%profile.forces.length]*m)/10);}
export function stepFishingFight(state:FightState,holding:boolean,profile:FightProfile):FightState{
 if(state.status!=='fighting')return state;
 const force=fishPressure(profile,state.tick),tension=Math.max(0,Math.min(10000,state.tension+(holding?90+Math.floor(force*11/10):-155+Math.floor(force*9/10))));
 const high=tension>=8800?state.high+1:Math.max(0,state.high-3),low=tension<=1200?state.low+1:Math.max(0,state.low-2);
 const progress=Math.max(0,Math.min(10000,state.progress+(holding&&tension>=2000&&tension<=8000?profile.gain:holding?0:-15))),tick=state.tick+1;
 const status=high>=20?'line_broke':low>=25?'hook_lost':progress>=10000?'won':tick>=profile.max_ticks?'timed_out':'fighting';
 return {tick,tension,progress,high,low,status};
}
export const fightStatusLabel=(status:string)=>({line_broke:'장력이 높게 유지되어 줄이 끊어졌어요.',hook_lost:'줄이 느슨해져 바늘이 빠졌어요.',timed_out:'물고기가 멀리 달아났어요.',cancelled:'낚시를 포기했어요.',missed:'입질 또는 복귀 시간을 놓쳤어요.'} as Record<string,string>)[status]||'낚시를 마쳤어요.';
