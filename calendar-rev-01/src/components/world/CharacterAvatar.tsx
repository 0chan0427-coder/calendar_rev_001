import {useId} from 'react';
import type {CSSProperties} from 'react';
import type {Equipment} from '../../data/wardrobe';
import {avatarSvgMarkup} from '../../lib/avatarRaster';
export interface CharacterLayer {src:string;alt?:string;zIndex?:number;className?:string;}
interface Props {gender:'male'|'female';equipment?:Equipment;className?:string;alt?:string;blink?:boolean;layers?:CharacterLayer[];blinkDelay?:string;}
export default function CharacterAvatar({gender,equipment={},className='',alt='씩씩이 미니미'}:Props){
 const uid=useId().replace(/[^a-z0-9]/gi,'');
 return <div className={`character-avatar raster-avatar ${gender} ${className}`} style={{'--avatar-ratio':'2 / 3'} as CSSProperties} role="img" aria-label={alt}><div className="character-artboard" dangerouslySetInnerHTML={{__html:avatarSvgMarkup(gender,equipment,`avatar${uid}`)}}/></div>;
}
