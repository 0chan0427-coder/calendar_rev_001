import raw from './pet-battle-catalog.json';
export type StatKey='hp'|'atk'|'def'|'spe'|'spa'|'spd';
export interface PetStats{hp:number;atk:number;def:number;spe:number;spa:number;spd:number}
export interface BattleSkill{id:string;name:string;type:string;category:'physical'|'special'|'status';power:number;accuracy:number;priority:number;cooldown:number;effect:string;description:string}
export interface BattlePet{id:string;species:string;name:string;age:'baby'|'adult';itemId:string;spriteKey:string;existing:boolean;types:string[];role:string;stats:PetStats;total:number;skills:string[];ability:{id:string;name:string;description:string};synergy:string;image:string|null;specialName:string;specialPalette:number;specialDescription:string;price:number|null;size:number[]}
export const BATTLE_PETS=raw.pets as BattlePet[];
export const BATTLE_SKILLS=raw.skills as BattleSkill[];
export const PET_SPECIES=raw.species;
export const PET_TYPES=raw.types;
export const TYPE_STRONG=raw.strong as Record<string,string[]>;
export const STAT_LABELS:Record<StatKey,string>={hp:'HP',atk:'공격',def:'방어',spe:'속도',spa:'특수공격',spd:'특수방어'};
export const PET_BY_ID=Object.fromEntries(BATTLE_PETS.map(p=>[p.id,p]));
export const SKILL_BY_ID=Object.fromEntries(BATTLE_SKILLS.map(s=>[s.id,s]));
export function battlePetForItem(itemId:string){
 const adult=itemId.startsWith('adult-'),base=itemId.replace(/^adult-/,'').replaceAll('_','-');
 const species=base.startsWith('cat-')?'cat':base==='dog'||base.startsWith('dog-')?'dog':base==='dragon'||base.startsWith('dragon-')?'dragon':base;
 return PET_BY_ID[`${species}-${adult?'adult':'baby'}`];
}
export function typeMultiplier(attackType:string,defenderTypes:string[]){
 return Math.max(.5,Math.min(2,defenderTypes.reduce((m,t)=>m*(TYPE_STRONG[attackType]?.includes(t)?2:TYPE_STRONG[t]?.includes(attackType)?.5:1),1)));
}
