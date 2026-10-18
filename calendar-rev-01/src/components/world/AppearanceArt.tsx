import { useId } from 'react';
import type { Equipment, Wearable } from '../../data/wardrobe';
import { selectedWearables } from '../../data/wardrobe';

// Polygons are expressed in original artboard percentages. No facial geometry changes.
const regions = {
 male:{hair:'5,16 12,6 29,1 69,1 91,8 98,21 94,31 86,28 85,20 75,17 20,17 15,27 7,30',top:'31,49 69,49 80,54 90,71 84,74 77,73 75,79 24,79 23,73 14,73 10,69 20,54',bottom:'25,80 75,80 79,89 70,90 62,89 51,84 42,90 26,90',shoes:'18,90 43,90 49,93 43,98 18,98 11,95 61,90 84,90 93,95 85,98 60,98 55,94'},
 female:{hair:'6,24 13,11 28,4 51,1 75,5 88,15 94,35 98,49 79,52 72,48 83,37 76,31 64,29 56,21 51,31 41,25 34,32 23,35 23,47 15,51 3,48',top:'36,50 63,50 75,56 81,72 74,75 70,73 69,78 29,78 29,73 22,74 18,71 24,56',bottom:'30,79 69,79 71,89 59,91 50,85 42,90 28,89',shoes:'24,90 42,90 48,94 41,98 21,97 17,94 59,90 77,90 84,94 79,98 58,98 53,94'}
};
export default function AppearanceArt({src,gender='male',target='avatar',equipment={},alt=''}:{src:string;gender?:'male'|'female';target?:'avatar'|'cat';equipment?:Equipment;alt?:string}){
 const id=useId().replace(/:/g,'');
 const items=selectedWearables(equipment,target);
 const coat=items.find(i=>i.slot==='coat');
 const renderLayer=(i:Wearable)=>{const region=i.regionByGender?.[gender]||i.region||[0,0,100,100];return <image key={i.id} href={i.imageByGender?.[gender]||i.image} x={region[0]} y={region[1]} width={region[2]} height={region[3]} preserveAspectRatio="xMidYMid meet"/>;};
 return <svg className="appearance-art" viewBox="0 0 100 100" preserveAspectRatio="none" role={alt?'img':undefined} aria-label={alt||undefined} aria-hidden={!alt}>
 <defs>{items.filter(i=>i.mode==='tint').map(i=><filter key={i.id} id={`${id}-${i.id}`} colorInterpolationFilters="sRGB"><feFlood floodColor={i.color} result="color"/><feBlend in="SourceGraphic" in2="color" mode="multiply" result="tinted"/><feComposite in="tinted" in2="SourceGraphic" operator="in"/></filter>)}
 {target==='avatar'&&items.filter(i=>i.mode==='tint').map(i=><clipPath key={i.id} id={`${id}-clip-${i.id}`}><polygon points={regions[gender][i.slot as keyof typeof regions.male]||''}/></clipPath>)}</defs>
 {items.filter(i=>i.mode==='image'&&(i.z??20)<10).sort((a,b)=>(a.z??20)-(b.z??20)).map(renderLayer)}
 <image href={src} width="100" height="100" preserveAspectRatio="none" filter={coat?`url(#${id}-${coat.id})`:undefined}/>
 {target==='avatar'&&items.filter(i=>i.mode==='tint').map(i=><image key={i.id} href={src} width="100" height="100" preserveAspectRatio="none" clipPath={`url(#${id}-clip-${i.id})`} filter={`url(#${id}-${i.id})`}/>)}
 {items.filter(i=>i.mode==='image'&&(i.z??20)>=10).sort((a,b)=>(a.z??20)-(b.z??20)).map(renderLayer)}
 </svg>;
}
