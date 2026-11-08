import type {WorldItem} from '../types/world';
import {GARDEN_THEME_ART} from './gardenThemeArt';
export const BASIC_GARDEN='garden-basic';
export const gardenTheme=(id?:string)=>GARDEN_THEME_ART.find(t=>t.id===id);
export const isGardenTheme=(id:string)=>id===BASIC_GARDEN||Boolean(gardenTheme(id));
export const GARDEN_ITEMS:WorldItem[]=[{id:BASIC_GARDEN,name:'기본 잔디 정원',type:'theme',category:'정원 테마',price:0,image:'/world/window-views/garden-day.png',placement_type:'none',description:'기존의 계절·시간에 맞춘 기본 잔디 정원'},...GARDEN_THEME_ART.map(t=>({id:t.id,name:t.name,type:'theme',category:'정원 테마',subcategory:'전체 공간',price:t.price,image:t.image,image_url:t.image,placement_type:'none',description:'정원 전체 공간을 변경합니다. 기본 창문 풍경을 선택하면 같은 테마가 연동됩니다.'}))];
export function gardenPosition(id:string|undefined,p:{x:number;y:number},kind:'pet'|'item'='pet'){
 const b=gardenTheme(id)?.bounds;if(!b)return p;
 return {x:Math.max(b[0],Math.min(b[1],p.x)),y:Math.max(b[2],Math.min(kind==='item'?Math.min(92,b[3]):b[3],p.y))};
}
