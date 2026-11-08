import type {CSSProperties,PointerEventHandler,KeyboardEventHandler} from 'react';
import type {WorldProfile} from '../../types/world';
import {interiorDesign} from '../../data/roomSkins';
import WorldImageCanvas from './WorldImageCanvas';
import SceneryArt from './SceneryArt';
export default function RoomWindow({profile,editing=false,selected=false,onPointerDown,onKeyDown,onClick}:{profile:WorldProfile;editing?:boolean;selected?:boolean;onPointerDown?:PointerEventHandler<HTMLDivElement>;onKeyDown?:KeyboardEventHandler<HTMLDivElement>;onClick?:()=>void}){
 const design=interiorDesign(profile.window_frame_id),opening=design?.opening;
 const scale=Math.max(.6,Math.min(1.2,Number(profile.window_scale)||1));
 const x=Math.max(15,Math.min(85,Number(profile.window_x)||50)),y=Math.max(14,Math.min(45,Number(profile.window_y)||27));
 return <div className={`room-window-slot ${editing?'editing':''} ${selected?'selected':''}`} onPointerDown={onPointerDown} onKeyDown={onKeyDown} onClick={onClick} tabIndex={editing?0:undefined} aria-pressed={editing?selected:undefined} style={{'--window-width':`min(${260*scale}px,${70*scale}%)`,left:`clamp(calc(var(--window-width) / 2 + 6px), ${x}%, calc(100% - var(--window-width) / 2 - 6px))`,top:`${y}%`,aspectRatio:design?`${design.width}/${design.height}`:undefined} as CSSProperties} role={editing?'button':'img'} aria-label={editing?'창문 선택':design?.name||'창밖 풍경이 보이는 원목 창문'}>
 <div className="room-window-view" style={opening?{inset:'auto',left:opening[0]+'%',top:opening[1]+'%',width:opening[2]+'%',height:opening[3]+'%'}:undefined}><SceneryArt id={profile.window_scenery_id} gardenId={profile.garden_theme_id}/></div><WorldImageCanvas className="room-window-frame" src={design?.image||'/world/window-views/window-oak.png'} label={design?.name||'기본 원목 창문'}/>
 </div>;
}
