import {JOB_HAIR_LUMA_082} from '../data/jobs082';
import {EYE_COLORS_079,HAIR_COLORS_079} from '../data/avatarColors079';
import {HAIR_LUMA_079} from '../data/hairLuma079';
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
const mix=(a:number[],b:number[],t:number)=>a.map((v,i)=>v*(1-t)+b[i]*t);
const hex=(v:number[])=>'#'+v.map(n=>Math.round(Math.max(0,Math.min(1,n))*255).toString(16).padStart(2,'0')).join('');
export function irisPalette079(id:string|undefined):string[]|undefined{const c=EYE_COLORS_079.find(c=>c.id===id);if(!c)return;const base=rgb(c.color);return [hex(mix(base,[.035,.025,.06],.65)),c.color,hex(mix(base,[1,.98,1],.48))];}
/** Hair alone is mapped through its measured luminance range; alpha is untouched. */
export function hairColorFilter079(colorId:string|undefined,path:string,uid:string):string{
 const color=HAIR_COLORS_079.find(c=>c.id===colorId);if(!color)return '';
 const q=JOB_HAIR_LUMA_082[path]||HAIR_LUMA_079[path]||[.08,.22,.45,.75];const base=rgb(color.color);
 const levels=[0,...q,1],colors=[[.025,.018,.03],mix(base,[.035,.025,.055],.65),mix(base,[.035,.025,.055],.25),base,mix(base,[1,.99,1],.48),[1,1,1]];
 const tables=[0,1,2].map(channel=>Array.from({length:96},(_,i)=>{const x=i/95;let j=0;while(j<levels.length-2&&x>levels[j+1])j++;const t=Math.max(0,Math.min(1,(x-levels[j])/(levels[j+1]-levels[j]||1)));return (colors[j][channel]*(1-t)+colors[j+1][channel]*t).toFixed(4);}).join(' '));
 return `<filter id="${uid}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${['R','G','B'].map((v,i)=>`<feFunc${v} type="table" tableValues="${tables[i]}"/>`).join('')}<feFuncA type="identity"/></feComponentTransfer></filter>`;
}
/** Existing painted eyes retain their pupils, lashes and white catchlights. */
export function defaultEyeColor079(sprite:string,colorId:string|undefined,makeup:string|undefined,uid:string):string{
 const palette=irisPalette079(colorId);if(!palette||makeup==='makeup-mukuro-six')return sprite;
 const colors=[[.025,.02,.03],...palette.map(rgb),[1,1,1]];
 const filter=`<filter id="${uid}-tint" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${['R','G','B'].map((c,i)=>`<feFunc${c} type="table" tableValues="${colors.map(v=>v[i].toFixed(4)).join(' ')}"/>`).join('')}<feFuncA type="identity"/></feComponentTransfer></filter>`;
 return `<defs>${filter}<clipPath id="${uid}-irises"><ellipse cx="400" cy="413" rx="43" ry="48"/><ellipse cx="619" cy="413" rx="43" ry="48"/></clipPath></defs>${sprite}<g clip-path="url(#${uid}-irises)"><g filter="url(#${uid}-tint)">${sprite}</g></g>`;
}
