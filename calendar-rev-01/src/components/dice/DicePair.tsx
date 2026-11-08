import {useEffect,useRef} from 'react';
const dots:Record<number,[number,number][]>={1:[[.5,.5]],2:[[.27,.27],[.73,.73]],3:[[.27,.27],[.5,.5],[.73,.73]],4:[[.27,.27],[.73,.27],[.27,.73],[.73,.73]],5:[[.27,.27],[.73,.27],[.5,.5],[.27,.73],[.73,.73]],6:[[.27,.23],[.73,.23],[.27,.5],[.73,.5],[.27,.77],[.73,.77]]};
export function drawDie(ctx:CanvasRenderingContext2D,value:number,cx:number,cy:number,size:number,rotation=0){
 ctx.save();ctx.translate(cx,cy);ctx.rotate(rotation);const w=size,h=size*.53,d=size*.64;
 const poly=(points:number[][],color:string|CanvasGradient)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.lineJoin='round';ctx.strokeStyle='#998a70';ctx.lineWidth=1.2;ctx.stroke();};
 ctx.shadowColor='#0007';ctx.shadowBlur=12;ctx.shadowOffsetY=8;poly([[0,-h],[w,0],[0,h+d],[-w,0]],'#c4b79f');ctx.shadowColor='transparent';
 poly([[-w,0],[0,h],[0,h+d],[-w,d]],'#bdb198');poly([[0,h],[w,0],[w,d],[0,h+d]],'#ded3bd');
 const grad=ctx.createLinearGradient(0,-h,0,h);grad.addColorStop(0,'#fffef5');grad.addColorStop(1,'#e9e0ca');poly([[0,-h],[w,0],[0,h],[-w,0]],grad);
 for(const[u,v]of dots[value]||[]){const x=(u-v)*w,y=(u+v-1)*h;ctx.beginPath();ctx.ellipse(x,y,size*.115,size*.061,0,0,Math.PI*2);ctx.fillStyle=value===1?'#9a3434':'#302c28';ctx.fill();}
 const sides:Record<number,[number,number]>={1:[2,3],2:[3,1],3:[1,2],4:[1,5],5:[1,3],6:[2,4]};const [side,right]=sides[value]||[2,3];for(const[u,v]of dots[side]){ctx.beginPath();ctx.ellipse(-w+u*w,u*h+v*d,size*.075,size*.095,-.45,0,Math.PI*2);ctx.fillStyle='#4c473f';ctx.fill();}for(const[u,v]of dots[right]){ctx.beginPath();ctx.ellipse(u*w,h-u*h+v*d,size*.075,size*.095,.45,0,Math.PI*2);ctx.fillStyle='#4c473f';ctx.fill();}ctx.restore();
}
export default function DicePair({values,round,rolling=false}:{values?:[number,number];round:number;rolling?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{let raf=0;const canvas=ref.current;if(!canvas)return;canvas.width=480;canvas.height=250;const ctx=canvas.getContext('2d');if(!ctx)return;const start=performance.now();const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const paint=(time:number)=>{const t=Math.min(1,(time-start)/850),moving=rolling&&!reduced;ctx.clearRect(0,0,480,250);for(let i=0;i<2;i++){const v=moving?1+Math.floor(time/95+i*2)%6:values?.[i]||1;const settling=values&&!reduced?t:1;const x=170+i*140+(1-settling)*(i?-35:35),y=70+Math.sin((1-settling)*Math.PI)*-28;drawDie(ctx,v,x,y,45,moving?Math.sin(time/170+i)*.18:(1-settling)*.35*(i?1:-1));}if(moving||t<1)raf=requestAnimationFrame(paint);};paint(performance.now());return()=>cancelAnimationFrame(raf);},[values?.[0],values?.[1],round,rolling]);
 return <canvas ref={ref} className={`dice-pair ${values?'has-result':''}`} role="img" aria-label={values?`주사위 ${values[0]}와 ${values[1]}, 합계 ${values[0]+values[1]}`:'컵 안에서 주사위를 섞는 중'}/>;
}
