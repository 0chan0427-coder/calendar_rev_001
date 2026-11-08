import type {CollectionItem} from '../data/collection01';
/** Head enclosure is explicit metadata; changing a hat never erases stored hair/face choices. */
function windowTransform(item:CollectionItem){const [x,y,w,h]=item.box,[cx,cy,cw,ch]=item.crop;return `matrix(${w/cw} 0 0 ${h/ch} ${x-cx*w/cw} ${y-cy*h/ch})`;}
export function helmetDefs(item:CollectionItem,uid:string){
 if(!item.helmet)return '';
 const face=item.helmet.mode==='open'&&item.helmet.windowPath?`<path d="${item.helmet.windowPath}" transform="${windowTransform(item)}"/>`:'';
 return `<clipPath id="${uid}-head-visible"><rect x="-1000" y="575" width="3000" height="2500"/>${face}</clipPath><clipPath id="${uid}-helmet-face">${face}</clipPath>`;
}
export function helmetLining(item:CollectionItem|undefined,uid:string){return item?.helmet?.mode==='open'?`<g data-layer="helmet-lining" clip-path="url(#${uid}-helmet-face)"><rect x="0" y="-300" width="1024" height="1100" fill="${item.helmet.lining}"/></g>`:'';}
export function helmetFaceClip(item:CollectionItem|undefined,uid:string){return item?.helmet?`clip-path="url(#${uid}-helmet-face)"`:'';}
