import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),read=p=>readFileSync(resolve(root,p),'utf8');
const s=read('src/data/collection077.ts'),items=JSON.parse(s.slice(s.indexOf('=')+1,s.lastIndexOf(';')));
const fit=read('src/lib/outerFits077.ts'),fits=JSON.parse(fit.slice(fit.indexOf('={')+1,fit.lastIndexOf(';')));
const fail=m=>{throw Error('V077: '+m)},ids=new Set();
for(const i of items){
 if(ids.has(i.id))fail('Duplicate '+i.id);ids.add(i.id);
 const png=readFileSync(resolve(root,'public'+i.image));
 if(png.readUInt32BE(16)!==i.width||png.readUInt32BE(20)!==i.height)fail('Source dimensions '+i.id);
 if(!i.crop.every(Number.isFinite)||i.crop[2]<=0||i.crop[3]<=0||!i.box.every(Number.isFinite))fail('Placement '+i.id);
 if(i.slot==='hair'&&!i.hairLayers?.backPath)fail('Rear layer missing '+i.id);
 if(i.slot==='outer'){
  const f=fits[i.id];if(!f||!f.innerTopClip||!f.backPath||!f.sleeveJoinX)fail('Garment registration '+i.id);
  if(2*(f.center-f.shoulder[0])*f.scaleX<260)fail('Shoulders too narrow '+i.id);
  if(Math.hypot(f.targetCuff[0]-244,f.targetCuff[1]-962)>12)fail('Cuff anchor '+i.id);
 }
}
for(const [folder,count]of [['hair-077',20],['outer-077',10],['makeup-077',8],['skin-077',10]]){
 const images=readdirSync(resolve(root,'public/world',folder)).filter(x=>x.endsWith('.png'));if(images.length!==count||images.length>20)fail('Upload group '+folder);
 for(const name of images)if(readFileSync(resolve(root,'public/world',folder,name)).length>=25*1024*1024)fail('Image exceeds upload limit '+name);
}
if(existsSync(resolve(root,'supabase/077_avatar_style_expansion.sql'))){const sql=read('supabase/077_avatar_style_expansion.sql');if((sql.match(/'avatar'/g)||[]).length!==48||/delete from|truncate /i.test(sql))fail('Catalog migration');}
console.log('V077: 20 hair + 8 makeup + 10 skin + 10 outer; sources, fitting landmarks, upload folders and SQL registration checked.');
