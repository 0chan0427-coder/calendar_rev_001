import type { CSSProperties } from 'react';
import type { Equipment } from '../../data/wardrobe';
import { selectedWearables } from '../../data/wardrobe';
export interface CharacterLayer {src:string;alt?:string;zIndex?:number;className?:string;}
interface Props {gender:'male'|'female';equipment?:Equipment;className?:string;alt?:string;blink?:boolean;layers?:CharacterLayer[];blinkDelay?:string;}
const base='/world/avatar-v2/base';
// Static common body: never recolor or regenerate the face as part of an outfit.
export default function CharacterAvatar({gender,equipment={},className='',alt='씩씩이 미니미',layers=[]}:Props){
 const items=selectedWearables(equipment,'avatar');
 const hair=items.find(i=>i.slot==='hair');
 const front=hair?.imageByGender?.[gender]||hair?.image;
 const back=hair?.backImageByGender?.[gender]||hair?.backImage;
 const wardrobe=items.filter(i=>i.slot!=='hair').map(i=>({id:i.id,src:i.imageByGender?.[gender]||i.image,z:i.z??(({shoes:20,bottom:30,top:40,accessory:80} as Record<string,number>)[i.slot]??80)}));
 const fixed=[{id:'body',src:`${base}/body.svg`,z:10},{id:'hands',src:`${base}/hands.svg`,z:50},{id:'face',src:`${base}/face.svg`,z:60}];
 const all=[...(back?[{id:'hair-back',src:back,z:5}]:[]),...fixed,...wardrobe,...(front?[{id:'hair-front',src:front,z:70}]:[]),...layers.map((l,i)=>({id:`extra-${i}`,src:l.src,z:l.zIndex??85}))].sort((a,b)=>a.z-b.z);
 return <div className={`character-avatar modular-avatar ${gender} ${className}`} style={{'--avatar-ratio':'256 / 384'} as CSSProperties} role="img" aria-label={alt}>
 <div className="character-artboard">{all.map(l=><img key={l.id} className="modular-avatar-layer" src={l.src} alt="" aria-hidden="true" draggable={false} data-layer={l.id} style={{zIndex:l.z}}/>)}</div></div>;
}
