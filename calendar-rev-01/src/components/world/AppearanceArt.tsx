import type { Equipment } from '../../data/wardrobe';
import { selectedWearables } from '../../data/wardrobe';
// Companion artwork uses genuine coat variants, with an independent accessory layer.
export default function AppearanceArt({src,target='cat',equipment={},alt=''}:{src:string;gender?:'male'|'female';target?:'avatar'|'cat';equipment?:Equipment;alt?:string}){
 const items=selectedWearables(equipment,target);const coat=items.find(i=>i.slot==='coat');
 return <svg className="appearance-art" viewBox="0 0 256 256" role={alt?'img':undefined} aria-label={alt||undefined} aria-hidden={!alt}>
 <image href={coat?.image||src} width="256" height="256"/>
 {items.filter(i=>i.slot!=='coat').map(i=><image key={i.id} href={i.image} width="256" height="256"/>)}
 </svg>;
}
