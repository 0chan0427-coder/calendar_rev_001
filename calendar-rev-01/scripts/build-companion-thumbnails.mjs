import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'']}));
const root=path.resolve(import.meta.dirname,'..');
async function registry(file,marker){const text=await fs.readFile(path.join(root,file),'utf8'),start=text.indexOf(marker)+marker.length;return JSON.parse(text.slice(start,text.indexOf(';',start)));}
const bodies=await registry('src/data/companionSprites.ts','COMPANION_SPRITES:Record<string,CompanionSprite>=');
const special=await registry('src/data/companionSpecialForms.ts','export const COMPANION_SPECIAL_FORMS:Record<string,CompanionSpecialArt>=');
const sources=[...new Set([...Object.values(bodies),...Object.values(special)].map(a=>a.image).concat('/world/wearables/shared/ribbon-red.png'))].sort();
const images={};let before=0,after=0;
for(let i=0;i<sources.length;i++){
 const source=sources[i],input=await fs.readFile(path.join(root,'public',source));
 const file=`/world/thumbs-064-${String(Math.floor(i/20)+1).padStart(2,'0')}/${String(i+1).padStart(3,'0')}-${path.basename(source,'.png')}.webp`;
 const {data,info}=await sharp(input).resize({width:256,height:256,fit:'inside',withoutEnlargement:true}).ensureAlpha().webp({quality:78,alphaQuality:95,effort:6}).toBuffer({resolveWithObject:true});
 const dest=path.join(root,'public',file);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,data);
 images[source]={image:file,width:info.width,height:info.height,bytes:data.length};before+=input.length;after+=data.length;
}
await fs.writeFile(path.join(root,'src/data/companion-thumbnails.json'),JSON.stringify({version:64,size:256,images},null,2)+'\n');
console.log(JSON.stringify({images:sources.length,originalBytes:before,thumbnailBytes:after,reduction:Math.round((1-after/before)*1000)/10}));
