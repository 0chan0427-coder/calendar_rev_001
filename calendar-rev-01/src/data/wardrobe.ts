export type WearSlot = 'hair'|'face'|'makeup'|'hat'|'top'|'bottom'|'shoes'|'accessory'|'special'|'coat';
export type Equipment = Partial<Record<WearSlot,string>>;
export interface Wearable {
 id:string;name:string;target:'avatar'|'cat';slot:WearSlot;price:number;
 mode:'image';image:string;backImage?:string;
 imageByGender?:Partial<Record<'male'|'female',string>>;
 backImageByGender?:Partial<Record<'male'|'female',string>>;
 z?:number;
}
export const WEAR_SLOTS:[WearSlot,string][]=[['hair','헤어'],['top','상의'],['bottom','하의'],['shoes','신발'],['accessory','액세서리']];
const art='/world/avatar-v2';
const cats='/world/companions-v2';
// Legacy V030 IDs retain their purchase entitlements, now backed by real artwork.
export const WEARABLES:Wearable[]=[
 {id:'hair-chestnut',name:'기본 헤어',target:'avatar',slot:'hair',price:0,mode:'image',image:`${art}/hair/short-chestnut-front.svg`,backImage:`${art}/hair/short-chestnut-back.svg`,imageByGender:{female:`${art}/hair/bob-brown-front.svg`},backImageByGender:{female:`${art}/hair/bob-brown-back.svg`}},
 {id:'hair-short-chestnut',name:'밤색 숏컷',target:'avatar',slot:'hair',price:0,mode:'image',image:`${art}/hair/short-chestnut-front.svg`,backImage:`${art}/hair/short-chestnut-back.svg`},
 {id:'hair-bob-brown',name:'브라운 단발',target:'avatar',slot:'hair',price:0,mode:'image',image:`${art}/hair/bob-brown-front.svg`,backImage:`${art}/hair/bob-brown-back.svg`},
 {id:'hair-black',name:'블랙 사이드 파트',target:'avatar',slot:'hair',price:1500,mode:'image',image:`${art}/hair/sidepart-black-front.svg`,backImage:`${art}/hair/sidepart-black-back.svg`},
 {id:'hair-rose',name:'로즈 단발',target:'avatar',slot:'hair',price:2000,mode:'image',image:`${art}/hair/bob-rose-front.svg`,backImage:`${art}/hair/bob-rose-back.svg`},
 {id:'hair-long-dark',name:'다크브라운 긴 머리',target:'avatar',slot:'hair',price:2500,mode:'image',image:`${art}/hair/long-dark-front.svg`,backImage:`${art}/hair/long-dark-back.svg`},
 {id:'top-tee-ivory',name:'아이보리 반팔 티',target:'avatar',slot:'top',price:0,mode:'image',image:`${art}/tops/tee-ivory.svg`},
 {id:'top-mint',name:'민트 가디건',target:'avatar',slot:'top',price:0,mode:'image',image:`${art}/tops/cardigan-mint.svg`},
 {id:'top-shirt-blue',name:'블루 반팔 셔츠',target:'avatar',slot:'top',price:1500,mode:'image',image:`${art}/tops/shirt-blue.svg`},
 {id:'top-pink',name:'피치 맨투맨',target:'avatar',slot:'top',price:1500,mode:'image',image:`${art}/tops/sweatshirt-peach.svg`},
 {id:'bottom-shorts-cream',name:'크림 반바지',target:'avatar',slot:'bottom',price:0,mode:'image',image:`${art}/bottoms/shorts-cream.svg`},
 {id:'bottom-mint',name:'세이지 반바지',target:'avatar',slot:'bottom',price:0,mode:'image',image:`${art}/bottoms/shorts-sage.svg`},
 {id:'bottom-trousers',name:'차콜 긴바지',target:'avatar',slot:'bottom',price:2000,mode:'image',image:`${art}/bottoms/trousers-charcoal.svg`},
 {id:'bottom-jeans',name:'롤업 청바지',target:'avatar',slot:'bottom',price:2000,mode:'image',image:`${art}/bottoms/jeans-blue.svg`},
 {id:'bottom-skirt-sage',name:'세이지 스커트',target:'avatar',slot:'bottom',price:1500,mode:'image',image:`${art}/bottoms/skirt-sage.svg`},
 {id:'bottom-pink',name:'피치 스커트',target:'avatar',slot:'bottom',price:1500,mode:'image',image:`${art}/bottoms/skirt-peach.svg`},
 {id:'shoes-cream',name:'크림 스니커즈',target:'avatar',slot:'shoes',price:0,mode:'image',image:`${art}/shoes/sneakers-white.svg`},
 {id:'shoes-boots',name:'브라운 앵클부츠',target:'avatar',slot:'shoes',price:1500,mode:'image',image:`${art}/shoes/boots-brown.svg`},
 {id:'shoes-maryjane',name:'코코아 메리제인',target:'avatar',slot:'shoes',price:1000,mode:'image',image:`${art}/shoes/maryjane-cocoa.svg`},
 {id:'ribbon-avatar',name:'코랄 헤어 리본',target:'avatar',slot:'accessory',price:1000,mode:'image',image:`${art}/accessories/ribbon-coral.svg`},
 {id:'cat-ivory',name:'아이보리 고양이',target:'cat',slot:'coat',price:0,mode:'image',image:`${cats}/cat-ivory.svg`},
 {id:'cat-cheese',name:'치즈 태비 고양이',target:'cat',slot:'coat',price:1500,mode:'image',image:`${cats}/cat-cheese.svg`},
 {id:'cat-gray',name:'회색 고양이',target:'cat',slot:'coat',price:1500,mode:'image',image:`${cats}/cat-gray.svg`},
 {id:'cat-tuxedo',name:'턱시도 고양이',target:'cat',slot:'coat',price:2000,mode:'image',image:`${cats}/cat-tuxedo.svg`},
 {id:'ribbon-cat',name:'고양이 코랄 리본',target:'cat',slot:'accessory',price:500,mode:'image',image:`${cats}/cat-ribbon.svg`},
];
export const AVATAR_DEFAULTS:Equipment={hair:'hair-chestnut',top:'top-tee-ivory',bottom:'bottom-shorts-cream',shoes:'shoes-cream'};
export function selectedWearables(equipment:Equipment={},target:'avatar'|'cat'){
 const merged=target==='avatar'?{...AVATAR_DEFAULTS,...equipment}:equipment;
 return WEARABLES.filter(i=>i.target===target&&merged[i.slot]===i.id);
}
export const isCat=(id:string)=>/cat|고양/i.test(id);
