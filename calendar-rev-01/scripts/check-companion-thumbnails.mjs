import {readFileSync,readdirSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const registry=(file,marker)=>{const text=readFileSync(resolve(root,file),'utf8'),start=text.indexOf(marker)+marker.length;return JSON.parse(text.slice(start,text.indexOf(';',start)));};
const entries=[...Object.values(registry('src/data/companionSprites.ts','COMPANION_SPRITES:Record<string,CompanionSprite>=')),...Object.values(registry('src/data/companionSpecialForms.ts','export const COMPANION_SPECIAL_FORMS:Record<string,CompanionSpecialArt>='))];
const sources=new Set(entries.map(a=>a.image).concat('/world/wearables/shared/ribbon-red.png'));
const manifest=JSON.parse(readFileSync(resolve(root,'src/data/companion-thumbnails.json'),'utf8'));
if(manifest.version!==64||Object.keys(manifest.images).length!==sources.size)throw Error('Thumbnail manifest version/coverage mismatch');
const folders=new Set();
for(const src of sources){const a=manifest.images[src];if(!a||!/^\/world\/thumbs-064-\d{2}\/[^/]+\.webp$/.test(a.image))throw Error(`Thumbnail missing: ${src}`);
 const file=resolve(root,'public',a.image.slice(1)),data=readFileSync(file);
 if(data.subarray(0,4).toString()!=='RIFF'||data.subarray(8,12).toString()!=='WEBP'||statSync(file).size!==a.bytes||Math.max(a.width,a.height)>256)throw Error(`Invalid thumbnail: ${file}`);
 folders.add(resolve(file,'..'));
}
for(const folder of folders)if(readdirSync(folder).filter(f=>f.endsWith('.webp')).length>20)throw Error(`More than 20 thumbnails in ${folder}`);
console.log(`Companion thumbnails verified: ${sources.size} images in ${folders.size} folders, at most 20 per folder.`);
