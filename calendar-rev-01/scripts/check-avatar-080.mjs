import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),read=p=>readFileSync(resolve(root,p),'utf8');
const eyes=read('src/data/eyes080.ts'),mouth=read('src/data/avatarMouth080.ts');
for(const key of ['clear','cat','heroine','almond','soft','doll']){
 const p=resolve(root,`public/world/eyes-080/${key}.png`);if(!existsSync(p))throw Error(`Missing painted eye asset: ${key}`);
 const b=readFileSync(p);if(b.toString('hex',0,8)!=='89504e470d0a1a0a'||b[25]!==6)throw Error(`Invalid RGBA eye asset: ${key}`);
 if(!eyes.includes(`eyes079-${key}`))throw Error(`Missing eye fit: ${key}`);
}
if(readdirSync(resolve(root,'public/world/eyes-080')).length>20)throw Error('Image upload folder exceeds 20 files');
if((mouth.match(/id:'mouth080-/g)||[]).length!==5||(mouth.match(/id:'lipcolor080-/g)||[]).length!==5)throw Error('Expected 5 mouths and 5 lip colors');
const sql=resolve(root,'supabase/080_painted_eyes_mouths.sql');if(existsSync(sql)){const text=readFileSync(sql,'utf8');for(const id of [...mouth.matchAll(/id:'([^']+)'/g)].map(m=>m[1]))if(!text.includes(`'${id}'`))throw Error(`Missing SQL catalog entry: ${id}`);}
console.log('V080 checks passed: 6 painted eye pairs; 5 mouth shapes; 5 lip colors.');
