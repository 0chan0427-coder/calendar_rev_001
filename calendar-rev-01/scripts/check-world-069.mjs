import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const parse=(p,name)=>{const tail=read(p).split(`export const ${name}`)[1];return JSON.parse(tail.slice(tail.indexOf('=')+1).trim().replace(/;\s*$/,''));};
const items=parse('src/data/furnishings01.ts','FURNISHINGS_01'),themes=parse('src/data/gardenThemeArt.ts','GARDEN_THEME_ART');assert.equal(items.length,40);assert.equal(themes.length,8);assert.equal(new Set([...items,...themes].map(x=>x.id)).size,48);
// SQL runs separately in Supabase; it is not a required deployment asset.
const migration='supabase/069_gardens_eyes_furnishings.sql';
const sql=existsSync(new URL(migration,root))?read(migration):null;
for(const x of [...items,...themes]){assert(existsSync(new URL('public'+x.image,root)),x.image);const box=x.crop||x.windowCrop;assert.equal(box.length,4);assert(box.every(Number.isFinite));assert(box[0]>=0&&box[1]>=0&&box[2]>0&&box[3]>0&&box[0]+box[2]<=x.width&&box[1]+box[3]<=x.height,x.id);if(sql!==null)assert(sql.includes(x.id),x.id);}
for(const [dir,count]of [['furnishings-01',20],['furnishings-02',20],['garden-themes-01',8]])assert.equal(readdirSync(new URL('public/world/'+dir,root)).filter(x=>x.endsWith('.webp')).length,count);
assert.equal((read('src/lib/avatarEyes.ts').match(/id:'eyes-/g)||[]).length,8);
console.log('V069: 40 furnishings, 8 gardens, 8 eyes; paths, crops and upload groups passed.');

console.log(sql===null?'V069: SQL file omitted from deployment; run migration separately in Supabase.':'V069: local SQL registration checks passed.');
