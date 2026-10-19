import type {WorldItem} from '../types/world';
/** Adult IDs are separate purchases; old IDs keep their original ownership and become baby items. */
export const ADULT_COMPANIONS:WorldItem[]=[
 {id:'adult-cat-white',name:'하얀 고양이',type:'animal',image:'/world/companions-v5/adult-cat-ivory.png',price:2500},
 {id:'adult-cat-ribbon',name:'빨간 리본 고양이',type:'animal',image:'/world/companions-v5/adult-cat-ivory.png',price:3500},
 {id:'adult-dog-brown',name:'갈색 강아지',type:'animal',image:'/world/companions-v5/adult-dog.png',price:3000},
 {id:'adult-dog-sunglasses',name:'선글라스 강아지',type:'animal',image:'/world/companions-v5/adult-dog.png',price:4000},
 {id:'adult-rabbit',name:'토끼',type:'animal',image:'/world/companions-v5/adult-rabbit.png',price:2500},
 {id:'adult-panda',name:'판다',type:'animal',image:'/world/companions-v5/adult-panda.png',price:5000},
 {id:'adult-fox',name:'여우',type:'animal',image:'/world/companions-v5/adult-fox.png',price:4000},
 {id:'adult-tiger',name:'호랑이',type:'animal',image:'/world/companions-v5/adult-tiger.png',price:8000},
 {id:'adult-elephant',name:'코끼리',type:'animal',image:'/world/companions-v5/adult-elephant.png',price:9000},
 {id:'adult-crocodile',name:'악어',type:'animal',image:'/world/companions-v5/adult-crocodile.png',price:7000},
 {id:'adult-eagle',name:'독수리',type:'animal',image:'/world/companions-v5/adult-eagle.png',price:6000},
 {id:'adult-whale',name:'고래',type:'animal',image:'/world/companions-v5/adult-whale.png',price:12000},
 {id:'adult-dragon-red',name:'붉은 용',type:'animal',image:'/world/companions-v5/adult-dragon-red.png',price:12000},
 {id:'adult-dragon-gold',name:'황금 용',type:'animal',image:'/world/companions-v5/adult-dragon-gold.png',price:15000},
 {id:'adult-unicorn',name:'유니콘',type:'animal',image:'/world/companions-v5/adult-unicorn.png',price:10000},
].map(i=>({...i,category:'동물',subcategory:'성체',placement_type:'none',image_url:i.image,description:'성체 체형으로 새로 제작한 동물'}));
export const BABY_COMPANION_IDS=['cat-white','cat-ribbon','dog-brown','dog-sunglasses','rabbit','panda','fox','tiger','elephant','crocodile','eagle','whale','dragon-red','dragon-gold','unicorn','dragon-blue','dragon-green','dragon-black','dragon-glowing','dragon-crown','dragon-baby'];
export function normalizeCompanionAge<T extends WorldItem>(item:T):T{
 if(item.type!=='animal'||!BABY_COMPANION_IDS.includes(item.id))return item;
 return {...item,name:/^아기\s*/.test(item.name)?item.name:`아기 ${item.name}`,subcategory:'아기'};
}
