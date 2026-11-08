import {companionBodyKey,companionSpecialArt} from '../data/companionSpecialForms';
import {COMPANION_SPRITES} from '../data/companionSprites';
import type {Equipment} from '../data/wardrobe';
import {warmCompanionSources} from '../components/world/CompanionCanvas';
export function prewarmCompanion(itemId:string,equipment:Equipment={},special=false){
 const art=special?companionSpecialArt(itemId,equipment):undefined,key=companionBodyKey(itemId,equipment);
 const image=art?.image||(key?COMPANION_SPRITES[key]?.image:undefined);
 return warmCompanionSources([image,equipment.accessory==='ribbon-cat'?'/world/wearables/shared/ribbon-red.png':undefined].filter((x):x is string=>Boolean(x)));
}
