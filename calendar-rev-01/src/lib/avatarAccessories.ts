import type {Box,CollectionItem} from '../data/collection01';
import {collectionAsset,hairLayerMasks} from './avatarCollection';
import type {AssetResolver} from './avatarRaster';
/** Coordinates use the shared 1024×1536 body. Every new accessory needs an explicit fitting entry. */
export interface AccessoryFit {
 anchor:'neck'|'collar'|'chest';
 box:Box;
 surface:'over-outer'|'under-outer';
 /** Native-image rear section. Complementary masks keep the opening behind the neck. */
 rearPath?:string;
}
export const ACCESSORY_FITS:Record<string,AccessoryFit>={
 'acc-scarf':{anchor:'neck',box:[370,565,284,340],surface:'over-outer',rearPath:'M0 0H1536V140H1040Q1000 230 900 275Q770 320 650 270Q550 220 485 140H0Z'},
 'acc-bow':{anchor:'collar',box:[414,615,196,112],surface:'over-outer'},
 'acc-moon':{anchor:'neck',box:[439,593,146,210],surface:'under-outer',rearPath:'M0 0H1536V75H0Z'},
 'acc-star':{anchor:'chest',box:[589,686,68,75],surface:'over-outer'},
};
export function accessoryDefs(item:CollectionItem|undefined,uid:string){
 const fit=item&&ACCESSORY_FITS[item.id];
 return fit?.rearPath?hairLayerMasks(item!.width,item!.height,fit.rearPath,`${uid}-accessory-rear`,`${uid}-accessory-front`):'';
}
export function fittedAccessory(item:CollectionItem|undefined,uid:string,resolve:AssetResolver,alphaId:string,layer:'back'|'under-outer'|'over-outer'){
 const fit=item&&ACCESSORY_FITS[item.id];
 // Unfitted new designs must not silently become floating stickers.
 if(!item||!fit)return '';
 if(layer==='back'&&!fit.rearPath)return '';
 if(layer!=='back'&&layer!==fit.surface)return '';
 const mask=fit.rearPath?`mask="url(#${uid}-accessory-${layer==='back'?'rear':'front'})"`:'';
 return `<g data-accessory="${item.id}" data-anchor="${fit.anchor}" data-surface="${layer}">${collectionAsset(item,resolve,alphaId,fit.box,undefined,mask)}</g>`;
}
