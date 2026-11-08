import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {CSSProperties} from 'react';
/** All animal layers, including masks and accessories, reach the screen through canvas.
 * Hidden SVG is only a composition recipe; browser auto-dark must not recolor visible SVG images. */
const imageData=new Map<string,Promise<string>>();
const thumbnailFrames=new Map<string,HTMLCanvasElement>();
const thumbnailImages=new Map<string,Promise<HTMLImageElement>>();
function thumbnailImage(src:string){let pending=thumbnailImages.get(src);if(!pending){pending=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.decoding='async';image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Thumbnail unavailable'));image.src=src;});thumbnailImages.set(src,pending);pending.catch(()=>thumbnailImages.delete(src));if(thumbnailImages.size>48)thumbnailImages.delete(thumbnailImages.keys().next().value!);}return pending;}
export async function warmCompanionSources(sources:string[]){await Promise.allSettled(sources.map(embedded));}
interface FlatSource{image:string;width:number;height:number;crop:number[]}

function embedded(src:string){
 if(src.startsWith('data:'))return Promise.resolve(src);
 let result=imageData.get(src);if(!result){result=fetch(src).then(r=>{if(!r.ok)throw Error('Animal image unavailable');return r.blob();}).then(blob=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob);}));imageData.set(src,result);result.catch(()=>imageData.delete(src));if(imageData.size>48)imageData.delete(imageData.keys().next().value!);}
 return result;
}
async function raster(svg:SVGSVGElement){
 const clone=svg.cloneNode(true) as SVGSVGElement;clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 await Promise.all(Array.from(clone.querySelectorAll('image')).map(async el=>el.setAttribute('href',await embedded(el.getAttribute('href')||''))));
 clone.querySelectorAll('[class],[style]').forEach(el=>{el.removeAttribute('class');el.removeAttribute('style');});
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'}));
 try{return await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Animal composition failed'));im.src=url;});}finally{URL.revokeObjectURL(url);}
}
export interface CanvasPart{id:string;origin:[number,number];duration:number;angle?:number}
const NO_PARTS:CanvasPart[]=[];
export default function CompanionCanvas({children,recipeKey,className='',label,animate=false,parts=NO_PARTS,thumbnail=false,flatSource}:{children:ReactNode;recipeKey:string;className?:string;label:string;animate?:boolean;parts?:CanvasPart[];thumbnail?:boolean;flatSource?:FlatSource}){
 const recipe=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [failed,setFailed]=useState(false),[retry,setRetry]=useState(0),[ready,setReady]=useState(false);
 const partsKey=JSON.stringify(parts);
 // Timers/polling can recreate identical JSX and rig arrays. Only a visual change rebuilds pixels.
 // Keep the last complete frame on screen until the next composition has loaded successfully.
 useEffect(()=>{let live=true,raf=0,visible=true,observer:IntersectionObserver|undefined;setFailed(false);
 const svg=recipe.current?.querySelector('svg'),target=canvas.current;if(!svg||!target)return;
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');let draw:((time:number)=>void)|undefined;
 const stop=()=>{cancelAnimationFrame(raf);raf=0;};
 const start=()=>{stop();if(live&&draw)raf=requestAnimationFrame(draw);};
 const change=()=>start();document.addEventListener('visibilitychange',change);media.addEventListener('change',change);
 const load=async()=>{
  const cached=thumbnail?thumbnailFrames.get(recipeKey):undefined;
  if(cached){target.width=cached.width;target.height=cached.height;const context=target.getContext('2d');if(!context)throw Error('Canvas unavailable');context.drawImage(cached,0,0);setReady(true);return;}
  const box=svg.viewBox.baseVal;const resolution=Math.min(1,(thumbnail?240:1024)/Math.max(box.width,box.height));const width=Math.max(1,Math.ceil(box.width*resolution)),height=Math.max(1,Math.ceil(box.height*resolution));
  const remember=()=>{if(!thumbnail)return;const frame=document.createElement('canvas');frame.width=target.width;frame.height=target.height;frame.getContext('2d')?.drawImage(target,0,0);thumbnailFrames.delete(recipeKey);thumbnailFrames.set(recipeKey,frame);if(thumbnailFrames.size>48)thumbnailFrames.delete(thumbnailFrames.keys().next().value!);};
  if(thumbnail&&flatSource){const image=await thumbnailImage(flatSource.image);if(!live)return;target.width=width;target.height=height;const context=target.getContext('2d');if(!context)throw Error('Canvas unavailable');const sx=image.naturalWidth/flatSource.width,sy=image.naturalHeight/flatSource.height;context.drawImage(image,flatSource.crop[0]*sx,flatSource.crop[1]*sy,flatSource.crop[2]*sx,flatSource.crop[3]*sy,0,0,width,height);remember();setReady(true);return;}
  svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));
  const body=svg.cloneNode(true) as SVGSVGElement;body.querySelectorAll('[data-pet-part]').forEach(el=>el.remove());
  const layers=await Promise.all(parts.map(async part=>{const layer=svg.cloneNode(true) as SVGSVGElement;Array.from(layer.children).forEach(el=>{if(el.tagName.toLowerCase()!=='defs'&&el.getAttribute('data-pet-part')!==part.id)el.remove();});return {part,image:await raster(layer)};}));
  const image=await raster(body);if(!live)return;
  target.width=width;target.height=height;const context=target.getContext('2d');if(!context)throw Error('Canvas unavailable');
  draw=(time)=>{if(!live)return;context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,width,height);context.globalAlpha=1;context.globalCompositeOperation='source-over';
   const moving=animate&&!media.matches&&visible&&!document.hidden;
   for(const {part,image}of layers){context.save();if(moving){const x=(part.origin[0]-box.x)*width/box.width,y=(part.origin[1]-box.y)*height/box.height;context.translate(x,y);context.rotate(Math.sin(time/1000/part.duration*Math.PI*2)*(part.angle??2)*Math.PI/180);context.translate(-x,-y);}context.drawImage(image,0,0,width,height);context.restore();}
   context.drawImage(image,0,0,width,height);if(moving&&layers.length)raf=requestAnimationFrame(draw!);else raf=0;
  };draw(performance.now());remember();setReady(true);
  observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;start();});observer.observe(target);
 };
 void load().catch(()=>{if(live)setFailed(true);});
 return()=>{live=false;stop();observer?.disconnect();document.removeEventListener('visibilitychange',change);media.removeEventListener('change',change);};
 },[recipeKey,animate,partsKey,retry,thumbnail]);
 return <div className={`companion-art companion-canvas ${className}`} role="img" aria-label={label} aria-busy={!ready&&!failed} style={{colorScheme:'only light',opacity:1,mixBlendMode:'normal'} as CSSProperties}>
 <div ref={recipe} hidden aria-hidden="true">{children}</div>
 <canvas ref={canvas} aria-hidden="true" style={{display:ready&&!failed?'block':'none',width:'100%',height:'100%',objectFit:'contain',opacity:1,filter:'none',mixBlendMode:'normal'}}/>
 {failed?<button onClick={()=>setRetry(v=>v+1)}>동물 다시 불러오기</button>:!ready?<span aria-hidden="true">…</span>:null}
 </div>;
}
