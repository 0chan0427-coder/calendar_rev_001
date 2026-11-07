import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'src/data/pet-battle-catalog.json'),'utf8'));
const sql=s=>"'"+s.replaceAll("'","''")+"'";
for(let offset=0;offset<catalog.pets.length;offset+=10){
 const num=String(4+offset/10).padStart(2,'0');const rows=catalog.pets.slice(offset,offset+10);
 let text='-- V062. Run numbered files in order. Safe to rerun.\nbegin;\n';
 text+='insert into public.pet_battle_catalog(id,data) values\n'+rows.map(p=>`(${sql(p.id)},${sql(JSON.stringify(p))}::jsonb)`).join(',\n')+'\non conflict(id)do update set data=excluded.data;\n';
 const added=rows.filter(p=>!p.existing);
 if(added.length){
  text+='insert into public.world_item_catalog(item_id,item_name,item_type,price,category,subcategory,description,image_url,placement_type,is_active,sort_order) values\n'+added.map(p=>`(${sql(p.itemId)},${sql(p.name)},'animal',${p.price},'동물',${sql(p.age==='adult'?'성체':'아기')},${sql(p.types.join('·')+' · '+p.role)},${sql(p.image)},'none',true,${1000+catalog.pets.indexOf(p)})`).join(',\n')+'\non conflict(item_id)do update set item_name=excluded.item_name,image_url=excluded.image_url,category=excluded.category,subcategory=excluded.subcategory,description=excluded.description,is_active=true,sort_order=excluded.sort_order;\n';
  text+='insert into public.world_companion_special_catalog(sprite_key,image_path,is_ready)values\n'+added.map(p=>`(${sql(p.spriteKey)},${sql(p.image)},true)`).join(',\n')+'\non conflict(sprite_key)do update set image_path=excluded.image_path,is_ready=true;\n';
 }
 text+='commit;\n';fs.writeFileSync(path.join(root,`supabase/062_${num}_pet_catalog_${String(offset/10+1).padStart(2,'0')}.sql`),text);
}
for(let offset=0;offset<catalog.skills.length;offset+=30){
 const index=Math.floor(offset/30);const text='-- V062 skill catalog. Safe to rerun.\nbegin;\ninsert into public.pet_battle_skills(id,data)values\n'+catalog.skills.slice(offset,offset+30).map(s=>`(${sql(s.id)},${sql(JSON.stringify(s))}::jsonb)`).join(',\n')+'\non conflict(id)do update set data=excluded.data;\ncommit;\n';
 fs.writeFileSync(path.join(root,`supabase/062_${String(14+index).padStart(2,'0')}_battle_skills_${String(index+1).padStart(2,'0')}.sql`),text);
}
const columns=['동물','성장 단계','속성','역할','특성','특성 효과','HP','공격','방어','속도','특수공격','특수방어','합계','스킬 1','스킬 2','스킬 3','스킬 4','종 ID','상품 ID','이미지'];
const skills=Object.fromEntries(catalog.skills.map(s=>[s.id,s.name]));const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
const rows=catalog.pets.map(p=>[p.name,p.age==='adult'?'성체':'아기',p.types.join('/'),p.role,p.ability.name,p.ability.description,...['hp','atk','def','spe','spa','spd'].map(k=>p.stats[k]),p.total,...p.skills.map(s=>skills[s]),p.id,p.itemId,p.image||'기존 이미지']);
fs.writeFileSync(path.join(root,'docs/pet-roster-100-v062.csv'),'\ufeff'+[columns,...rows].map(r=>r.map(quote).join(',')).join('\r\n'));
console.log('Wrote ten pet catalog + five skill catalog migrations and the 100-form CSV.');
