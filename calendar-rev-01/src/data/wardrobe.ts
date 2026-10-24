import {COLLECTION_01} from './collection01';
export type WearSlot='hair'|'face'|'skin'|'makeup'|'glasses'|'hat'|'outer'|'top'|'bottom'|'shoes'|'accessory'|'special'|'coat';
export type Equipment=Partial<Record<WearSlot,string>>;
export interface Wearable {id:string;name:string;target:'avatar'|'cat'|'companion';slot:WearSlot;species?:string;price:number;mode:'image'|'tint'|'base'|'feature';image?:string;color?:string;region?:[number,number,number,number];z?:number;renderKey?:string;hidden?:boolean;}
export const WEAR_SLOTS:[WearSlot,string][]=[['hair','헤어'],['hat','모자'],['top','상의'],['outer','겉옷'],['bottom','하의'],['shoes','신발'],['face','눈'],['skin','피부'],['makeup','메이크업'],['glasses','안경'],['accessory','장식']];
const art='/world/avatar-v3';
export const WEARABLES:Wearable[]=[
 ...COLLECTION_01.map((item):Wearable=>({id:item.id,name:item.name,target:'avatar',slot:item.slot,price:item.price,mode:'image',image:item.image})),
 {id:'outer-none',name:'겉옷 해제',target:'avatar',slot:'outer',price:0,mode:'base'},
 {id:'hat-none',name:'모자 해제',target:'avatar',slot:'hat',price:0,mode:'base'},
 {id:'hair-chestnut',name:'기본 헤어',target:'avatar',slot:'hair',price:0,mode:'image',image:`${art}/hair-short.png`,renderKey:'hair-short'},
 {id:'hair-none',name:'헤어 해제 · 기본 몸체',target:'avatar',slot:'hair',price:0,mode:'base'},
 {id:'hair-short-chestnut',name:'밤색 숏컷',target:'avatar',slot:'hair',price:0,mode:'image',image:`${art}/hair-short.png`,renderKey:'hair-short'},
 {id:'hair-bob-brown',name:'브라운 단발',target:'avatar',slot:'hair',price:0,mode:'image',image:`${art}/hair-bob.png`,renderKey:'hair-bob'},
 {id:'top-base',name:'기본 민소매',target:'avatar',slot:'top',price:0,mode:'base'},
 {id:'top-mint',name:'블루 반팔 셔츠',target:'avatar',slot:'top',price:0,mode:'image',image:`${art}/shirt-blue.png`,renderKey:'shirt-blue'},
 {id:'top-shirt-blue',hidden:true,name:'블루 반팔 셔츠',target:'avatar',slot:'top',price:1500,mode:'image',image:`${art}/shirt-blue.png`,renderKey:'shirt-blue'},
 {id:'top-pink',name:'피치 맨투맨',target:'avatar',slot:'top',price:1500,mode:'image',image:`${art}/sweater-peach.png`,renderKey:'sweater-peach'},
 {id:'bottom-base',name:'기본 속바지',target:'avatar',slot:'bottom',price:0,mode:'base'},
 {id:'bottom-shorts-cream',name:'크림 반바지',target:'avatar',slot:'bottom',price:0,mode:'image',image:`${art}/shorts-cream.png`,renderKey:'shorts-cream'},
 {id:'bottom-trousers',name:'차콜 긴바지',target:'avatar',slot:'bottom',price:2000,mode:'image',image:`${art}/trousers-charcoal.png`,renderKey:'trousers-charcoal'},
 {id:'shoes-none',name:'맨발',target:'avatar',slot:'shoes',price:0,mode:'base'},
 {id:'shoes-cream',name:'화이트 스니커즈',target:'avatar',slot:'shoes',price:0,mode:'image',image:`${art}/sneakers-white.png`,renderKey:'sneakers-white'},
 {id:'shoes-boots',name:'브라운 앵클부츠',target:'avatar',slot:'shoes',price:1500,mode:'image',image:`${art}/boots-brown.png`,renderKey:'boots-brown'},
 {id:'eyes-default',name:'기본 브라운 눈',target:'avatar',slot:'face',price:0,mode:'feature'},
 {id:'eyes-smile',name:'웃는 눈',target:'avatar',slot:'face',price:0,mode:'feature'},
 {id:'skin-default',name:'기본 피부',target:'avatar',slot:'skin',price:0,mode:'feature'},
 {id:'skin-warm',name:'따뜻한 피부',target:'avatar',slot:'skin',price:0,mode:'feature'},
 {id:'makeup-none',name:'메이크업 해제',target:'avatar',slot:'makeup',price:0,mode:'base'},
 {id:'makeup-blush',name:'은은한 볼터치',target:'avatar',slot:'makeup',price:0,mode:'feature'},
 {id:'makeup-rose',name:'로즈 볼터치',target:'avatar',slot:'makeup',price:500,mode:'feature'},
 {id:'makeup-peach',name:'살구빛 볼터치',target:'avatar',slot:'makeup',price:500,mode:'feature'},
 {id:'makeup-freckles',name:'살구 주근깨 메이크업',target:'avatar',slot:'makeup',price:700,mode:'feature'},
 {id:'makeup-mauve',name:'모브 아이 메이크업',target:'avatar',slot:'makeup',price:800,mode:'feature'},
 {id:'glasses-olive',name:'올리브 라운드 사각 안경',target:'avatar',slot:'glasses',price:1000,mode:'feature'},
 {id:'glasses-rose',name:'로즈골드 타원 안경',target:'avatar',slot:'glasses',price:1000,mode:'feature'},
 {id:'glasses-none',name:'안경 해제',target:'avatar',slot:'glasses',price:0,mode:'base'},
 {id:'glasses-round',name:'브라운 라운드 안경',target:'avatar',slot:'glasses',price:0,mode:'feature'},
 {id:'glasses-gold',name:'골드 라운드 안경',target:'avatar',slot:'glasses',price:1000,mode:'feature'},
 {id:'ribbon-avatar',name:'빨간 헤어 리본',target:'avatar',slot:'accessory',price:1000,mode:'image',image:'/world/wearables/shared/ribbon-red.png'},
 {id:'sunglasses-dog',name:'강아지 선글라스',target:'companion',species:'dog',slot:'glasses',price:1000,mode:'feature'},
 {id:'cat-ivory',name:'아이보리 고양이',target:'cat',slot:'coat',price:0,mode:'tint',color:'#fff4e4'},
 {id:'cat-cheese',name:'치즈색 고양이',target:'cat',slot:'coat',price:1500,mode:'tint',color:'#e9b56f'},
 {id:'cat-gray',name:'회색 고양이',target:'cat',slot:'coat',price:1500,mode:'tint',color:'#9b9ba8'},
 {id:'ribbon-cat',name:'고양이 빨간 리본',target:'cat',slot:'accessory',price:500,mode:'image',image:'/world/wearables/shared/ribbon-red.png',region:[30,59,40,18],z:35},
];
export const AVATAR_DEFAULTS:Equipment={hair:'hair-chestnut',hat:'hat-none',outer:'outer-none',top:'top-base',bottom:'bottom-base',shoes:'shoes-none',face:'eyes-default',skin:'skin-default',makeup:'makeup-blush',glasses:'glasses-none'};
export function normalizeAvatarEquipment(equipment:Equipment={}):Equipment{return {...AVATAR_DEFAULTS,...Object.fromEntries(Object.entries(equipment).filter(([slot,id])=>WEARABLES.some(i=>i.target==='avatar'&&i.slot===slot&&i.id===id)))};}
export const selectedWearables=(equipment:Equipment={},target:'avatar'|'cat'|'companion')=>{const merged=target==='avatar'?normalizeAvatarEquipment(equipment):equipment;return WEARABLES.filter(i=>i.target===target&&merged[i.slot]===i.id);};
export const isCat=(id:string)=>/cat|고양/i.test(id);

export const companionFamily=(id:string)=>id.replace(/^adult-/,'').split('-')[0];
export const companionWearTarget=(id:string):'cat'|'companion'|undefined=>isCat(id)?'cat':WEARABLES.some(i=>i.target==='companion'&&i.species===companionFamily(id))?'companion':undefined;
