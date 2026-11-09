import type {Equipment,Wearable} from '../data/wardrobe';
import {avatarSvgMarkup} from './avatarRaster';
/** Keep the full avatar viewport inside the crop so filters/masks retain body coordinates. */
export function wearableThumbnailSvg(item:Wearable,gender:'male'|'female',uid:string,resolve:(p:string)=>string=p=>p){
 const equipment:Equipment={hair:'hair-none',hat:'hat-none',outer:'outer-none',glasses:'glasses-none',makeup:'makeup-none',[item.slot]:item.id};
 const face=['face','skin','makeup','glasses'].includes(item.slot);
 const view=item.slot==='hair'?'-60 -70 1160 820':face?(item.slot==='skin'?'205 160 615 465':'250 290 525 255'):undefined;
 const svg=avatarSvgMarkup(gender,equipment,uid,resolve,{animate:false,eyeState:'open'});
 const fullView=svg.match(/^<svg\b[^>]*viewBox="([^"]+)"/)?.[1]||'0 0 1024 1536';
 const [x,y,width,height]=fullView.split(/\s+/).map(Number);
 const inner=svg.replace(/^<svg\b[^>]*>/,tag=>tag.replace(/\swidth="[^"]*"/,` width="${width}"`).replace(/\sheight="[^"]*"/,` height="${height}"`).replace(/>$/,` x="${x}" y="${y}">`));
 return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="${view||fullView}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}
