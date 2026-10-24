import {companionSpecialArt} from './companionSpecialForms';
import {companionSpriteKey} from './companionCatalog';
import type {Equipment} from './wardrobe';
export const BOND_MAX=900;
export const BOND_ACCESSORY_AT=450;
export const CARE_ACTIONS=[{id:'snack',name:'간식 주기',reaction:'간식 주기 완료.'},{id:'pet',name:'쓰다듬기',reaction:'쓰다듬기 완료.'},{id:'play',name:'놀아주기',reaction:'놀아주기 완료.'}] as const;
export type CareAction=typeof CARE_ACTIONS[number]['id'];
export type RewardKind='accessory'|'special';
export const BOND_THEMES={
 cat:{accessory:'고양이 목걸이',special:'고양이 특별 외형',motif:'moon'},
 dog:{accessory:'강아지 스카프',special:'강아지 특별 외형',motif:'wing'},
 rabbit:{accessory:'토끼 귀 장식',special:'토끼 특별 외형',motif:'flower'},
 panda:{accessory:'판다 목걸이',special:'판다 특별 외형',motif:'bamboo'},
 fox:{accessory:'여우 목걸이',special:'여우 특별 외형',motif:'knot'},
 tiger:{accessory:'호랑이 가슴 장식',special:'호랑이 특별 외형',motif:'tiger'},
 elephant:{accessory:'코끼리 이마 장식',special:'코끼리 특별 외형',motif:'gem'},
 crocodile:{accessory:'악어 등 장식',special:'악어 특별 외형',motif:'scale'},
 eagle:{accessory:'독수리 발목 고리',special:'독수리 특별 외형',motif:'ring'},
 whale:{accessory:'고래 지느러미 장식',special:'고래 특별 외형',motif:'star'},
 dragon:{accessory:'용 가슴 장식',special:'용 특별 외형',motif:'diamond'},
 unicorn:{accessory:'유니콘 머리 장식',special:'유니콘 특별 외형',motif:'crown'},
} as const;
export type BondFamily=keyof typeof BOND_THEMES;
export function companionBondFamily(itemId:string):BondFamily|undefined{
 const key=(companionSpriteKey(itemId)||itemId).replace(/^adult-/,'');
 return (Object.keys(BOND_THEMES) as BondFamily[]).find(f=>key===f||key.startsWith(f+'-'));
}
export function specialFormAvailable(itemId:string,equipment:Equipment={}){
 return Boolean(companionSpecialArt(itemId,equipment));
}
export const BOND_ACCESSORY_FITS:Record<BondFamily,{baby:[number,number,number];adult:[number,number,number]}>= {
 cat:{baby:[38,63,1],adult:[27,37,.72]},dog:{baby:[39,62,1],adult:[29,39,.75]},
 rabbit:{baby:[66,34,.7],adult:[42,31,.6]},panda:{baby:[49,64,1],adult:[56,45,.85]},
 fox:{baby:[34,61,1],adult:[24,41,.7]},tiger:{baby:[35,61,1],adult:[22,39,.72]},
 elephant:{baby:[45,25,.85],adult:[23,16,.65]},crocodile:{baby:[58,50,.85],adult:[54,48,.8]},
 eagle:{baby:[42,89,.6],adult:[40,91,.58]},whale:{baby:[47,65,.7],adult:[49,64,.7]},
 dragon:{baby:[26,64,.9],adult:[31,60,.68]},unicorn:{baby:[27,16,.75],adult:[22,18,.6]},
};
export interface CompanionBondState {
 companion:import('../types/world').WorldCompanion;day:string;maximum:number;accessory_at:number;actions:CareAction[];rewards:RewardKind[];gained?:number;added?:boolean;
}
