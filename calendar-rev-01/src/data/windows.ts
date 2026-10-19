import type {WorldItem} from '../types/world';
export const WINDOW_SCENERY=[
 ['view-garden','내 정원 · 시간에 맞추기','garden-day',0,'기본'],
 ['view-city','강변 도시 야경','city-night',3000,'도시'],
 ['view-ocean','햇살 드는 바다','ocean',3000,'자연'],
 ['view-snow','눈 내리는 숲','snow-forest',3000,'자연'],
 ['view-sakura','벚꽃 골목 · 일본','sakura-japan',4000,'여행'],
 ['view-santorini','푸른 지붕 · 산토리니','santorini',4000,'여행'],
 ['view-magic','별빛 마법도시','magic-city',5000,'판타지'],
 ['view-future','네온 미래도시','future-city',5000,'미래'],
 ['view-space','우주에서 바라본 지구','space',5000,'우주'],
].map(([id,name,key,price,theme])=>({id:String(id),name:String(name),key:String(key),price:Number(price),theme:String(theme),image:`/world/window-views/${key}.png`}));
export const WINDOW_ITEMS:WorldItem[]=[{id:'window-oak',name:'기본 원목 창문',type:'props',category:'창문',subcategory:'프레임',price:0,image:'/world/window-views/window-oak.png',placement_type:'none'},...WINDOW_SCENERY.map(v=>({...v,type:'theme',category:'창밖 풍경',subcategory:v.theme,description:v.price===0?'시간에 따라 낮·노을·밤으로 바뀌는 잔디밭':'한 번 구매하면 계속 사용할 수 있는 창밖 풍경',placement_type:'none'}))];
export const isWindowFrame=(item:Pick<WorldItem,'id'|'category'|'subcategory'>)=>item.id==='window-oak'||item.category==='창문'&&item.subcategory!=='풍경';
export function sceneryImage(id:string|undefined,date=new Date()){
 const v=WINDOW_SCENERY.find(v=>v.id===id)||WINDOW_SCENERY[0];
 if(v.id!=='view-garden')return v.image;
 const h=date.getHours();return `/world/window-views/garden-${h<7||h>=20?'night':h>=17?'evening':'day'}.png`;
}
export function withWindowItems(items:WorldItem[]){return [...new Map([...WINDOW_ITEMS,...items].map(i=>[i.id,i])).values()];}
