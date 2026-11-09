import {ORIGINAL_HAIR_IDS_078} from '../../data/hair078';
import {collectionItem} from '../../data/collection01';
import {useId} from 'react';
import type {Wearable} from '../../data/wardrobe';
import {RASTER_ASSETS} from '../../data/avatarRaster';
import type {RasterKey} from '../../data/avatarRaster';
import {wearableThumbnailSvg} from '../../lib/wearableThumbnail';
import WorldImageCanvas from './WorldImageCanvas';
import SvgThumbnailCanvas from './SvgThumbnailCanvas';
export default function WearableThumbnail({item,gender}:{item:Wearable;gender:'male'|'female'}){
 const uid=useId().replace(/[^a-z0-9]/gi,'');
 const collection=collectionItem(item.id);
 if(ORIGINAL_HAIR_IDS_078.has(item.id))return <SvgThumbnailCanvas label={item.name} markup={wearableThumbnailSvg(item,gender,'thumb'+uid)}/>;
 const key=item.id==='hair-chestnut'&&gender==='female'?'hair-bob':item.renderKey;
 if(item.image&&/^(makeup077-|skin077-)/.test(item.id))return <WorldImageCanvas interactive={false} src={item.image} className="wearable-thumbnail" label={item.name}/>;
 const art=collection||(key?RASTER_ASSETS[key as RasterKey]:undefined);
 if(art)return <WorldImageCanvas interactive={false} src={art.image} crop={art.crop} sourceSize={[art.width,art.height]} className="wearable-thumbnail" label={item.name} opaque cleanAlpha={/^(hair077-|outer077-)/.test(item.id)}/>;
 if(item.target!=='avatar'){
  if(item.mode==='tint')return <span className="wearable-swatch" style={{background:item.color}} role="img" aria-label={item.name}/>;
  if(item.image)return <WorldImageCanvas interactive={false} src={item.image} className="wearable-thumbnail" label={item.name}/>;
  if(item.id==='sunglasses-dog')return <SvgThumbnailCanvas label={item.name} markup={'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 100 65"><g fill="#44382d" stroke="#70543a" stroke-width="3"><rect x="8" y="15" width="35" height="28" rx="7"/><rect x="57" y="15" width="35" height="28" rx="7"/><path d="M43 23Q50 17 57 23" fill="none"/></g></svg>'}/>;
 }
 if(item.slot==='accessory'&&item.image)return <WorldImageCanvas interactive={false} src={item.image} className="wearable-thumbnail" label={item.name}/>;
 return <SvgThumbnailCanvas label={item.name} markup={wearableThumbnailSvg(item,gender,'thumb'+uid)}/>;
}
