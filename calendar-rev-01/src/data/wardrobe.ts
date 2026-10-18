export type WearSlot = 'hair'|'face'|'makeup'|'hat'|'top'|'bottom'|'shoes'|'accessory'|'special'|'coat';
export type Equipment = Partial<Record<WearSlot,string>>;
export interface Wearable {
  id:string; name:string; target:'avatar'|'cat'; slot:WearSlot; price:number;
  mode:'tint'|'image'; color?:string; image?:string;
  imageByGender?:Partial<Record<'male'|'female',string>>;
  regionByGender?:Partial<Record<'male'|'female',[number,number,number,number]>>;
  region?:[number,number,number,number]; z?:number;
}
export const WEAR_SLOTS: [WearSlot,string][] = [['hair','헤어'],['face','얼굴·피부'],['makeup','메이크업'],['hat','모자'],['top','상의'],['bottom','하의'],['shoes','신발'],['accessory','액세서리'],['special','날개·오라']];
// Source PNGs stay untouched. Tints reuse their exact silhouette and details.
export const WEARABLES:Wearable[] = [
 {id:'hair-chestnut',name:'밤색 헤어',target:'avatar',slot:'hair',price:0,mode:'tint',color:'#82543c'},
 {id:'hair-black',name:'흑갈색 헤어',target:'avatar',slot:'hair',price:1500,mode:'tint',color:'#342b32'},
 {id:'hair-rose',name:'로즈브라운 헤어',target:'avatar',slot:'hair',price:2000,mode:'tint',color:'#a97179'},
 {id:'top-mint',name:'민트 잠옷 상의',target:'avatar',slot:'top',price:0,mode:'tint',color:'#66bca9'},
 {id:'top-pink',name:'분홍 잠옷 상의',target:'avatar',slot:'top',price:1500,mode:'tint',color:'#e799b7'},
 {id:'bottom-mint',name:'민트 잠옷 하의',target:'avatar',slot:'bottom',price:0,mode:'tint',color:'#66bca9'},
 {id:'bottom-pink',name:'분홍 잠옷 하의',target:'avatar',slot:'bottom',price:1500,mode:'tint',color:'#e799b7'},
 {id:'shoes-cream',name:'크림 실내화',target:'avatar',slot:'shoes',price:0,mode:'tint',color:'#dabf87'},
 {id:'ribbon-avatar',name:'빨간 헤어 리본',target:'avatar',slot:'accessory',price:1000,mode:'image',image:'/world/wearables/shared/ribbon-red.png',region:[61,6,31,14],z:35},
 {id:'cat-ivory',name:'아이보리 고양이',target:'cat',slot:'coat',price:0,mode:'tint',color:'#fff4e4'},
 {id:'cat-cheese',name:'치즈색 고양이',target:'cat',slot:'coat',price:1500,mode:'tint',color:'#e9b56f'},
 {id:'cat-gray',name:'회색 고양이',target:'cat',slot:'coat',price:1500,mode:'tint',color:'#9b9ba8'},
 {id:'ribbon-cat',name:'고양이 빨간 리본',target:'cat',slot:'accessory',price:500,mode:'image',image:'/world/wearables/shared/ribbon-red.png',region:[30,59,40,18],z:35},
];
export const selectedWearables=(equipment:Equipment={},target:'avatar'|'cat')=>WEARABLES.filter(i=>i.target===target&&equipment[i.slot]===i.id);
export const isCat=(id:string)=>/cat|고양/i.test(id);
