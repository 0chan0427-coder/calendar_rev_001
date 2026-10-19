import {furnitureDesign} from '../../data/furniture';
interface Props {item:{id?:string;item_id?:string;name?:string;image?:string|null;image_url?:string|null};className?:string;}
export default function FurnitureArt({item,className=''}:Props){
 const design=furnitureDesign(item),label=item.name||design?.name||'가구';
 if(design)return <svg className={`furniture-art ${className}`} viewBox={design.crop.join(' ')} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet"><image href={design.image} width={design.width} height={design.height}/></svg>;
 const src=item.image_url||(item.image?.startsWith('/')?item.image:undefined);
 return src?<img className={`furniture-art ${className}`} src={src} alt={label}/>:<span className={`furniture-art furniture-placeholder ${className}`} role="img" aria-label={label}>{item.image||'📦'}</span>;
}
