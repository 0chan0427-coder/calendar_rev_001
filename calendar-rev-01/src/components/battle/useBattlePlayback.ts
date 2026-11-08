import {useEffect,useRef,useState} from 'react';
import type {BattleEvent,BattleRoom,BattleState} from '../../services/petBattle';
import {eventDuration,eventImpact,stateAtFrame} from '../../data/battlePresentation';
export interface ActiveBattleEffect{event:BattleEvent;stage:'cast'|'impact';key:string}
function delay(ms:number,signal:AbortSignal){return new Promise<void>((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(Error('cancelled'));};const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},ms);signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();});}
export default function useBattlePlayback(room:BattleRoom|null){
 const [shown,setShown]=useState<{roomId:string;state:BattleState}|null>(null),[effect,setEffect]=useState<ActiveBattleEffect|null>(null),[playing,setPlaying]=useState(false);
 const previous=useRef({id:'',version:-1}),latest=useRef(room),controller=useRef<AbortController|null>(null);latest.current=room;
 useEffect(()=>{
  if(!room){controller.current?.abort();previous.current={id:'',version:-1};setShown(null);setEffect(null);setPlaying(false);return;}
  const first=previous.current.id!==room.id,oldVersion=previous.current.version;previous.current={id:room.id,version:room.state.version};
  if(!first&&oldVersion===room.state.version){controller.current?.abort();setShown({roomId:room.id,state:room.state});setEffect(null);setPlaying(false);return;}
  controller.current?.abort();const cancel=new AbortController();controller.current=cancel;
  const events=room.state.events||[];
  if(first||room.eventsVersion!==64||!events.length||document.hidden){setShown({roomId:room.id,state:room.state});setEffect(null);setPlaying(false);return;}
  setPlaying(true);
  void(async()=>{const logs:string[]=[];
   try{for(const event of events){
    if(cancel.signal.aborted)return;
    setShown({roomId:room.id,state:stateAtFrame(room.state,event.before,logs.slice())});setEffect({event,stage:'cast',key:`${room.id}-${room.state.version}-${event.order}`});
    await delay(eventImpact(event),cancel.signal);
    logs.push(event.text);setShown({roomId:room.id,state:stateAtFrame(room.state,event.after,logs.slice())});setEffect({event,stage:'impact',key:`${room.id}-${room.state.version}-${event.order}`});
    await delay(eventDuration(event)-eventImpact(event),cancel.signal);
   }
   if(!cancel.signal.aborted){setShown({roomId:room.id,state:room.state});setEffect(null);setPlaying(false);}
   }catch{if(!cancel.signal.aborted){setShown({roomId:room.id,state:room.state});setEffect(null);setPlaying(false);}}
  })();
 },[room?.id,room?.state.version,room?.state.phase]);
 useEffect(()=>{const catchUp=()=>{if(!document.hidden)return;controller.current?.abort();const current=latest.current;if(current)setShown({roomId:current.id,state:current.state});setEffect(null);setPlaying(false);};document.addEventListener('visibilitychange',catchUp);return()=>{document.removeEventListener('visibilitychange',catchUp);controller.current?.abort();};},[]);
 const matching=shown?.roomId===room?.id;
 const pending=Boolean(room&&matching&&shown&&shown.state.version!==room.state.version&&(room.state.events?.length||0)>0&&room.eventsVersion===64);
 return{state:matching?shown?.state:null,effect,playing:playing||pending};
}
