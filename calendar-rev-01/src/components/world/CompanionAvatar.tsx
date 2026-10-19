import {useAvatarMotionEnabled} from '../../lib/avatarMotion';
import {COMPANION_TAIL_RIGS,companionIdleKind} from '../../data/companionMotion';
import {useId} from 'react';
import AppearanceArt from './AppearanceArt';
import type {Equipment} from '../../data/wardrobe';
import {isCat} from '../../data/wardrobe';
import {COMPANION_SPRITES} from '../../data/companionSprites';
const animals:Record<string,string>={panda:'panda/panda',fox:'fox/fox',tiger:'tiger/tiger',elephant:'elephant/elephant',crocodile:'crocodile/crocodile',eagle:'eagle/eagle',whale:'whale/whale'};
export default function CompanionAvatar({itemId,equipment={},image,name='동물',animate=false}:{animate?:boolean;itemId:string;equipment?:Equipment;image?:string|null;name?:string}){
 const uid=useId().replace(/[^a-z0-9]/gi,'');
 const motion=useAvatarMotionEnabled()&&animate;
 const motionClass=motion?`pet-idle pet-${companionIdleKind(itemId)}`:'';
 const cat=isCat(itemId);
 const species=(Object.keys(COMPANION_SPRITES) as (keyof typeof COMPANION_SPRITES)[]).find(k=>itemId===k||itemId.startsWith(k+'-'));
 const key=cat?(equipment.coat==='cat-cheese'?'cat-ginger':'cat-ivory'):species||null;
 if(key){const rig=COMPANION_TAIL_RIGS[key];const a=COMPANION_SPRITES[key],gray=cat&&equipment.coat==='cat-gray',ribbon=cat&&(equipment.accessory==='ribbon-cat'||(!equipment.accessory&&itemId==='cat-ribbon'));
 return <div className={`companion-art companion-v3 ${motionClass}`}><svg viewBox={a.crop.join(' ')} preserveAspectRatio="xMidYMid meet" role="img" aria-label={name}><defs>{rig&&<><mask id={`${uid}-tail`} maskUnits="userSpaceOnUse" x="0" y="0" width={a.width} height={a.height}><path d={rig.path} fill="white" stroke="white" strokeWidth="6"/></mask><mask id={`${uid}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width={a.width} height={a.height}><rect width={a.width} height={a.height} fill="white"/><path d={rig.path} fill="black"/></mask></>}<filter id={uid}><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".78"/><feFuncG type="linear" slope=".78"/><feFuncB type="linear" slope=".83"/></feComponentTransfer></filter></defs>{rig&&<g className={motion?'pet-tail-motion':undefined} style={{transformOrigin:`${rig.origin[0]-a.crop[0]}px ${rig.origin[1]-a.crop[1]}px`,animationDuration:rig.duration+'s'}}><image href={a.image} width={a.width} height={a.height} filter={gray?`url(#${uid})`:undefined} mask={`url(#${uid}-tail)`}/></g>}<image href={a.image} width={a.width} height={a.height} filter={gray?`url(#${uid})`:undefined} mask={rig?`url(#${uid}-body)`:undefined}/>{ribbon&&<image href="/world/wearables/shared/ribbon-red.png" x="490" y="690" width="250" height="170"/>}{itemId==='dog-sunglasses'&&<g transform="rotate(13 540 420)" fill="#44382d" stroke="#59402d" strokeWidth="12"><rect x="310" y="335" width="210" height="140" rx="45"/><rect x="575" y="335" width="210" height="140" rx="45"/><path d="M520 370Q548 350 575 370" fill="none"/><path d="M340 355L390 345M605 355L655 345" stroke="#fff8e8" strokeWidth="7"/></g>}</svg></div>;
 }
 if(cat)return <div className="companion-art cat-art"><AppearanceArt src={image||'/world/companions-v2/cat-ivory.svg'} target="cat" equipment={equipment} alt={name}/></div>;
 const type=Object.keys(animals).find(k=>itemId.includes(k));
 const src=image||(type?`/world/animals/${animals[type]}.png`:itemId.includes('dragon')?'/world/animals/dragon/red/dragon_red.png':null);
 return <div className={`companion-art ${motionClass}`}>{src?<img src={src} alt={name}/>:<span role="img" aria-label={name}>🐾</span>}</div>;
}
