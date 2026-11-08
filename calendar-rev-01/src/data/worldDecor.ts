import {INTERIOR_ITEMS} from './roomSkins';
import type {WorldItem} from '../types/world';
import {withWindowItems} from './windows';
import {GARDEN_ITEMS} from './gardens';
import {FURNISHINGS_01} from './furnishings01';
export const FURNISHING_ITEMS:WorldItem[]=FURNISHINGS_01.map(i=>({id:i.id,name:i.name,type:i.kind==='furniture'?'furniture':'props',price:i.price,category:i.kind==='furniture'?'가구':'소품',subcategory:i.group,image:i.image,image_url:i.image,placement_type:'room',min_scale:.35,max_scale:1.2,default_z_index:i.anchor==='rug'?4:i.anchor==='wall'?10:20,description:i.anchor==='wall'?'벽에 걸어 위치와 크기를 조절하는 장식':i.anchor==='rug'?'가구 아래에 깔아 꾸미는 러그':'위치·크기·앞뒤 순서를 조절할 수 있는 실내 품목'}));
export const withDecorCatalog=(items:WorldItem[])=>withWindowItems([...new Map([...GARDEN_ITEMS,...FURNISHING_ITEMS,...INTERIOR_ITEMS,...items].map(i=>[i.id,i])).values()].filter(i=>!['christmas-room','special-garden'].includes(i.id)));
