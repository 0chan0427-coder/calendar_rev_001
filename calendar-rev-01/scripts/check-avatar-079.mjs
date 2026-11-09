import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const colors=read('src/data/avatarColors079.ts'),eyes=read('src/lib/avatarAnimeEyes079.ts');
for(const kind of ['hair','eyes']){const block=colors.match(new RegExp(`const ${kind}=(\\[.*?\\]);`,'s'))?.[1];assert(block,kind+' colors missing');assert.equal((block.match(/\['[^']+'/g)||[]).length,16,kind+' palette must contain 16 colors');}
const ids=[...eyes.matchAll(/id:'(eyes079-[^']+)'/g)].map(m=>m[1]);assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);
const source=read('src/data/collection077.ts'),items=JSON.parse(source.slice(source.indexOf('=')+1,source.lastIndexOf(';'))),hime=items.find(x=>x.id==='hair077-06');assert.equal(hime.image,'/world/hair-079/hime.png');const png=readFileSync(new URL('public'+hime.image,root));assert.equal(png.readUInt32BE(16),hime.width);assert.equal(png.readUInt32BE(20),hime.height);assert(readdirSync(new URL('public/world/hair-079',root)).filter(x=>x.endsWith('.png')).length<=20);
const migration='supabase/079_avatar_presets_colors_eyes.sql';if(existsSync(new URL(migration,root))){const sql=read(migration);for(const id of ids)assert(sql.includes(id));assert(sql.includes('enable row level security'));assert(sql.includes('item not owned'));assert(!/truncate|delete from public\./i.test(sql));}
console.log('V079: 6 anime eyes, 16 hair / 16 iris colors, repaired hime art; catalog and optional SQL checked.');
