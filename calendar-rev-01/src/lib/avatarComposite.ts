import {avatarSvgMarkup} from './avatarRaster';
import {avatarClipPaths} from './avatarClipPaths';
import type {Equipment} from '../data/wardrobe';

export interface AvatarComposite {open:string;closed:string}
const images=new Map<string,Promise<string>>();
const readDataUrl=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('avatar image decode failed'));reader.readAsDataURL(blob);});
function embeddedImage(path:string){
 let promise=images.get(path);
 if(!promise){promise=fetch(path).then(async r=>{if(!r.ok)throw Error('avatar image unavailable');return readDataUrl(await r.blob());});images.set(path,promise);void promise.catch(()=>{if(images.get(path)===promise)images.delete(path);});
  while(images.size>24)images.delete(images.keys().next().value!);
 }
 return promise;
}
async function rasterize(svg:string){
 // The SVG is an isolated image document, never a mask subtree in the page DOM.
 // Embed every image first: canvas stays origin-clean and background alpha is retained.
 const source=URL.createObjectURL(new Blob([avatarClipPaths(svg)],{type:'image/svg+xml'}));
 try{
  const img=new Image();img.src=source;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1536;
  const context=canvas.getContext('2d');if(!context)throw Error('avatar canvas unavailable');
  context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(img,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('avatar composition failed')),'image/png'));
  canvas.width=canvas.height=1;
  return URL.createObjectURL(blob);
 }finally{URL.revokeObjectURL(source);}
}
async function compose(gender:'male'|'female',equipment:Equipment):Promise<AvatarComposite>{
 const paths=new Set<string>();avatarSvgMarkup(gender,equipment,'composite',p=>{paths.add(p);return p;},{animate:false});
 const embedded=new Map(await Promise.all([...paths].map(async p=>[p,await embeddedImage(p)] as const)));
 const resolve=(p:string)=>{const data=embedded.get(p);if(!data)throw Error('avatar asset missing');return data;};
 const open=await rasterize(avatarSvgMarkup(gender,equipment,'composite',resolve,{animate:false,eyeState:'open'}));
 try{return {open,closed:await rasterize(avatarSvgMarkup(gender,equipment,'composite',resolve,{animate:false,eyeState:'closed'}))};}
 catch(error){URL.revokeObjectURL(open);throw error;}
}
interface Entry {promise:Promise<AvatarComposite>;refs:number;frames?:AvatarComposite}
const cache=new Map<string,Entry>();
function trim(){for(const[key,entry]of cache){if(cache.size<=6)break;if(entry.refs===0&&entry.frames){URL.revokeObjectURL(entry.frames.open);URL.revokeObjectURL(entry.frames.closed);cache.delete(key);}}}
/** Share profile/room/wardrobe images, and release obsolete outfits on small devices. */
export function acquireAvatarComposite(gender:'male'|'female',equipment:Equipment){
 const key=JSON.stringify([gender,Object.entries(equipment).filter(([,v])=>v).sort(([a],[b])=>a.localeCompare(b))]);
 let entry=cache.get(key);
 if(!entry){const created:Entry={refs:0,promise:compose(gender,equipment)};entry=created;cache.set(key,created);void created.promise.then(frames=>{created.frames=frames;trim();},()=>{if(cache.get(key)===created)cache.delete(key);});}
 else{cache.delete(key);cache.set(key,entry);}
 entry.refs++;let released=false;
 return {promise:entry.promise,release:()=>{if(released)return;released=true;entry!.refs--;trim();}};
}
