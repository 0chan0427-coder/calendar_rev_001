import type {Equipment,Wearable} from '../data/wardrobe';
import {avatarSvgMarkup} from './avatarRaster';
/** The outer viewport alone is replaced; nested garment viewports retain their coordinates. */
export function wearableThumbnailSvg(item:Wearable,gender:'male'|'female',uid:string,resolve:(p:string)=>string=p=>p){
 const equipment:Equipment={hair:'hair-none',hat:'hat-none',outer:'outer-none',glasses:'glasses-none',makeup:'makeup-none',[item.slot]:item.id};
 const face=['face','skin','makeup','glasses'].includes(item.slot);
 const view=face?(item.slot==='skin'?'205 160 615 465':'250 290 525 255'):undefined;
 const svg=avatarSvgMarkup(gender,equipment,uid,resolve,{animate:false,eyeState:'open'});
 return svg.replace(/^<svg\b[^>]*>/,tag=>tag.replace(/\swidth="[^"]*"/,' width="320"').replace(/\sheight="[^"]*"/,' height="240"').replace(/preserveAspectRatio="[^"]*"/,'preserveAspectRatio="xMidYMid meet"').replace(/viewBox="[^"]*"/,m=>view?`viewBox="${view}"`:m));
}
