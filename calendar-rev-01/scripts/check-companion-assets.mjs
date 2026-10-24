import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateSync} from 'node:zlib';
const root=resolve(process.argv[2]||resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const source=readFileSync(resolve(root,'src/data/companionSprites.ts'),'utf8');
const marker='COMPANION_SPRITES:Record<string,CompanionSprite>=';
const start=source.indexOf(marker)+marker.length;
if(start<marker.length)throw Error('Companion metadata must remain a JSON object.');
const sprites=JSON.parse(source.slice(start,source.lastIndexOf(';')));
const aliases=readFileSync(resolve(root,'src/data/companionCatalog.ts'),'utf8');
const block=aliases.split('export const COMPANION_ALIASES:Record<string,string>=')[1]?.split('};')[0]||'';
const map=Object.fromEntries([...block.matchAll(/'?([a-z][a-z0-9-]*)'?:'([^']+)'/g)].map(m=>[m[1],m[2]]));
const catalog=readFileSync(resolve(root,'src/constants/world.ts'),'utf8');
const adultCatalog=readFileSync(resolve(root,'src/data/adultCompanions.ts'),'utf8');
const ids=[...(catalog+'\n'+adultCatalog).matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'[^']+',\s*type:\s*'animal'/g)].map(m=>m[1]);
for(const id of ids)if(!sprites[map[id]||id])throw Error(`Animal ${id} has no registered new art.`);
const sizes=readFileSync(resolve(root,'src/data/companions.ts'),'utf8'),folders=new Set();
for(const [key,a] of Object.entries(sprites)){
 if(!sizes.includes("'"+key+"':")&&!new RegExp('\\b'+key+':').test(sizes))throw Error(`Animal ${key} has no explicit scene size.`);
 if(!Array.isArray(a.crop)||a.crop.length!==4||!a.crop.every(Number.isFinite)||a.crop[2]<=0||a.crop[3]<=0)throw Error(`Invalid animal crop: ${key}`);
 if(!/^\/world\/companions-v[345]\/[^/]+\.png$/.test(a.image))throw Error(`Legacy/unregistered animal art path: ${key}`);
 const file=resolve(root,'public',a.image.slice(1)),bytes=readFileSync(file);folders.add(dirname(file));
 if(bytes.readUInt32BE(16)!==a.width||bytes.readUInt32BE(20)!==a.height)throw Error(`Animal dimensions mismatch: ${key}`);
 if(bytes[25]!==6)throw Error(`Animal must have PNG transparency: ${key}`);
 if(bytes.length>=25*1024*1024)throw Error(`Animal exceeds individual upload size: ${key}`);
}
for(const folder of folders)if(readdirSync(folder).filter(n=>n.endsWith('.png')).length>20)throw Error('Animal image folder exceeds 20 files.');
console.log(`Companion checks passed: ${ids.length} base shop IDs, ${Object.keys(sprites).length} sprite variants. Visual animation/fit review also required.`);
const specialSource=readFileSync(resolve(root,'src/data/companionSpecialForms.ts'),'utf8');
const specialMarker='export const COMPANION_SPECIAL_FORMS:Record<string,CompanionSpecialArt>=';
const specialStart=specialSource.indexOf(specialMarker)+specialMarker.length;
if(specialStart<specialMarker.length)throw Error('Missing special form registry.');
const forms=JSON.parse(specialSource.slice(specialStart,specialSource.indexOf(';',specialStart)));
const expected=new Set([...Object.keys(sprites),'cat-gray','adult-cat-gray']);
const migration=readFileSync(resolve(root,'supabase/025_all_companion_special_forms.sql'),'utf8');
const sqlForms=Object.fromEntries([...migration.matchAll(/\('([^']+)','(\/world\/[^']+\.png)',true\)/g)].map(m=>[m[1],m[2]]));
const specialFolders=new Set(),images=new Set();
for(const [key,a] of Object.entries(forms)){
 if(!expected.delete(key))throw Error(`Unexpected special body: ${key}`);
 if(!/^\/world\/bond-(054|055-0[12])\/[^/]+\.png$/.test(a.image))throw Error(`Invalid special image path: ${key}`);
 if(images.has(a.image))throw Error(`Special body needs its own image: ${key}`);images.add(a.image);
 if(sqlForms[key]!==a.image)throw Error(`SQL special registry differs: ${key}`);delete sqlForms[key];
 if(!Array.isArray(a.crop)||a.crop.length!==4||!a.crop.every(Number.isFinite)||a.crop[2]<=0||a.crop[3]<=0)throw Error(`Invalid special crop: ${key}`);
 if(!Array.isArray(a.accessory)||a.accessory.length!==3||!a.accessory.every(Number.isFinite)||a.accessory[0]<0||a.accessory[0]>100||a.accessory[1]<0||a.accessory[1]>100||a.accessory[2]<=0)throw Error(`Missing special accessory registration: ${key}`);
 if(key.endsWith('dog')&&(!a.glasses||a.glasses.length!==5||!a.glasses.every(Number.isFinite)))throw Error(`Missing special dog sunglasses fit: ${key}`);
 const file=resolve(root,'public',a.image.slice(1)),bytes=readFileSync(file);specialFolders.add(dirname(file));
 if(bytes.length>=25*1024*1024||bytes.readUInt32BE(16)!==a.width||bytes.readUInt32BE(20)!==a.height||bytes[24]!==8||bytes[25]!==6)throw Error(`Invalid special PNG: ${key}`);
 const chunks=[];let end=false;
 for(let pos=8;pos<bytes.length;){const len=bytes.readUInt32BE(pos),type=bytes.toString('ascii',pos+4,pos+8);if(pos+len+12>bytes.length)throw Error(`Truncated special PNG: ${key}`);if(type==='IDAT')chunks.push(bytes.subarray(pos+8,pos+8+len));pos+=len+12;if(type==='IEND'){end=pos===bytes.length;break;}}
 if(!end||inflateSync(Buffer.concat(chunks)).length!==(a.width*4+1)*a.height)throw Error(`Incomplete special PNG: ${key}`);
}
if(expected.size||Object.keys(sqlForms).length)throw Error('Special forms do not cover all registered bodies and cat coats.');
for(const folder of specialFolders)if(readdirSync(folder).filter(n=>n.endsWith('.png')).length>20)throw Error('Special image folder exceeds 20 files.');
console.log(`Special form checks passed: ${Object.keys(forms).length} complete PNGs, body/accessory registrations and SQL catalog match.`);
