import {useEffect,useRef,useState} from 'react';
import type {FishSpecies} from '../../services/fishing';
interface FishSource{image:HTMLCanvasElement;sx:number;sy:number}
const cache=new Map<string,Promise<FishSource>>();
function load(src:string){let p=cache.get(src);if(p){cache.delete(src);cache.set(src,p);return p;}
 p=new Promise<FishSource>((resolve,reject)=>{const im=new Image();im.onload=()=>{const factor=Math.min(1,768/Math.max(im.naturalWidth,im.naturalHeight)),image=document.createElement('canvas');image.width=Math.round(im.naturalWidth*factor);image.height=Math.round(im.naturalHeight*factor);const ctx=image.getContext('2d');if(!ctx){reject(Error('fish canvas unavailable'));return;}ctx.drawImage(im,0,0,image.width,image.height);const result={image,sx:image.width/im.naturalWidth,sy:image.height/im.naturalHeight};im.onload=null;im.onerror=null;im.src='';resolve(result);};im.onerror=()=>reject(Error('fish image unavailable'));im.src=src;});cache.set(src,p);p.catch(()=>cache.delete(src));if(cache.size>20)cache.delete(cache.keys().next().value!);return p;
}
/** Lazy, display-sized canvas rendering also prevents mobile auto-dark recoloring. */
export default function FishArt({species,className='',silhouette=false,animate=false}:{species:FishSpecies;className?:string;silhouette?:boolean;animate?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);const [failed,setFailed]=useState(false),[ready,setReady]=useState(false);const crop=species.crop.join(','),motion=species.motion||'fish';
 useEffect(()=>{
  let live=true,loading=false,visible=false,observer:ResizeObserver|undefined,source:FishSource|undefined,raf=0,last=0;
  const c=canvas.current;if(!c)return;setFailed(false);setReady(false);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const draw=(time=0)=>{
   if(!live||!source)return;const [x,y,w,h]=species.crop,displayWidth=c.parentElement?.getBoundingClientRect().width||240,f=Math.min(1,Math.max(192,displayWidth*Math.min(window.devicePixelRatio||1,2))/w,768/Math.max(w,h));
   // Extra transparent inset holds moving fins and arms inside the canvas.
   const pad=animate?.035:0,dw=Math.ceil(w*f),dh=Math.ceil(h*f),cw=Math.ceil(dw*(1+pad*2)),ch=Math.ceil(dh*(1+pad*2));
   if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}
   const ctx=c.getContext('2d');if(!ctx){setFailed(true);return;}
   ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,cw,ch);
   const dx=dw*pad,dy=dh*pad,active=animate&&!reduced.matches&&time>0;
   const paint=(sx:number,sy:number,sw:number,sh:number,tx:number,ty:number,tw:number,th:number)=>ctx.drawImage(source!.image,(x+sx)*source!.sx,(y+sy)*source!.sy,sw*source!.sx,sh*source!.sy,tx+dx,ty+dy,tw,th);
   if(!active||motion==='star'||motion==='bottom'){paint(0,0,w,h,0,0,dw,dh);}
   else if(['octopus','jelly','cephalopod','seahorse','turtle','crustacean'].includes(motion)){
    // Gentle lower-body ripple. Head/shell stays stable, arms and flippers sway.
    const count=48,t=time/1000,amp=motion==='jelly'?.018:motion==='octopus'?.013:.007;
    for(let i=0;i<count;i++){const y0=h*i/count,y1=h*(i+1)/count,part=i/count,shift=Math.sin(t*2.3+part*5)*dw*amp*Math.max(0,(part-.35)/.65);paint(0,y0,w,y1-y0,shift,dh*i/count,dw,dh/count+.5);}
   }else{
    // Left-facing source: keep head still and progressively wave the tail.
    const count=64,t=time/1000,amp=motion==='whale'?.007:motion==='eel'?.016:.01;
    for(let i=0;i<count;i++){const x0=w*i/count,x1=w*(i+1)/count,part=i/count,shift=Math.sin(t*(motion==='whale'?1.7:2.8)+part*5)*dh*amp*Math.pow(part,2);paint(x0,0,x1-x0,h,dw*i/count,shift,dw/count+.5,dh);}
   }
   if(silhouette){ctx.globalCompositeOperation='source-in';ctx.fillStyle='#71969e';ctx.fillRect(0,0,cw,ch);ctx.globalCompositeOperation='source-over';}
   setReady(true);
  };
  const frame=(time:number)=>{if(!live)return;if(visible&&!document.hidden&&time-last>40){draw(time);last=time;}raf=requestAnimationFrame(frame);};
  const start=()=>{if(animate&&!reduced.matches&&!raf)raf=requestAnimationFrame(frame);};
  const ensure=()=>{if(loading)return;loading=true;load(species.image_path).then(value=>{if(!live)return;source=value;draw();observer=new ResizeObserver(()=>draw());if(c.parentElement)observer.observe(c.parentElement);start();},()=>{if(live)setFailed(true);});};
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)ensure();},{rootMargin:'160px'});io.observe(c);
  const changed=()=>{cancelAnimationFrame(raf);raf=0;draw();start();};reduced.addEventListener('change',changed);
  return()=>{live=false;io.disconnect();observer?.disconnect();cancelAnimationFrame(raf);reduced.removeEventListener('change',changed);};
 },[species.image_path,crop,silhouette,animate,motion]);
 return <span className={`fish-art ${className}`} role="img" aria-label={silhouette?'미발견 수중 생물':species.name} aria-busy={!ready&&!failed}>{failed?<span>이미지를 불러오지 못했어요</span>:<canvas ref={canvas} aria-hidden="true" style={{visibility:ready?'visible':'hidden',opacity:1,filter:'none',colorScheme:'only light'}}/>}</span>;
}
