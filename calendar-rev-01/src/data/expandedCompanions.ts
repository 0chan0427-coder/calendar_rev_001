import {BATTLE_PETS} from './petRoster';
import type {WorldItem} from '../types/world';
export const EXPANDED_COMPANIONS:WorldItem[]=BATTLE_PETS.filter(p=>!p.existing).map(p=>({
 id:p.itemId,name:p.name,type:'animal',image:p.image!,image_url:p.image,price:p.price!,category:'동물',subcategory:p.age==='adult'?'성체':'아기',placement_type:'none',
 description:`${p.types.join('·')} · ${p.role} · 종족값 ${p.total}`,
}));
export function withExpandedCompanions(items:WorldItem[]){
 const result=new Map(items.map(i=>[i.id,i]));for(const item of EXPANDED_COMPANIONS)if(!result.has(item.id))result.set(item.id,item);return [...result.values()];
}
