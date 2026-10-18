import {useId} from 'react';
import type {Equipment} from '../../data/wardrobe';
import {selectedWearables} from '../../data/wardrobe';
export default function AppearanceArt({src,target='cat',equipment={},alt=''}:{src:string;gender?:'male'|'female';target?:'avatar'|'cat';equipment?:Equipment;alt?:string}){
 const id=useId().replace(/[^a-z0-9]/gi,'');const items=selectedWearables(equipment,target);const coat=items.find(i=>i.slot==='coat');
 return <svg className="appearance-art" viewBox="0 0 100 100" preserveAspectRatio="none" role={alt?'img':undefined} aria-label={alt||undefined} aria-hidden={!alt}><defs>{coat&&<filter id={id} colorInterpolationFilters="sRGB"><feFlood floodColor={coat.color} result="color"/><feBlend in="SourceGraphic" in2="color" mode="multiply" result="tinted"/><feComposite in="tinted" in2="SourceGraphic" operator="in"/></filter>}</defs><image href={src} width="100" height="100" preserveAspectRatio="none" filter={coat?`url(#${id})`:undefined}/>{items.filter(i=>i.mode==='image').map(i=><image key={i.id} href={i.image} x={i.region?.[0]||0} y={i.region?.[1]||0} width={i.region?.[2]||100} height={i.region?.[3]||100} preserveAspectRatio="xMidYMid meet"/>)}</svg>;
}
