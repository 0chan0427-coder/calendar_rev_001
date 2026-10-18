import type { Wearable } from '../../data/wardrobe';
const crops:Record<string,string>={hair:'42 10 172 225',top:'65 173 126 88',bottom:'85 235 86 102',shoes:'84 304 90 53',accessory:'149 34 62 56'};
export default function WearableThumbnail({item,gender}:{item:Wearable;gender:'male'|'female'}){
 const isCat=item.target==='cat';const back=item.backImageByGender?.[gender]||item.backImage;
 return <svg className="wearable-thumbnail" viewBox={isCat?'35 10 190 230':crops[item.slot]||'0 0 256 384'} aria-hidden="true">
 {back&&<image href={back} width="256" height="384"/>}<image href={item.imageByGender?.[gender]||item.image} width="256" height={isCat?256:384}/></svg>;
}
