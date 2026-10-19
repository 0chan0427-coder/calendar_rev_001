import {useId} from 'react';
import AppearanceArt from './AppearanceArt';
import type {Equipment} from '../../data/wardrobe';
import {isCat} from '../../data/wardrobe';
import {COMPANION_SPRITES} from '../../data/companionSprites';
const animals:Record<string,string>={panda:'panda/panda',fox:'fox/fox',tiger:'tiger/tiger',elephant:'elephant/elephant',crocodile:'crocodile/crocodile',eagle:'eagle/eagle',whale:'whale/whale'};
export default function CompanionAvatar({itemId,equipment={},image,name='동물'}:{itemId:string;equipment?:Equipment;image?:string|null;name?:string}){
 const uid=useId().replace(/[^a-z0-9]/gi,'');
 const cat=isCat(itemId),dog=/^dog(?:-|$)/.test(itemId),rabbit=/^rabbit(?:-|$)/.test(itemId);
 const key=cat?(equipment.coat==='cat-cheese'?'cat-ginger':'cat-ivory'):dog?'dog':rabbit?'rabbit':null;
 if(key){const a=COMPANION_SPRITES[key],gray=cat&&equipment.coat==='cat-gray',ribbon=cat&&(equipment.accessory==='ribbon-cat'||(!equipment.accessory&&itemId==='cat-ribbon'));
 return <div className="companion-art companion-v3"><svg viewBox={a.crop.join(' ')} preserveAspectRatio="xMidYMid meet" role="img" aria-label={name}><defs><filter id={uid}><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".78"/><feFuncG type="linear" slope=".78"/><feFuncB type="linear" slope=".83"/></feComponentTransfer></filter></defs><image href={a.image} width={a.width} height={a.height} filter={gray?`url(#${uid})`:undefined}/>{ribbon&&<image href="/world/wearables/shared/ribbon-red.png" x="490" y="690" width="250" height="170"/>}{itemId==='dog-sunglasses'&&<g transform="rotate(13 540 420)" fill="#44382d" stroke="#59402d" strokeWidth="12"><rect x="310" y="335" width="210" height="140" rx="45"/><rect x="575" y="335" width="210" height="140" rx="45"/><path d="M520 370Q548 350 575 370" fill="none"/><path d="M340 355L390 345M605 355L655 345" stroke="#fff8e8" strokeWidth="7"/></g>}</svg></div>;
 }
 if(cat)return <div className="companion-art cat-art"><AppearanceArt src={image||'/world/companions-v2/cat-ivory.svg'} target="cat" equipment={equipment} alt={name}/></div>;
 const type=Object.keys(animals).find(k=>itemId.includes(k));
 const src=image||(type?`/world/animals/${animals[type]}.png`:itemId.includes('dragon')?'/world/animals/dragon/red/dragon_red.png':null);
 return <div className="companion-art">{src?<img src={src} alt={name}/>:<span role="img" aria-label={name}>🐾</span>}</div>;
}
