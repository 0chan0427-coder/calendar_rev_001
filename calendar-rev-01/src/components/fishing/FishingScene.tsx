import {useEffect,useRef,useState} from 'react';
import type {FightVisual} from './FishingFight';
const sourceCache=new Map<string,Promise<HTMLImageElement>>();
function source(path:string){let p=sourceCache.get(path);if(!p){p=new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('scene image unavailable'));im.src=path;});sourceCache.set(path,p);p.catch(()=>sourceCache.delete(path));}return p;}
export default function FishingScene({location='pond',phase='idle',visual,caption,preview=false}:{location?:string;phase?:'idle'|'waiting'|'biting'|'fighting';visual?:FightVisual|null;caption?:string;preview?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),container=useRef<HTMLDivElement>(null),props=useRef({phase,visual,preview}),[error,setError]=useState(false),[retry,setRetry]=useState(0);props.current={phase,visual,preview};
 useEffect(()=>{let live=true,raf=0,visible=true,observer:ResizeObserver|undefined,intersection:IntersectionObserver|undefined;setError(false);const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 Promise.all([source(`/world/fishing-058/${location}.png`),source('/world/fishing-058/hands.png')]).then(([bg,hands])=>{if(!live||!canvas.current||!container.current)return;const c=canvas.current,ctx=c.getContext('2d');if(!ctx)throw Error('canvas unavailable');let w=1000,h=650,scale=1,lastPhase=props.current.phase,phaseTime=performance.now();
 const resize=()=>{if(!container.current)return;const box=container.current.getBoundingClientRect();if(!box.width||!box.height)return;h=1000*box.height/box.width;const pixels=Math.min(1400,Math.ceil(box.width*Math.min(window.devicePixelRatio||1,2)));c.width=pixels;c.height=Math.ceil(pixels*h/1000);scale=pixels/1000;};resize();observer=new ResizeObserver(resize);observer.observe(container.current);
 const frame=(time:number)=>{if(!live)return;const current=props.current;if(current.phase!==lastPhase){lastPhase=current.phase;phaseTime=time;}
 if(visible&&!document.hidden){ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,w,h);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 const bgScale=Math.max(w/bg.width,h/bg.height),bw=bg.width*bgScale,bh=bg.height*bgScale;ctx.drawImage(bg,(w-bw)/2,(h-bh)/2,bw,bh);
 const fw=Math.min(w*.85,h*1.20),fh=fw*hands.height/hands.width,fx=w-fw,fy=h-fh,root={x:fx+fw*.651,y:fy+fh*.492};
 const fight=current.visual,holding=fight?.holding||false,tension=(fight?.tension||35)/100,force=(fight?.force||30)/100,progress=(fight?.progress||0)/100;
 const t=reduced.matches?0:time/1000,wiggle=current.phase==='fighting'?Math.sin(t*2.1)*force:current.phase==='biting'?Math.sin(t*8)*.2:Math.sin(t*.7)*.04;
 const rodLength=Math.min(w*.30,h*.5);
 const tip={x:root.x-rodLength*.87+wiggle*18,y:root.y-rodLength+(current.phase==='fighting'?tension*w*.09:0)};
 const castTime=(time-phaseTime)/1000,casting=current.phase==='waiting'&&castTime<1&&!reduced.matches;
 if(casting){tip.x+=Math.sin(castTime*Math.PI*2)*w*.10;tip.y+=Math.cos(castTime*Math.PI*2)*w*.07;}
 const b={x:w*.42+wiggle*w*.07,y:h*.55+progress*h*.065+(current.phase==='biting'&&!reduced.matches?Math.sin(t*10)*9:Math.sin(t*.9)*2)};
 if(casting){const amount=Math.min(1,castTime);b.x=root.x+(b.x-root.x)*amount;b.y=root.y+(b.y-root.y)*amount-Math.sin(amount*Math.PI)*h*.28;}
 const active=current.phase!=='idle';if(!active){b.x=root.x-w*.035;b.y=root.y+h*.11;}
 // Guides, shaft and line all use this same cubic curve.
 const p1={x:root.x-rodLength*.25,y:root.y-rodLength*.47},p2={x:root.x-rodLength*.60,y:root.y-rodLength*1.20};
 const at=(u:number)=>({x:(1-u)**3*root.x+3*(1-u)**2*u*p1.x+3*(1-u)*u*u*p2.x+u**3*tip.x,y:(1-u)**3*root.y+3*(1-u)**2*u*p1.y+3*(1-u)*u*u*p2.y+u**3*tip.y});
 for(let i=0;i<28;i++){const a=at(i/28),z=at((i+1)/28);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(z.x,z.y);ctx.strokeStyle=i<18?'#394945':'#8b9d98';ctx.lineWidth=8*(1-i/28)+1.2;ctx.lineCap='round';ctx.stroke();ctx.beginPath();ctx.moveTo(a.x-1,a.y);ctx.lineTo(z.x-1,z.y);ctx.lineWidth=1;ctx.strokeStyle='#c4d3c58c';ctx.stroke();}
 for(const u of [.15,.35,.55,.75,.95]){const a=at(u);ctx.beginPath();ctx.ellipse(a.x-3,a.y+2,4*(1-u)+1.8,2*(1-u)+1,0,0,Math.PI*2);ctx.strokeStyle='#b3bdb8';ctx.lineWidth=1.2;ctx.stroke();}
 ctx.beginPath();ctx.moveTo(tip.x,tip.y);if(holding||tension>.75)ctx.lineTo(b.x,b.y);else ctx.quadraticCurveTo((tip.x+b.x)/2+12,(tip.y+b.y)/2+35,b.x,b.y);ctx.strokeStyle=tension>.88?'#e3a291':'#e7eddfb8';ctx.lineWidth=1.4;ctx.stroke();
 if(active&&(!casting||castTime>.8)){for(let i=0;i<3;i++){const wave=reduced.matches?i*12:((t*15+i*18)%55);ctx.beginPath();ctx.ellipse(b.x,b.y+10,14+wave,(14+wave)*.20,0,0,Math.PI*2);ctx.strokeStyle=`rgba(225,244,234,${.45*(1-wave/65)})`;ctx.lineWidth=1.5;ctx.stroke();}}
 const bobScale=active?1+progress*.4:.8;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(wiggle*.18);ctx.scale(bobScale,bobScale);ctx.fillStyle='#fbf5df';ctx.beginPath();ctx.ellipse(0,-1.5,4,11.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bd5540';ctx.fillRect(-4,-3,8,10);ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(0,-24);ctx.strokeStyle='#c9563b';ctx.lineWidth=2;ctx.stroke();ctx.restore();
 // Hands are a separate transparent layer; this connects exactly to the cork ferrule.
 ctx.save();if(current.phase==='fighting'&&holding&&!reduced.matches){ctx.translate(Math.sin(t*7)*.7,Math.cos(t*6)*.7);}ctx.drawImage(hands,fx,fy,fw,fh);ctx.restore();
 }
 raf=requestAnimationFrame(frame);};raf=requestAnimationFrame(frame);intersection=new IntersectionObserver(e=>{visible=e[0]?.isIntersecting??true});intersection.observe(container.current);
 }).catch(()=>{if(live)setError(true)});return()=>{live=false;cancelAnimationFrame(raf);observer?.disconnect();intersection?.disconnect()};
 },[location,retry]);
 return <div className={`fishing-pov ${preview?'pov-preview':''}`} ref={container}><canvas ref={canvas} role="img" aria-label={`1인칭 ${location==='pond'?'민물':'바다'} 낚시터 · 손과 낚싯대가 보이는 화면`}/>{caption&&!error&&<p className={`pov-caption ${phase==='biting'?'pov-bite':''}`} aria-live="polite">{caption}</p>}{error&&<div className="pov-error" role="alert">낚시터 이미지를 불러오지 못했어요.<button onClick={()=>setRetry(v=>v+1)}>다시 불러오기</button></div>}</div>;
}
