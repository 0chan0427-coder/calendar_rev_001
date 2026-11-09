import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(root,'public/world/hair-078');
const expected=['bob','curls','long','pony','short','sidepart','twintail','wave'];
const actual=readdirSync(dir).filter(f=>f.endsWith('.png')).map(f=>f.slice(0,-4)).sort();
if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Hair 078: upload all eight PNGs to public/world/hair-078.');
for(const key of expected){const png=readFileSync(resolve(dir,key+'.png'));if(png.readUInt32BE(16)!==1254||png.readUInt32BE(20)!==1254)throw Error(`Hair 078: unregistered image dimensions: ${key}`);}
const catalog=readFileSync(resolve(root,'src/data/collection01.ts'),'utf8');
const marker='export const COLLECTION_01:CollectionItem[]=';const start=catalog.indexOf(marker)+marker.length,end=catalog.indexOf('\n];',start)+2;const items=JSON.parse(catalog.slice(start,end));
for(const key of ['wave','sidepart','curls','long','twintail','pony']){const item=items.find(i=>i.id==='hair-'+key);if(item?.image!==`/world/hair-078/${key}.png`)throw Error(`Hair 078: stale catalog entry: ${key}`);}
console.log('Hair 078 checks passed: 6 original styles + 2 basic styles; 8 images.');
