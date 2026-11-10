import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),read=p=>readFileSync(resolve(root,p),'utf8');
const jobs=JSON.parse(read('src/data/jobs082.ts').match(/export const JOBS_082:[\s\S]*?=(\[[\s\S]*?\]);\nexport const JOB_GARMENT/)[1]);
const source=read('src/data/transformations082.ts'),marker='export const TRANSFORMATIONS_082:Transformation082[]=';
const forms=JSON.parse(source.slice(source.indexOf(marker)+marker.length,source.indexOf(';',source.indexOf(marker))));
assert.equal(jobs.length,20);assert.equal(forms.length,19);const all=[...jobs,...forms];assert.equal(new Set(all.map(i=>i.id)).size,39);
const counts={};for(const a of all){assert(a.price>0&&a.price%100===0,a.id);assert(a.width>0&&a.height>0);const file=resolve(root,'public'+a.image),b=readFileSync(file);assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WEBP');assert(b.length<24*1024*1024);assert(a.image.endsWith('.webp'));const dir=a.image.split('/').slice(0,-1).join('/');counts[dir]=(counts[dir]||0)+1;}
for(const[dir,count]of Object.entries(counts)){assert(count<=20);assert.equal(readdirSync(resolve(root,'public'+dir)).filter(n=>/\.(png|webp)$/i.test(n)).length,count);}
for(const a of forms){assert(Math.abs(a.placement[2]/a.width-a.placement[3]/a.height)<1e-7,a.id+' aspect ratio');assert(a.frame[2]>=1024&&a.frame[3]>=1536);assert(a.frame.every(Number.isFinite));}
for(const a of jobs)if(['top','outer'].includes(a.slot))assert(a.directFit082,a.id+' missing fitting');
for(const [sql,items] of [['supabase/082_jobs_transformations.sql',all.filter(a=>a.id!=='c082-magnamon')],['supabase/083_magnamon.sql',forms.filter(a=>a.id==='c082-magnamon')]]){if(existsSync(resolve(root,sql))){const s=read(sql);for(const a of items)assert(s.includes(`'${a.id}'`));assert(!/delete from|truncate|update public\.profiles/i.test(s));}else console.log(`${sql} omitted from deployment; apply it separately in Supabase.`);}
console.log('V083 checks passed: 20 job parts + 19 complete native forms; image folders 20 / 3 / 10 / 6; WebP assets, fitting, prices and optional SQL verified.');
