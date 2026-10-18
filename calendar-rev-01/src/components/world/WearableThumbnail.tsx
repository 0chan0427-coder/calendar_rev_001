import {useId} from 'react';
import type {Wearable,Equipment} from '../../data/wardrobe';
import {RASTER_ASSETS} from '../../data/avatarRaster';
import type {RasterKey} from '../../data/avatarRaster';
import {avatarSvgMarkup} from '../../lib/avatarRaster';
export default function WearableThumbnail({item,gender}:{item:Wearable;gender:'male'|'female'}){
 const uid=useId().replace(/[^a-z0-9]/gi,'');
 const key=item.id==='hair-chestnut'&&gender==='female'?'hair-bob':item.renderKey;
 if(key){const a=RASTER_ASSETS[key as RasterKey];return <svg className="wearable-thumbnail" viewBox={a.crop.join(' ')} aria-hidden="true"><defs><filter id={`thumb${uid}`}><feComponentTransfer><feFuncA type="linear" slope="1.045" intercept="-0.025"/></feComponentTransfer></filter></defs><image href={a.image} width={a.width} height={a.height} filter={`url(#thumb${uid})`}/></svg>;}
 if(item.target==='cat')return item.mode==='tint'?<span className="wearable-swatch" style={{background:item.color}}/>:<img src={item.image} alt=""/>;
 if(item.slot==='accessory')return <img src={item.image} alt=""/>;
 const equipment:Equipment={hair:'hair-none',[item.slot]:item.id};
 const viewBox=['face','skin','makeup','glasses'].includes(item.slot)?'235 235 550 360':'100 0 824 1536';
 const markup=avatarSvgMarkup(gender,equipment,`thumb${uid}`).replace('viewBox="0 0 1024 1536"',`viewBox="${viewBox}"`);
 return <span className="wearable-thumbnail" dangerouslySetInnerHTML={{__html:markup}}/>;
}
