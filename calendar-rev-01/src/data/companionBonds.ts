import {companionSpecialArt} from './companionSpecialForms';
import {companionSpriteKey} from './companionCatalog';
import type {Equipment} from './wardrobe';
export const BOND_MAX=900;
export const BOND_ACCESSORY_AT=450;
export const CARE_ACTIONS=[{id:'snack',name:'간식 주기',reaction:'맛있게 먹고 기분이 좋아졌어요.'},{id:'pet',name:'쓰다듬기',reaction:'손길에 편안해하고 있어요.'},{id:'play',name:'놀아주기',reaction:'함께 놀아서 즐거워해요.'}] as const;
export type CareAction=typeof CARE_ACTIONS[number]['id'];
export type RewardKind='accessory'|'special';
export const BOND_THEMES={
 cat:{accessory:'초승달 보석 목걸이',special:'달빛 고양이',motif:'moon'},
 dog:{accessory:'날개 이름표 스카프',special:'별지기 강아지',motif:'wing'},
 rabbit:{accessory:'달꽃 귀 장식',special:'달토끼',motif:'flower'},
 panda:{accessory:'옥 대나무 펜던트',special:'대숲 수호 판다',motif:'bamboo'},
 fox:{accessory:'수호 방울 매듭',special:'여우 수호령',motif:'knot'},
 tiger:{accessory:'수호 문양 가슴 장식',special:'백호 수호령',motif:'tiger'},
 elephant:{accessory:'숲의 이마 보석',special:'숲의 수호 코끼리',motif:'gem'},
 crocodile:{accessory:'고대 등판 보석',special:'고대 수호 악어',motif:'scale'},
 eagle:{accessory:'폭풍 발목 고리',special:'폭풍 독수리',motif:'ring'},
 whale:{accessory:'별바다 지느러미 장식',special:'별바다 고래',motif:'star'},
 dragon:{accessory:'각성의 속성 보석',special:'각성룡',motif:'diamond'},
 unicorn:{accessory:'오로라 보석 관',special:'오로라 유니콘',motif:'crown'},
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
