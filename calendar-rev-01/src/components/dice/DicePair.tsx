import {useEffect,useRef} from 'react';
const dots:Record<number,[number,number][]>={1:[[.5,.5]],2:[[.27,.27],[.73,.73]],3:[[.27,.27],[.5,.5],[.73,.73]],4:[[.27,.27],[.73,.27],[.27,.73],[.73,.73]],5:[[.27,.27],[.73,.27],[.5,.5],[.27,.73],[.73,.73]],6:[[.27,.23],[.73,.23],[.27,.5],[.73,.5],[.27,.77],[.73,.77]]};
type Point3=[number,number,number];
/** Project all six opaque cube faces, back to front, rather than spinning a flat sprite. */
export function drawDie(ctx:CanvasRenderingContext2D,value:number,cx:number,cy:number,size:number,rotation=0){
 const yaw=.72+rotation,pitch=.60+rotation*.75,roll=rotation*.25;
 const project=([x,y,z]:Point3)=>{
  const u=x*Math.cos(yaw)+z*Math.sin(yaw),v=-x*Math.sin(yaw)+z*Math.cos(yaw);
  const yy=y*Math.cos(pitch)-v*Math.sin(pitch),zz=y*Math.sin(pitch)+v*Math.cos(pitch);
  return [(u*Math.cos(roll)-yy*Math.sin(roll))*size*.76+cx,(u*Math.sin(roll)+yy*Math.cos(roll))*size*.76+cy,zz];
 };
 const sides:Record<number,[number,number]>={1:[2,3],2:[3,1],3:[1,2],4:[1,5],5:[1,3],6:[2,4]};
 const [front,right]=sides[value]||[2,3];
 const faces:{n:number;corners:Point3[];shade:string}[]=[
  {n:value,corners:[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],shade:'#fff9e9'},
  {n:7-value,corners:[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],shade:'#c9bba1'},
  {n:front,corners:[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],shade:'#d9ccb2'},
  {n:7-front,corners:[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],shade:'#e0d3b9'},
  {n:right,corners:[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],shade:'#eee3cd'},
  {n:7-right,corners:[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],shade:'#bfb197'}
 ];
 const position=(corners:Point3[],u:number,v:number):Point3=>corners[0].map((_,axis)=>corners[0][axis]*(1-u)*(1-v)+corners[1][axis]*u*(1-v)+corners[2][axis]*u*v+corners[3][axis]*(1-u)*v)as Point3;
 faces.sort((a,b)=>a.corners.reduce((n,p)=>n+project(p)[2],0)-b.corners.reduce((n,p)=>n+project(p)[2],0));
 ctx.save();ctx.lineJoin='round';ctx.lineWidth=1.4;
 for(const face of faces){
  const points=face.corners.map(project);ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=face.shade;ctx.fill();ctx.strokeStyle='#a99c82';ctx.stroke();
  for(const[u,v]of dots[face.n]){
   ctx.beginPath();for(let i=0;i<20;i++){const angle=i*Math.PI/10;const[x,y]=project(position(face.corners,u+Math.cos(angle)*.075,v+Math.sin(angle)*.075));if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fillStyle=face.n===1?'#933f32':'#302c28';ctx.fill();
  }
 }
 ctx.restore();
}
/** A single opaque canvas keeps cup occlusion, shadows and dice on the same stage. */
export default function DicePair({values,round,rolling=false}:{values?:[number,number];round:number;rolling?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;
  canvas.width=960;canvas.height=500;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const start=performance.now(),motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf=0;
  const cup=(x:number,y:number,angle:number)=>{
   ctx.save();ctx.translate(x,y);ctx.rotate(angle);
   ctx.shadowColor='#0008';ctx.shadowBlur=14;ctx.shadowOffsetY=10;
   const leather=ctx.createLinearGradient(-37,0,37,0);
   leather.addColorStop(0,'#231912');leather.addColorStop(.3,'#79513a');leather.addColorStop(.5,'#946b49');leather.addColorStop(1,'#302019');
   ctx.beginPath();ctx.moveTo(-35,-43);ctx.quadraticCurveTo(-43,-39,-31,43);ctx.quadraticCurveTo(0,55,31,43);ctx.quadraticCurveTo(43,-39,35,-43);ctx.closePath();ctx.fillStyle=leather;ctx.fill();
   ctx.shadowColor='transparent';ctx.strokeStyle='#aa8054';ctx.lineWidth=1.5;ctx.stroke();
   ctx.beginPath();ctx.ellipse(0,-42,35,10,0,0,Math.PI*2);ctx.fillStyle='#17140f';ctx.fill();ctx.strokeStyle='#c3a06b';ctx.lineWidth=3;ctx.stroke();
   ctx.setLineDash([2,3]);ctx.strokeStyle='#be946369';ctx.beginPath();ctx.moveTo(-26,-24);ctx.lineTo(-22,35);ctx.moveTo(26,-24);ctx.lineTo(22,35);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='#c9a872';ctx.font='21px Georgia';ctx.textAlign='center';ctx.fillText('Ⅱ',0,15);ctx.restore();
  };
  const paint=(now:number)=>{
   const seconds=(now-start)/1000,reduced=motion.matches;
   // Hidden dice during shaking; only leave the mouth once the cup tips.
   const release=rolling?Math.max(0,Math.min(1,(seconds-2.5)/2.3)):1;
   ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,480,250);
   ctx.save();ctx.translate(240,185);ctx.scale(1,.22);const shade=ctx.createRadialGradient(0,0,8,0,0,190);shade.addColorStop(0,'#0005');shade.addColorStop(1,'#0000');ctx.fillStyle=shade;ctx.beginPath();ctx.arc(0,0,190,0,Math.PI*2);ctx.fill();ctx.restore();
   if(!rolling||(!reduced&&release>0)){
    for(let i=0;i<2;i++){
     if(rolling&&seconds<2.5+i*.16)continue;
     const step=rolling?Math.max(0,Math.min(1,(seconds-2.5-i*.16)/2.14)):1;
     const sign=i?1:-1,travel=1-Math.pow(1-step,3);
     const x=205+(i?75:-55)*travel,y=108+48*travel-Math.abs(Math.sin(step*Math.PI*3))*26*(1-step);
     const rotation=rolling?(1-step)*sign*7+sign*.1:sign*.1;
     // Decorative cube orientation never determines the server result.
     const face=values?.[i]??(1+(round*3+i*2)%6);
     ctx.save();ctx.translate(x,204);ctx.scale(1,.22);ctx.fillStyle='#0004';ctx.beginPath();ctx.arc(0,0,26+8*travel,0,Math.PI*2);ctx.fill();ctx.restore();
     drawDie(ctx,face,x,y,29+7*travel,rotation);
    }
   }
   if(rolling){
    if(reduced)cup(240,100,0);
    else if(seconds<2.5)cup(240+Math.sin(seconds*23)*7,100+Math.cos(seconds*19)*3,Math.sin(seconds*23)*.11);
    else {const tip=Math.min(1,(seconds-2.5)/.55);cup(240+105*tip,100-20*Math.sin(tip*Math.PI),-1.9*tip);}
   }else cup(345,100,-1.9);
   if(rolling&&!reduced)raf=requestAnimationFrame(paint);
  };
  paint(start);const changed=()=>{cancelAnimationFrame(raf);paint(performance.now());};
  motion.addEventListener('change',changed);
  return()=>{cancelAnimationFrame(raf);motion.removeEventListener('change',changed);};
 },[values?.[0],values?.[1],round,rolling]);
 return <canvas ref={ref} className={`dice-pair dice-stage ${values?'has-result':''}`} role="img" aria-label={values?`주사위 ${values[0]}와 ${values[1]}, 합계 ${values[0]+values[1]}`:'컵을 흔들고 주사위를 굴리는 중'}/>;
}
