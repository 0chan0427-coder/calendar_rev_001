import {COMPANION_DECORATIONS} from '../../data/companionDecorations';
import {companionSpriteKey} from '../../data/companionCatalog';
import {useAvatarMotionEnabled} from '../../lib/avatarMotion';
import {companionParts,companionIdleKind} from '../../data/companionMotion';
import {useId,type CSSProperties} from 'react';
import AppearanceArt from './AppearanceArt';
import type {Equipment} from '../../data/wardrobe';
import {isCat} from '../../data/wardrobe';
import {COMPANION_SPRITES} from '../../data/companionSprites';
export default function CompanionAvatar({itemId,equipment={},image,name='동물',animate=false}:{animate?:boolean;itemId:string;equipment?:Equipment;image?:string|null;name?:string}){
 const uid=useId().replace(/[^a-z0-9]/gi,'');
 const motion=useAvatarMotionEnabled()&&animate;
 const motionClass=motion?`pet-idle pet-${companionIdleKind(itemId)}`:'';
 const cat=isCat(itemId);
 const species=companionSpriteKey(itemId,image);
 const adult=species?.startsWith('adult-')||itemId.startsWith('adult-');
 const key=cat?(equipment.coat==='cat-cheese'?(adult?'adult-cat-ginger':'cat-ginger'):(adult?'adult-cat-ivory':'cat-ivory')):species||null;
 if(key){const decoration=COMPANION_DECORATIONS[key];const parts=companionParts(key);const a=COMPANION_SPRITES[key],gray=cat&&equipment.coat==='cat-gray',ribbon=cat&&(equipment.accessory==='ribbon-cat'||(!equipment.accessory&&itemId.endsWith('cat-ribbon')));
 return <div className={`companion-art companion-v3 ${motionClass}`}><svg viewBox={a.crop.join(' ')} preserveAspectRatio="xMidYMid meet" role="img" aria-label={name}><defs>{parts.length>0&&<>{parts.map(part=><mask key={part.id} id={`${uid}-part-${part.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={a.width} height={a.height}><path transform={part.transform} d={part.path} fill="white" stroke="white" strokeWidth="6"/></mask>)}<mask id={`${uid}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width={a.width} height={a.height}><rect width={a.width} height={a.height} fill="white"/>{parts.map(part=><path key={part.id} transform={part.transform} d={part.path} fill="black" stroke="white" strokeWidth="36"/>)}</mask></>}<filter id={uid}><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".78"/><feFuncG type="linear" slope=".78"/><feFuncB type="linear" slope=".83"/></feComponentTransfer></filter></defs>{parts.map(part=><g key={part.id} data-pet-part={part.id} className={motion?'pet-tail-motion':undefined} style={{transformOrigin:`${part.origin[0]-a.crop[0]}px ${part.origin[1]-a.crop[1]}px`,animationDuration:part.duration+'s','--pet-part-angle':(part.angle??2)+'deg'} as CSSProperties}><image href={a.image} width={a.width} height={a.height} filter={gray?`url(#${uid})`:undefined} mask={`url(#${uid}-part-${part.id})`}/></g>)}<image href={a.image} width={a.width} height={a.height} filter={gray?`url(#${uid})`:undefined} mask={parts.length?`url(#${uid}-body)`:undefined}/>{ribbon&&decoration?.ribbon&&<image href="/world/wearables/shared/ribbon-red.png" x={decoration.ribbon[0]} y={decoration.ribbon[1]} width={decoration.ribbon[2]} height={decoration.ribbon[3]}/>}{itemId.endsWith('dog-sunglasses')&&decoration?.glasses&&<g transform={decoration.glasses} fill="#44382d" stroke="#59402d" strokeWidth="12"><rect x="310" y="335" width="210" height="140" rx="45"/><rect x="575" y="335" width="210" height="140" rx="45"/><path d="M520 370Q548 350 575 370" fill="none"/><path d="M340 355L390 345M605 355L655 345" stroke="#fff8e8" strokeWidth="7"/></g>}</svg></div>;
 }
 if(cat)return <div className="companion-art cat-art"><AppearanceArt src={image||'/world/companions-v2/cat-ivory.svg'} target="cat" equipment={equipment} alt={name}/></div>;
 const src=image||null;
 return <div className={`companion-art ${motionClass}`}>{src?<img src={src} alt={name}/>:<span role="img" aria-label={name}>🐾</span>}</div>;
}
