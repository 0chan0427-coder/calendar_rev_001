import {COMPANION_SPRITES} from './companionSprites';
/** Existing IDs retain ownership; colors/variants resolve before a generic family fallback. */
export const COMPANION_ALIASES:Record<string,string>={
 'cat-white':'cat-ivory','cat-ribbon':'cat-ivory','dog-brown':'dog','dog-sunglasses':'dog',
 panda:'panda',fox:'fox',tiger:'tiger',elephant:'elephant',crocodile:'crocodile',eagle:'eagle',whale:'whale',rabbit:'rabbit',unicorn:'unicorn',
 'dragon-red':'dragon-red','dragon-gold':'dragon-gold','dragon-blue':'dragon-blue','dragon-green':'dragon-green','dragon-black':'dragon-black','dragon-baby':'dragon-baby','dragon-glowing':'dragon-glowing','dragon-crown':'dragon-crown',dragon:'dragon-red',
};
export const COMPANION_LEGACY_FILES:Record<string,string>={
 'cat.png':'cat-ivory','ivory-base.png':'cat-ivory','dog.png':'dog','rabbit.png':'rabbit','panda.png':'panda','fox.png':'fox','tiger.png':'tiger','elephant.png':'elephant','crocodile.png':'crocodile','eagle.png':'eagle','whale.png':'whale','unicorn.png':'unicorn',
 'dragon_red.png':'dragon-red','dragon_gold.png':'dragon-gold','dragon_blue.png':'dragon-blue','dragon_green.png':'dragon-green','dragon_black.png':'dragon-black','dragon_baby.png':'dragon-baby','dragon_glowing.png':'dragon-glowing','dragon_crown.png':'dragon-crown',
};
export function companionSpriteKey(itemId:string,image?:string|null){
 const id=itemId.toLowerCase().replaceAll('_','-');
 const exact=COMPANION_ALIASES[id]||(Object.hasOwn(COMPANION_SPRITES,id)?id:undefined);
 if(exact&&COMPANION_SPRITES[exact])return exact;
 const file=image?.split('?')[0].split('/').pop(),stem=file?.replace(/\.png$/,'');
 const fromFile=stem&&Object.hasOwn(COMPANION_SPRITES,stem)?stem:file&&COMPANION_LEGACY_FILES[file];
 if(fromFile&&COMPANION_SPRITES[fromFile])return fromFile;
 const family=Object.keys(COMPANION_SPRITES).sort((a,b)=>b.length-a.length).find(k=>id.startsWith(k+'-'));
 return family;
}
