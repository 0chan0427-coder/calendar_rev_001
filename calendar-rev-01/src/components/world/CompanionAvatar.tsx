import AppearanceArt from './AppearanceArt';
import type { Equipment } from '../../data/wardrobe';
import { COMPANION_APPEARANCES } from '../../data/companions';
import { isCat } from '../../data/wardrobe';
const modernRoot='/world/companions-v2';
const animals:Record<string,string>={dog:'dogs/dog',rabbit:'rabbits/rabbit',panda:'panda/panda',fox:'fox/fox',tiger:'tiger/tiger',elephant:'elephant/elephant',crocodile:'crocodile/crocodile',eagle:'eagle/eagle',whale:'whale/whale'};
export default function CompanionAvatar({itemId,equipment={},image,name='동물'}:{itemId:string;equipment?:Equipment;image?:string|null;name?:string}){
 const spec=COMPANION_APPEARANCES[itemId];
 if(isCat(itemId))return <div className="companion-art cat-art"><AppearanceArt src={spec?.body||image||"/world/companions-v2/cat-ivory.svg"} target="cat" equipment={equipment} alt={name}/></div>;
 if(/dog|강아|개-/.test(itemId))return <div className="companion-art"><img src={`${modernRoot}/dog-tan.svg`} alt={name}/></div>;
 if(/rabbit|토끼/.test(itemId))return <div className="companion-art"><img src={`${modernRoot}/rabbit-ivory.svg`} alt={name}/></div>;
 const type=Object.keys(animals).find(k=>itemId.includes(k));
 const src=image||(type?`/world/animals/${animals[type]}.png`:itemId.includes('dragon')?`/world/animals/dragon/red/dragon_red.png`:null);
 return <div className="companion-art">{src?<img src={src} alt={name}/>:<span role="img" aria-label={name}>🐾</span>}</div>;
}
