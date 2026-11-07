import {readFileSync,readdirSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const catalog=JSON.parse(readFileSync(resolve(root,'src/data/pet-battle-catalog.json'),'utf8'));
const schema=readFileSync(resolve(root,'supabase/062_01_battle_schema.sql'),'utf8');
assert.deepEqual(JSON.parse(schema.match(/strong jsonb:='([^']+)'/)[1]),catalog.strong);
const pets=catalog.pets,skills=new Map(catalog.skills.map(s=>[s.id,s]));
assert.equal(pets.length,100);assert.equal(new Set(pets.map(p=>p.id)).size,100);assert.equal(catalog.species.length,50);
assert.deepEqual(pets.filter(p=>p.total===600).map(p=>p.id).sort(),['dragon-adult','griffin-adult','phoenix-adult','whale-adult']);
for(const species of catalog.species)assert.deepEqual(pets.filter(p=>p.species===species.id).map(p=>p.age).sort(),['adult','baby']);
const manifest=JSON.parse(readFileSync(resolve(root,'public/world/pet-art-manifest-v062.json'),'utf8'));
const specialText=readFileSync(resolve(root,'src/data/companionSpecialForms.ts'),'utf8');
const marker='export const COMPANION_SPECIAL_FORMS:Record<string,CompanionSpecialArt>=';const start=specialText.indexOf(marker)+marker.length;
const special=JSON.parse(specialText.slice(start,specialText.indexOf(';',start)));
for(const p of pets){
 assert.equal(Object.values(p.stats).reduce((a,b)=>a+b,0),p.total,p.id);assert.ok(p.total<=600&&p.total>=400,p.id);
 assert.ok(Object.values(p.stats).every(v=>Number.isInteger(v)&&v>0),p.id);
 assert.equal(p.skills.length,4);assert.equal(new Set(p.skills).size,4);
 for(const id of p.skills)assert.ok(skills.has(id),`${p.id}: ${id}`);
 assert.ok(manifest[p.id]);assert.ok(special[p.spriteKey],`Affinity art missing: ${p.id}`);
 assert.ok(statSync(resolve(root,'public',manifest[p.id].image.slice(1))).size<25*1024*1024);
 if(!p.existing){assert.equal(manifest[p.id].image,p.image);assert.ok(p.price%100===0);assert.equal(special[p.spriteKey].palette,p.specialPalette);}
}
const sqlPets=new Map(),sqlSkills=new Map();
const files=readdirSync(resolve(root,'supabase')).filter(n=>/^062_.*\.sql$/.test(n)).sort();
assert.equal(files.length,18);
for(const f of files){
 const text=readFileSync(resolve(root,'supabase',f),'utf8');assert.ok(Buffer.byteLength(text)<16000,`Split SQL file further: ${f}`);
 for(const m of text.matchAll(/\('([^']+)','((?:[^']|'')+)'::jsonb\)/g)){
  const d=JSON.parse(m[2].replaceAll("''","'"));if(d.stats)sqlPets.set(m[1],d);else if(d.category)sqlSkills.set(m[1],d);
 }
}
assert.equal(sqlPets.size,100);assert.equal(sqlSkills.size,catalog.skills.length);
for(const p of pets)assert.deepEqual(sqlPets.get(p.id),p);
for(const s of catalog.skills)assert.deepEqual(sqlSkills.get(s.id),s);
console.log(`Pet battle checks passed: 50 species / 100 forms, exactly four 600s, ${skills.size} skills, all regular/affinity art, 18 bounded SQL files in sync.`);
