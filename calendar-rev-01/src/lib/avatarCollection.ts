import type {Box,CollectionItem} from '../data/collection01';
import type {AssetResolver} from './avatarRaster';
const safe=(s:string)=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
export function collectionAsset(item:CollectionItem|undefined,resolve:AssetResolver,alphaId:string,box?:Box,crop?:Box,imageExtra=''){
 if(!item)return '';
 const b=box||item.box;
 return `<svg data-collection="${item.id}" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" viewBox="${(crop||item.crop).join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${safe(resolve(item.image))}" width="${item.width}" height="${item.height}" filter="url(#${alphaId})" ${imageExtra}/></svg>`;
}
/** Complementary masks split source art without cutting a generic hole around the face. */
export function hairLayerMasks(width:number,height:number,backPath:string,backId:string,frontId:string){
 return `<mask id="${backId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><path d="${backPath}" fill="white"/></mask><mask id="${frontId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="white"/><path d="${backPath}" fill="black"/></mask>`;
}
/** One transform for the whole hairstyle keeps the crown, part and tie aligned. */
export function collectionHair(item:CollectionItem|undefined,resolve:AssetResolver,alphaId:string,maskId:string,layer:'front'|'back'){
 if(!item||(!item.hairLayers&&layer==='back'))return '';
 return collectionAsset(item,resolve,alphaId,undefined,undefined,item.hairLayers?`mask="url(#${maskId})"`:'');
}
export function collectionShoes(item:CollectionItem|undefined,gender:'male'|'female',resolve:AssetResolver,alphaId:string,frontMaskId:string,front:boolean){
 if(!item?.feet)return '';
 const [x,y,w,h]=item.box,footWidth=(w-50)/2,offset=gender==='male'?-14:6;
 const cutOpening=item.kind==='boot'||['shoes-maryjane','shoes-oxford','shoes-slippers'].includes(item.id);
 return item.feet.map((crop,i)=>collectionAsset(item,resolve,alphaId,[item.id==='shoes-maryjane'?(i===0?292:520):i===0?x:x+w-footWidth,y+offset,footWidth,h],crop,front&&cutOpening?`mask="url(#${frontMaskId})"`:'')).join('');
}
/** Cut only the rear opening, preserving tongues, straps and front trim. */
export function collectionCuffMask(item:CollectionItem|undefined,id:string){
 if(!item?.feet)return '';
 let custom='';
 if(item.id==='shoes-maryjane')custom='M315 170H610V445Q475 395 315 445Z M305 523Q450 440 603 532L590 589Q448 642 300 590Z M926 170H1221V445Q1061 395 926 445Z M1231 523Q1086 440 933 532L946 589Q1088 642 1236 590Z';
 if(item.id==='shoes-oxford')custom='M390 260H660V355Q580 345 535 378Q465 358 400 371Z M876 260H1146V371Q1071 358 1001 378Q956 345 876 355Z';
 if(item.id==='shoes-slippers')custom='M330 180H680V420Q590 360 474 348Q410 330 330 345Z M856 180H1206V345Q1126 330 1062 348Q946 360 856 420Z';
 if(item.kind!=='boot'&&!custom)return '';
 const paths=custom||item.feet.map(([x,y,w,h],i)=>{
  const left=i===0?x+w*.34:x+w*.06,right=i===0?x+w*.94:x+w*.66;
  return `M${left} ${y-12}H${right}V${y+h*.07}Q${(left+right)/2} ${y+h*.25} ${left} ${y+h*.07}Z`;
 }).join(' ');
 return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${item.width}" height="${item.height}"><rect width="${item.width}" height="${item.height}" fill="white"/><path d="${paths}" fill="black"/></mask>`;
}
