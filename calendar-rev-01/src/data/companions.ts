import {companionSpriteKey} from './companionCatalog';
/** Source alpha bounds and display size are independent: long tails never shrink the body arbitrarily. */
export const COMPANION_SCENE_SIZES:Record<string,[number,number]>={
 'cat-ivory':[72,72],'cat-ginger':[72,72],dog:[72,72],rabbit:[72,78],
 panda:[90,95],fox:[90,85],tiger:[110,110],elephant:[130,120],crocodile:[140,80],eagle:[90,105],whale:[210,110],
 unicorn:[130,145],horse:[130,145],griffin:[155,160],
 'dragon-red':[180,150],'dragon-gold':[180,150],'dragon-blue':[180,150],'dragon-green':[180,150],'dragon-black':[180,150],'dragon-glowing':[180,150],'dragon-crown':[180,150],'dragon-baby':[100,100],
};
export function companionSceneSize(itemId:string,image?:string|null):[number,number]{
 const key=companionSpriteKey(itemId,image);
 if(key&&COMPANION_SCENE_SIZES[key])return COMPANION_SCENE_SIZES[key];
 const family=Object.keys(COMPANION_SCENE_SIZES).find(k=>itemId===k||itemId.startsWith(k+'-'));
 return COMPANION_SCENE_SIZES[family||'cat-ivory'];
}
