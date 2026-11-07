import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'']}));
const root=path.resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await fs.readFile(path.join(root,'src/data/pet-battle-catalog.json'),'utf8'));
const spritePath=path.join(root,'src/data/companionSprites.ts'),specialPath=path.join(root,'src/data/companionSpecialForms.ts'),sizePath=path.join(root,'src/data/companions.ts');
let spritesText=await fs.readFile(spritePath,'utf8');const marker='COMPANION_SPRITES:Record<string,CompanionSprite>=';
const sprites=JSON.parse(spritesText.slice(spritesText.indexOf(marker)+marker.length,spritesText.lastIndexOf(';')));
let specialText=await fs.readFile(specialPath,'utf8');const specialMarker='export const COMPANION_SPECIAL_FORMS:Record<string,CompanionSpecialArt>=';const start=specialText.indexOf(specialMarker)+specialMarker.length,end=specialText.indexOf(';',start);
const special=JSON.parse(specialText.slice(start,end));
let sizeText=await fs.readFile(sizePath,'utf8');
const sizeMarker='export const COMPANION_SCENE_SIZES:Record<string,[number,number]>=';const sizeStart=sizeText.indexOf(sizeMarker)+sizeMarker.length,sizeEnd=sizeText.indexOf(';',sizeStart);
const sizes=vm.runInNewContext('('+sizeText.slice(sizeStart,sizeEnd)+')');
const missing=[];for(const p of catalog.pets.filter(p=>!p.existing))try{await fs.access(path.join(root,'public',p.image));}catch{missing.push(p.id);}
if(missing.length)throw Error(`Missing ${missing.length} images: ${missing.join(', ')}`);
for(const p of catalog.pets.filter(p=>!p.existing)){
 const file=path.join(root,'public',p.image),original=await fs.readFile(file);
 const png=await sharp(original).resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).ensureAlpha().png({compressionLevel:9,adaptiveFiltering:true}).toBuffer();
 const {data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=0,bottom=0,transparent=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const alpha=data[(y*info.width+x)*4+3];if(alpha<16)transparent++;if(alpha>16){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}}
 if(transparent<info.width*info.height*.04)throw Error(`Image is not transparently cut out: ${p.id}`);
 const crop=[Math.max(0,left-5),Math.max(0,top-5),Math.min(info.width,right+6)-Math.max(0,left-5),Math.min(info.height,bottom+6)-Math.max(0,top-5)];
 sprites[p.spriteKey]={image:p.image,width:info.width,height:info.height,crop};
 special[p.spriteKey]={...sprites[p.spriteKey],accessory:[88,8,.65],palette:p.specialPalette};
 sizes[p.spriteKey]=p.size;
 await fs.writeFile(file,png);
}
spritesText=spritesText.slice(0,spritesText.indexOf(marker)+marker.length)+JSON.stringify(sprites,null,2)+';\n';
specialText=specialText.slice(0,start)+JSON.stringify(special,null,2)+specialText.slice(end);
sizeText=sizeText.slice(0,sizeStart)+JSON.stringify(sizes,null,2)+sizeText.slice(sizeEnd);
await fs.writeFile(spritePath,spritesText);await fs.writeFile(specialPath,specialText);await fs.writeFile(sizePath,sizeText);
await fs.writeFile(path.join(root,'public/world/pet-art-manifest-v062.json'),JSON.stringify(Object.fromEntries(catalog.pets.map(p=>[p.id,sprites[p.spriteKey]])),null,2));
console.log(`Registered ${catalog.pets.length} battle forms, ${Object.keys(sprites).length} total existing/new sprite variants.`);
