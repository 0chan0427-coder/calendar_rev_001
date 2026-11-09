import {LIP_COLORS_080} from '../data/avatarMouth080';
/** The original body remains intact. A feathered sample of its own clean cheek
 * replaces only the baked smile, before the common skin-tone filter is applied. */
export function mouthSkinPatch080(mouth:string|undefined,body:string,uid:string,dx=0,dy=0):string{
 if(!mouth||mouth==='mouth080-default')return '';
 return `<defs><filter id="${uid}-soft" x="-10%" y="-20%" width="120%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="2"/></filter></defs><g data-mouth-cleanup="true" filter="url(#${uid}-soft)"><svg x="${440+dx}" y="${482+dy}" width="138" height="48" viewBox="${440+dx} ${468+dy} 138 16" preserveAspectRatio="none" overflow="hidden">${body}</svg></g>`;
}
export function renderMouth080(mouth:string|undefined,lipColor:string|undefined,gender:'male'|'female',uid:string):string{
 if(!mouth||mouth==='mouth080-default')return '';
 const dy=gender==='female'?-5:0;
 const stroke='#a95b4d';let art='';
 if(mouth==='mouth080-line')art=`<path d="M478 502Q508 504 538 502" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round"/>`;
 if(mouth==='mouth080-frown')art=`<path d="M477 513Q507 486 539 513" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round"/>`;
 if(mouth==='mouth080-pout')art=`<path d="M484 501Q499 492 507 500Q516 490 530 499Q519 512 507 507Q494 514 484 501Z" fill="#cc8a84"/><path d="M484 501Q505 505 530 499" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>`;
 if(mouth==='mouth080-full'){
  const c=LIP_COLORS_080.find(c=>c.id===lipColor)?.color||LIP_COLORS_080[0].color;
  const highlight='#'+[1,3,5].map(i=>Math.round(parseInt(c.slice(i,i+2),16)*.78+255*.22).toString(16).padStart(2,'0')).join('');
  art=`<defs><linearGradient id="${uid}-lip" x2="0" y2="1"><stop stop-color="${c}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${highlight}"/></linearGradient></defs><path d="M468 502Q490 478 507 492Q524 478 548 502Q528 525 507 522Q486 525 468 502Z" fill="url(#${uid}-lip)" stroke="${c}" stroke-width="2"/><path d="M472 502Q508 510 544 502" fill="none" stroke="#3f2432" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/><path d="M490 514Q508 519 526 513" fill="none" stroke="#fff0e6" stroke-opacity=".48" stroke-width="3" stroke-linecap="round"/>`;
 }
 return `<g data-mouth="${mouth}" transform="translate(0 ${dy})">${art}</g>`;
}
