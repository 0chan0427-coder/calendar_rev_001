import {interiorDesign} from '../../data/roomSkins';
import {CATALOG_THUMBNAILS} from '../../data/catalogThumbnails';
import {WINDOW_ITEMS} from '../../data/windows';
import {gardenTheme,BASIC_GARDEN} from '../../data/gardens';
import WorldImageCanvas from './WorldImageCanvas';
import {furnitureDesign} from '../../data/furniture';
interface Props {item:{id?:string;item_id?:string;name?:string;image?:string|null;image_url?:string|null};className?:string;thumbnail?:boolean;}
export default function FurnitureArt({item,className='',thumbnail=false}:Props){
 const design=furnitureDesign(item),label=item.name||design?.name||'가구';
 const interior=interiorDesign(item.id||item.item_id);if(interior)return <WorldImageCanvas src={interior.image} className={`furniture-art ${className}`} label={label}/>;
 if((item.id||item.item_id)==='room-default')return <span className={`furniture-art basic-room-thumb ${className}`} role="img" aria-label="기본 방"/>;
 const garden=gardenTheme(item.id||item.item_id);if(garden)return <WorldImageCanvas src={garden.image} className={`furniture-art ${className}`} label={garden.name}/>;
 if((item.id||item.item_id)===BASIC_GARDEN)return <span className={`furniture-art basic-garden-thumb ${className}`} role="img" aria-label="기본 잔디 정원"/>;
 if(design)return <WorldImageCanvas src={thumbnail?(CATALOG_THUMBNAILS[design.image]||design.image):design.image} fallbackSrc={thumbnail?design.image:undefined} crop={design.crop} sourceSize={[design.width,design.height]} className={`furniture-art ${className}`} label={label} opaque/>;
 const registered=WINDOW_ITEMS.find(i=>i.id===(item.id||item.item_id));
 const src=[registered?.image,item.image_url,item.image].find((v):v is string=>Boolean(v&&/^(\/|https?:\/\/|data:image\/)/.test(v)));
 if(src)return <WorldImageCanvas src={thumbnail?(CATALOG_THUMBNAILS[src]||src):src} fallbackSrc={thumbnail?src:undefined} className={`furniture-art ${className}`} label={label}/>;
 const id=item.id||item.item_id||'';
 if(id.startsWith('wallpaper-')||id.startsWith('floor-'))return <span className={`furniture-art surface-sample ${id} ${className}`} role="img" aria-label={label}/>;
 return <span className={`furniture-art furniture-placeholder ${className}`} role="img" aria-label={label}>{item.image||'📦'}</span>;
}
