import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
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
