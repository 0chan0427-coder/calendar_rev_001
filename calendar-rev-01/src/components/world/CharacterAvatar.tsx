import {useEffect,useId,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import type {Equipment} from '../../data/wardrobe';
import {acquireAvatarComposite} from '../../lib/avatarComposite';
import type {AvatarComposite} from '../../lib/avatarComposite';
import {useAvatarMotionEnabled} from '../../lib/avatarMotion';
function AvatarFrame({src,className,onError}:{src:string;className:string;onError:()=>void}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  let live=true;const image=new Image();
  image.onload=()=>{if(!live||!ref.current)return;const canvas=ref.current;canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
   const context=canvas.getContext('2d');if(!context){onError();return;}context.globalAlpha=1;context.globalCompositeOperation='copy';context.drawImage(image,0,0);
  };
  image.onerror=()=>{if(live)onError();};image.src=src;
  return()=>{live=false;image.onload=null;image.onerror=null;};
 },[src]);
 return <canvas ref={ref} className={className} width={1024} height={1536} aria-hidden="true"/>;
}
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
 return <div className={`character-avatar raster-avatar composite-avatar alpha-mask-avatar ${gender} ${className}`} style={{'--avatar-ratio':'2 / 3','--avatar-phase':`${phase}s`} as CSSProperties} role="img" aria-label={alt} aria-busy={!frames&&!failed}><div className={`character-artboard ${motion?'composite-breathe':''}`}>
 {frames&&!failed?<><AvatarFrame className={`avatar-composite composite-open ${blinking?'composite-blink-open':''}`} src={frames.open} onError={()=>setFailed(true)}/>{blinking&&<AvatarFrame className="avatar-composite composite-closed composite-blink-closed" src={frames.closed} onError={()=>setFailed(true)}/>}</>:failed?<button className="avatar-retry" onClick={()=>setRetry(v=>v+1)}>미니미 다시 불러오기</button>:<span className="avatar-loading" aria-hidden="true">…</span>}
 </div></div>;
}
