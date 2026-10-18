import {useSyncExternalStore} from 'react';

const key='ssiksik-avatar-motion';
const event='ssiksik-avatar-motion-change';
function snapshot(){
 try{return window.localStorage.getItem(key)!=='off';}catch{return true;}
}
function subscribe(callback:()=>void){
 const storage=(e:StorageEvent)=>{if(e.key===key||e.key===null)callback();};
 window.addEventListener(event,callback);
 window.addEventListener('storage',storage);
 return ()=>{window.removeEventListener(event,callback);window.removeEventListener('storage',storage);};
}
export const useAvatarMotionEnabled=()=>useSyncExternalStore(subscribe,snapshot,()=>false);
export function setAvatarMotionEnabled(enabled:boolean){
 try{window.localStorage.setItem(key,enabled?'on':'off');}catch{return;}
 window.dispatchEvent(new Event(event));
}
