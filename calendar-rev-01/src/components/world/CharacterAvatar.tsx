import {useEffect,useId,useState} from 'react';
import type {CSSProperties} from 'react';
import type {Equipment} from '../../data/wardrobe';
import {acquireAvatarComposite} from '../../lib/avatarComposite';
import type {AvatarComposite} from '../../lib/avatarComposite';
import {useAvatarMotionEnabled} from '../../lib/avatarMotion';
export interface CharacterLayer {src:string;alt?:string;zIndex?:number;className?:string;}
interface Props {gender:'male'|'female';equipment?:Equipment;className?:string;alt?:string;blink?:boolean;layers?:CharacterLayer[];blinkDelay?:string;}
export default function CharacterAvatar({gender,equipment={},className='',alt='씩씩이 미니미',blink=true}:Props){
 const uid=useId().replace(/[^a-z0-9]/gi,'');
 const motion=useAvatarMotionEnabled();
 const phase=-(Array.from(uid).reduce((sum,char)=>sum+char.charCodeAt(0),0)%50)/10;
 const key=JSON.stringify([gender,Object.entries(equipment).sort(([a],[b])=>a.localeCompare(b))]);
 const [result,setResult]=useState<{key:string;frames:AvatarComposite}|null>(null),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;setFailed(false);const acquired=acquireAvatarComposite(gender,equipment);acquired.promise.then(frames=>{if(live)setResult({key,frames});},()=>{if(live)setFailed(true);});return()=>{live=false;acquired.release();};},[key,retry]);
 const frames=result?.key===key?result.frames:null;
 const blinking=motion&&blink&&equipment.face!=='eyes-smile';
 return <div className={`character-avatar raster-avatar composite-avatar ${gender} ${className}`} style={{'--avatar-ratio':'2 / 3','--avatar-phase':`${phase}s`} as CSSProperties} role="img" aria-label={alt} aria-busy={!frames&&!failed}><div className={`character-artboard ${motion?'composite-breathe':''}`}>
 {frames?<><img className={`avatar-composite composite-open ${blinking?'composite-blink-open':''}`} src={frames.open} alt="" draggable={false}/>{blinking&&<img className="avatar-composite composite-closed composite-blink-closed" src={frames.closed} alt="" draggable={false}/>}</>:failed?<button className="avatar-retry" onClick={()=>setRetry(v=>v+1)}>미니미 다시 불러오기</button>:<span className="avatar-loading" aria-hidden="true">…</span>}
 </div></div>;
}
