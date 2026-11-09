import {normalizeAvatarEquipment,WEARABLES} from '../data/wardrobe';
import type {Equipment} from '../data/wardrobe';
export type AvatarPresetSlot079='A'|'B'|'C';
export interface AvatarPreset079 {slot:AvatarPresetSlot079;equipment:Equipment;updated_at?:string}
/** Re-check inventory on every load: refunded or removed items fall back to defaults. */
export function loadOwnedPreset079(input:Equipment,owned:readonly string[]):{equipment:Equipment;removed:number}{
 const entries=Object.entries(input);const keep=entries.filter(([slot,id])=>WEARABLES.some(i=>i.id===id&&i.slot===slot&&i.target==='avatar'&&(i.price===0||owned.includes(i.id))));
 return {equipment:normalizeAvatarEquipment(Object.fromEntries(keep)),removed:entries.length-keep.length};
}
export function ownsDraft079(draft:Equipment,owned:readonly string[]):boolean{return Object.entries(draft).every(([slot,id])=>WEARABLES.some(i=>i.target==='avatar'&&i.slot===slot&&i.id===id&&(i.price===0||owned.includes(i.id))));}
