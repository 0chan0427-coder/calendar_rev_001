import AppearanceArt from './AppearanceArt';
import type { Equipment } from '../../data/wardrobe';
import { COMPANION_APPEARANCES } from '../../data/companions';
import { isCat } from '../../data/wardrobe';
const animals:Record<string,string>={dog:'dogs/dog',rabbit:'rabbits/rabbit',panda:'panda/panda',fox:'fox/fox',tiger:'tiger/tiger',elephant:'elephant/elephant',crocodile:'crocodile/crocodile',eagle:'eagle/eagle',whale:'whale/whale'};
export default function CompanionAvatar({itemId,equipment={},image,name='동물'}:{itemId:string;equipment?:Equipment;image?:string|null;name?:string}){
 const spec=COMPANION_APPEARANCES[itemId];
 if(isCat(itemId))return <div className="companion-art cat-art"><AppearanceArt src={spec?.body||image||"/world/animals/cats/ivory-base.png"} target="cat" equipment={equipment} alt={name}/></div>;
 const type=Object.keys(animals).find(k=>itemId.includes(k));
 const src=image||(type?`/world/animals/${animals[type]}.png`:itemId.includes('dragon')?`/world/animals/dragon/red/dragon_red.png`:null);
 return <div className="companion-art">{src?<img src={src} alt={name}/>:<span role="img" aria-label={name}>🐾</span>}</div>;
}
