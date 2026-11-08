import {useEffect,useRef,useState,type ComponentProps} from 'react';
import CompanionAvatar from '../world/CompanionAvatar';
/** Offscreen collection cards release their canvases rather than allocating 100 at once. */
export default function LazyCompanionAvatar(props:ComponentProps<typeof CompanionAvatar>){
 const root=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{const target=root.current;if(!target)return;if(typeof IntersectionObserver==='undefined'){setVisible(true);return;}const observer=new IntersectionObserver(entries=>setVisible(entries[0]?.isIntersecting??false),{rootMargin:'160px'});observer.observe(target);return()=>observer.disconnect();},[]);
 return <div ref={root} style={{width:'100%',height:'100%'}}>{visible?<CompanionAvatar {...props} thumbnail/>:<span aria-label={props.name||'동물'} role="img"/>}</div>;
}
