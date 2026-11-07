import {useCallback,useEffect,useRef,useState} from 'react';
import {updateFishingFight,pauseFishingFight,type FishingCast,type FishingResult} from '../../services/fishing';
import {fishPressure,stepFishingFight,type FightState} from '../../data/fishingFight';
export interface FightVisual{tension:number;progress:number;force:number;holding:boolean}
export interface FightControl{pause:()=>Promise<boolean>;resume:()=>Promise<void>}
type Mode='loading'|'playing'|'paused'|'network'|'ending';
type Packet={request:string;from:number;inputs:boolean[]};
export default function FishingFight({cast,onResolved,onVisual,onControl,onCancel}:{cast:FishingCast;onResolved:(result:FishingResult)=>Promise<void>;onVisual:(visual:FightVisual)=>void;onControl?:(control:FightControl|null)=>void;onCancel:()=>void}){
 const initial=cast.fight!;const [state,setState]=useState<FightState>(initial.state),[mode,setMode]=useState<Mode>('loading'),[holding,setHolding]=useState(false),[error,setError]=useState('');
 const [remainingPause,setRemainingPause]=useState(initial.pause_remaining_ms),[pauseClock,setPauseClock]=useState(performance.now());
 const pauseReadAt=useRef(performance.now());
 const base=useRef(initial.state),prediction=useRef(initial.state),queue=useRef<boolean[]>([]),packet=useRef<Packet|null>(null),inflight=useRef<Promise<boolean>|null>(null),pauseTask=useRef<Promise<boolean>|null>(null);
 const live=useRef(true),holdingRef=useRef(false),modeRef=useRef<Mode>('loading'),pointer=useRef<number|null>(null),callbacks=useRef({onResolved,onVisual,onControl}),lastFrame=useRef(0),accumulator=useRef(0);
 callbacks.current={onResolved,onVisual,onControl};
 const changeMode=useCallback((value:Mode)=>{modeRef.current=value;if(live.current)setMode(value);lastFrame.current=performance.now();accumulator.current=0;},[]);
 const release=useCallback(()=>{holdingRef.current=false;pointer.current=null;if(live.current)setHolding(false);},[]);
 const show=useCallback(()=>{if(!live.current)return;const value=prediction.current;setState({...value});callbacks.current.onVisual({tension:value.tension/100,progress:value.progress/100,force:fishPressure(initial.profile,value.tick),holding:holdingRef.current});},[initial.profile]);
 const resolved=useCallback(async(r:FishingResult)=>{release();changeMode('ending');await callbacks.current.onResolved(r);},[release,changeMode]);
 const canonical=useCallback((r:FishingResult)=>{if(r.cast?.fight){base.current=r.cast.fight.state;prediction.current=r.cast.fight.state;queue.current=[];packet.current=null;setRemainingPause(r.cast.fight.pause_remaining_ms);pauseReadAt.current=performance.now();setPauseClock(performance.now());show();}},[show]);
 const flush=useCallback(():Promise<boolean>=>{
  if(inflight.current)return inflight.current;
  if(!packet.current&&!queue.current.length)return Promise.resolve(true);
  if(!packet.current)packet.current={request:crypto.randomUUID(),from:base.current.tick,inputs:queue.current.slice(0,10)};
  const sending=packet.current;
  const task=(async()=>{try{
   const r=await updateFishingFight(cast.id,sending.from,sending.inputs,sending.request);if(!live.current)return false;
   if(!r.success){
    if(r.reason==='fight_too_fast'){setError('시간을 동기화하고 있어요. 같은 기록으로 다시 확인해주세요.');changeMode('network');release();return false;}
    canonical(r);changeMode('paused');release();setError(r.reason==='fight_paused'?'일시 중단된 낚시예요. 계속하기를 눌러주세요.':'다른 화면에서 변경된 낚시 상태를 불러왔어요. 계속하기를 눌러주세요.');return false;
   }
   if(r.status!=='fighting'||r.cast?.status!=='fighting'){await resolved(r);return true;}
   const confirmed=r.cast.fight!.state;queue.current=queue.current.slice(sending.inputs.length);packet.current=null;base.current=confirmed;
   prediction.current=queue.current.reduce((s,input)=>stepFishingFight(s,input,initial.profile),confirmed);show();setError('');
   if(modeRef.current==='network')changeMode(document.hidden?'paused':'playing');return true;
  }catch{if(live.current){release();changeMode('network');setError('통신이 끊겼어요. 같은 조작 기록으로 결과를 다시 확인할 수 있어요. 10초 이상 응답이 없으면 낚시가 종료될 수 있어요.');}return false;}
  finally{inflight.current=null;}})();inflight.current=task;return task;
 },[cast.id,initial.profile,canonical,changeMode,release,resolved,show]);
 const pause=useCallback(():Promise<boolean>=>{
  if(pauseTask.current)return pauseTask.current;
  if(modeRef.current==='ending')return Promise.resolve(true);
  release();changeMode('paused');
  const task=(async()=>{try{
   if(inflight.current&&!await inflight.current)return false;
   while(queue.current.length||packet.current){if(!await flush())return false;if(modeRef.current==='ending')return true;}
   const r=await pauseFishingFight(cast.id,true);if(!live.current)return false;
   if(r.status!=='fighting'){await resolved(r);return true;}
   canonical(r);changeMode('paused');return true;
  }catch{if(live.current){changeMode('network');setError('중단 상태를 확인하지 못했어요. 연결을 확인한 뒤 계속하기를 눌러주세요.');}return false;}
  finally{pauseTask.current=null;}})();pauseTask.current=task;return task;
 },[cast.id,release,changeMode,flush,resolved,canonical]);
 const resume=useCallback(async()=>{
  release();if(pauseTask.current&&!await pauseTask.current)return;
  if(packet.current||queue.current.length){if(!await flush())return;if(modeRef.current==='ending')return;}
  changeMode('loading');setError('');try{const r=await pauseFishingFight(cast.id,false);if(!live.current)return;if(r.status!=='fighting'){await resolved(r);return;}canonical(r);changeMode('playing');}
  catch{if(live.current){changeMode('network');setError('낚시 상태를 확인하지 못했어요. 연결을 확인하고 다시 눌러주세요.');}}
 },[cast.id,release,flush,changeMode,resolved,canonical]);
 useEffect(()=>{
  live.current=true;let raf=0;document.querySelector('.fishing-play-block')?.scrollIntoView({block:'start',behavior:'auto'});callbacks.current.onControl?.({pause,resume});
  void resume();
  const frame=(time:number)=>{
   const delta=lastFrame.current?Math.min(250,time-lastFrame.current):0;lastFrame.current=time;
   if(modeRef.current==='playing'){
    accumulator.current+=delta;
    while(accumulator.current>=100&&queue.current.length<20&&prediction.current.status==='fighting'){
     const input=holdingRef.current;prediction.current=stepFishingFight(prediction.current,input,initial.profile);queue.current.push(input);accumulator.current-=100;show();
    }
    if(queue.current.length>=10||prediction.current.status!=='fighting')void flush();
    if(queue.current.length>=20)accumulator.current=0;
   }
   if(live.current)raf=requestAnimationFrame(frame);
  };raf=requestAnimationFrame(frame);
  const visibility=()=>{if(document.hidden)void pause();};
  const blur=()=>{release();if(modeRef.current==='playing')void pause();};
  const keydown=(e:KeyboardEvent)=>{if(e.code!=='Space'||modeRef.current!=='playing'||/^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName))return;e.preventDefault();holdingRef.current=true;setHolding(true);};
  const keyup=(e:KeyboardEvent)=>{if(e.code==='Space'){e.preventDefault();release();}};
  document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
  return()=>{live.current=false;holdingRef.current=false;cancelAnimationFrame(raf);callbacks.current.onControl?.(null);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);};
 // This simulation belongs to a single cast. Callback refs update without restarting it.
 },[cast.id]);
 useEffect(()=>{if(mode!=='paused')return;const timer=setInterval(()=>{const time=performance.now();setPauseClock(time);if(time-pauseReadAt.current>=remainingPause)void resume();},250);return()=>clearInterval(timer);},[mode,remainingPause,resume]);
 const pauseLeft=Math.max(0,remainingPause-Math.max(0,pauseClock-pauseReadAt.current));
 const force=fishPressure(initial.profile,state.tick),next=fishPressure(initial.profile,state.tick+5),danger=state.tension>=8000||state.tension<=2000;
 const terminal=state.status!=='fighting';
 return <section className={`fishing-fight ${danger?'fight-danger':''}`} aria-label="물고기와 힘겨루기">
 <div className="fight-resistance" role="status">{mode==='playing'?(next>=70&&force<70?'곧 강하게 저항해요 · 줄을 풀 준비':force>=70?'강한 저항 · 무리하게 당기지 마세요':force<=35?'저항이 약해요 · 당길 기회예요':'저항하는 중 · 장력을 살펴보세요'):mode==='ending'||terminal?'포획 결과 확인 중…':mode==='paused'?'잠시 중단됨':mode==='network'?'연결 확인 필요':'낚시 상태 확인 중…'}</div>
 <div className="fight-gauges"><div><label>줄 장력 <b>{Math.round(state.tension/100)}%</b></label><div className="fight-tension" role="progressbar" aria-label="줄 장력" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(state.tension/100)}><span className="fight-safe-zone"/><i style={{left:state.tension/100+'%'}}/></div><small>{state.tension>=8000?`줄 끊어짐 위험 ${Math.min(100,state.high*5)}%`:state.tension<=2000?`바늘 빠짐 위험 ${Math.min(100,state.low*4)}%`:'적정 구간 20~80%'}</small></div><div><label>끌어온 거리 <b>{Math.round(state.progress/100)}%</b></label><progress max={10000} value={state.progress} aria-label="끌어온 거리"/><small>물고기를 끝까지 끌어오면 포획 · 최대 35초</small></div></div>
 {error&&<p className="fishing-error" role="alert">{error}</p>}
 {mode==='paused'||mode==='network'?<div className="fight-paused"><p>{mode==='paused'?`남은 복귀 보호 시간 ${Math.ceil(pauseLeft/1000)}초 · 한 판에 총 10초예요.`:'서버에서 마지막 조작을 확인한 뒤 10초 이상 연결이 끊기면 물고기를 놓칠 수 있어요.'}</p><button onClick={()=>void resume()}>낚시 계속하기</button></div>:<div className="fight-control-row"><button type="button" className={`fight-hold ${holding?'is-holding':''}`} aria-pressed={holding} disabled={mode!=='playing'||terminal}
 onPointerDown={e=>{if(e.button!==0||pointer.current!==null||modeRef.current!=='playing')return;e.preventDefault();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);holdingRef.current=true;setHolding(true);}}
 onPointerUp={e=>{if(pointer.current===e.pointerId){e.preventDefault();release();}}} onPointerCancel={release} onLostPointerCapture={release} onContextMenu={e=>e.preventDefault()} onBlur={release}>
 {mode==='ending'||terminal?'판정 확인 중…':holding?'당기는 중 · 떼면 줄 풀기':'누르고 있으면 당기기'}</button><button className="fight-giveup" onClick={onCancel} disabled={mode==='loading'||mode==='ending'}>포기</button></div>}
 <p className="fight-help">누르고 있으면 감고, 떼면 줄을 풀어요. PC는 스페이스바도 가능해요. 너무 높거나 낮은 장력이 지속되면 놓쳐요.</p>
 </section>;
}
