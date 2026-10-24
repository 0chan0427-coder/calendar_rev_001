import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {CSSProperties} from 'react';
/** All animal layers, including masks and accessories, reach the screen through canvas.
 * Hidden SVG is only a composition recipe; browser auto-dark must not recolor visible SVG images. */
const imageData=new Map<string,Promise<string>>();
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
export default function CompanionCanvas({children,className='',label,animate=false,parts=NO_PARTS}:{children:ReactNode;className?:string;label:string;animate?:boolean;parts?:CanvasPart[]}){
 const recipe=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [failed,setFailed]=useState(false),[retry,setRetry]=useState(0),[ready,setReady]=useState(false);
 // React children describe the complete recipe. Cleanup prevents stale async frames replacing a new outfit.
 useEffect(()=>{let live=true,raf=0,visible=true,observer:IntersectionObserver|undefined;setReady(false);setFailed(false);
 const svg=recipe.current?.querySelector('svg'),target=canvas.current;if(!svg||!target)return;
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');let draw:((time:number)=>void)|undefined;
 const stop=()=>{cancelAnimationFrame(raf);raf=0;};
 const start=()=>{stop();if(live&&draw)raf=requestAnimationFrame(draw);};
 const change=()=>start();document.addEventListener('visibilitychange',change);media.addEventListener('change',change);
 const load=async()=>{
  const box=svg.viewBox.baseVal;const resolution=Math.min(1,1024/Math.max(box.width,box.height));const width=Math.max(1,Math.ceil(box.width*resolution)),height=Math.max(1,Math.ceil(box.height*resolution));
  svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));
  const body=svg.cloneNode(true) as SVGSVGElement;body.querySelectorAll('[data-pet-part]').forEach(el=>el.remove());
  const layers=await Promise.all(parts.map(async part=>{const layer=svg.cloneNode(true) as SVGSVGElement;Array.from(layer.children).forEach(el=>{if(el.tagName.toLowerCase()!=='defs'&&el.getAttribute('data-pet-part')!==part.id)el.remove();});return {part,image:await raster(layer)};}));
  const image=await raster(body);if(!live)return;
  target.width=width;target.height=height;const context=target.getContext('2d');if(!context)throw Error('Canvas unavailable');
  draw=(time)=>{if(!live)return;context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,width,height);context.globalAlpha=1;context.globalCompositeOperation='source-over';
   const moving=animate&&!media.matches&&visible&&!document.hidden;
   for(const {part,image}of layers){context.save();if(moving){const x=(part.origin[0]-box.x)*width/box.width,y=(part.origin[1]-box.y)*height/box.height;context.translate(x,y);context.rotate(Math.sin(time/1000/part.duration*Math.PI*2)*(part.angle??2)*Math.PI/180);context.translate(-x,-y);}context.drawImage(image,0,0,width,height);context.restore();}
   context.drawImage(image,0,0,width,height);if(moving&&layers.length)raf=requestAnimationFrame(draw!);else raf=0;
  };draw(performance.now());setReady(true);
  observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;start();});observer.observe(target);
 };
 void load().catch(()=>{if(live)setFailed(true);});
 return()=>{live=false;stop();observer?.disconnect();document.removeEventListener('visibilitychange',change);media.removeEventListener('change',change);};
 },[children,animate,parts,retry]);
 return <div className={`companion-art companion-canvas ${className}`} role="img" aria-label={label} aria-busy={!ready&&!failed} style={{colorScheme:'only light',opacity:1,mixBlendMode:'normal'} as CSSProperties}>
 <div ref={recipe} hidden aria-hidden="true">{children}</div>
 <canvas ref={canvas} aria-hidden="true" style={{display:ready&&!failed?'block':'none',width:'100%',height:'100%',objectFit:'contain',opacity:1,filter:'none',mixBlendMode:'normal'}}/>
 {failed?<button onClick={()=>setRetry(v=>v+1)}>동물 다시 불러오기</button>:!ready?<span aria-hidden="true">…</span>:null}
 </div>;
}
