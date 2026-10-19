import type {CSSProperties} from 'react';
import type {WorldProfile} from '../../types/world';
import {sceneryImage} from '../../data/windows';
export default function RoomWindow({profile}:{profile:WorldProfile}){
 const scale=Math.max(.6,Math.min(1.2,Number(profile.window_scale)||1));
 const x=Math.max(15,Math.min(85,Number(profile.window_x)||50)),y=Math.max(14,Math.min(45,Number(profile.window_y)||27));
 return <div className="room-window-slot" style={{'--window-width':`min(${260*scale}px,${70*scale}%)`,left:`clamp(calc(var(--window-width) / 2 + 6px), ${x}%, calc(100% - var(--window-width) / 2 - 6px))`,top:`${y}%`} as CSSProperties} role="img" aria-label="창밖 풍경이 보이는 원목 창문">
 <div className="room-window-view"><img src={sceneryImage(profile.window_scenery_id)} alt=""/></div><img className="room-window-frame" src="/world/window-views/window-oak.png" alt=""/>
 </div>;
}
