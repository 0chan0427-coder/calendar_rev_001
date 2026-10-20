import {useEffect,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
export interface ScenePosition {x:number;y:number}
interface Target extends ScenePosition {id:string;minX?:number;maxX?:number;minY?:number;maxY?:number}
/** The same grab-offset and cancellation rules for furniture, pets and the single window. */
export function useSceneDrag(enabled:boolean,context:string){
 const [positions,setPositions]=useState<Record<string,ScenePosition>>({});
 const cancel=useRef<(()=>void)|null>(null);
 useEffect(()=>{cancel.current?.();setPositions({});return()=>cancel.current?.();},[context]);
 useEffect(()=>{if(!enabled)cancel.current?.();},[enabled]);
 const start=(e:ReactPointerEvent<HTMLElement>,t:Target,onSave:(p:ScenePosition)=>void)=>{
  if(!enabled||e.button!==0)return;
  const root=e.currentTarget.closest('.room-canvas')||e.currentTarget.closest('.cyworld-room');if(!root)return;
  e.preventDefault();e.stopPropagation();cancel.current?.();
  const rect=root.getBoundingClientRect(),initial=positions[t.id]||t;
  const offsetX=e.clientX-(rect.left+initial.x/100*rect.width),offsetY=e.clientY-(rect.top+initial.y/100*rect.height);
  let latest:ScenePosition={x:initial.x,y:initial.y};
  const move=(event:PointerEvent)=>{latest={x:Math.max(t.minX??4,Math.min(t.maxX??96,(event.clientX-rect.left-offsetX)/rect.width*100)),y:Math.max(t.minY??5,Math.min(t.maxY??92,(event.clientY-rect.top-offsetY)/rect.height*100))};setPositions(p=>({...p,[t.id]:latest}));};
  const cleanup=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',abort);window.removeEventListener('blur',abort);cancel.current=null;};
  const abort=()=>{cleanup();setPositions(p=>{const next={...p};delete next[t.id];return next;});};
  const up=()=>{cleanup();if(Math.abs(latest.x-initial.x)+Math.abs(latest.y-initial.y)>.05)onSave(latest);};
  cancel.current=abort;window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',abort);window.addEventListener('blur',abort);
 };
 const reset=()=>setPositions({});
 return {positions,start,reset};
}
