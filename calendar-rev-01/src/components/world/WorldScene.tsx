import SceneControls from './SceneControls';
import {useSceneDrag} from '../../lib/useSceneDrag';
import type {WindowUpdate} from './WindowPanel';
import type {CompanionLayout} from '../../types/world';
import RoomWindow from './RoomWindow';
import {isWindowFrame} from '../../data/windows';
import {companionSceneSize} from '../../data/companions';
import React, { useEffect, useMemo, useState } from 'react';
import type { WorldProfile, WorldSceneType, WorldItem, WorldCompanion } from '../../types/world';
import FurnitureArt from './FurnitureArt';
import {furnitureDesign} from '../../data/furniture';
import CharacterAvatar from './CharacterAvatar';
import CompanionAvatar from './CompanionAvatar';
import type { Equipment } from '../../data/wardrobe';

interface RoomItem { id: string; item_id: string; x: number; y: number; scale: number; z_index: number; scene_type?: WorldSceneType; }
interface Props {
  onWindow?:(values:WindowUpdate)=>void;
  onPetLayout?:(values:Partial<CompanionLayout>&{hide?:boolean})=>void;
  profile: WorldProfile;
  isOwner: boolean;
  onToggleScene?: () => void;
  equipment?: Record<string,Equipment>;
  roomItems?: RoomItem[];
  onMoveItem?: (id: string, x: number, y: number) => void;
  onScaleItem?: (id: string, scale: number) => void;
  onRemoveItem?: (id: string) => void;
  selectedItemId?:string|null;
  onSelectItem?:(id:string|null)=>void;
  onBackItem?:(id:string)=>void;
  busy?:boolean;
  saveState?:string;
  onFrontItem?: (id: string) => void;
  onOpenInventory?: () => void;
  decorate?: boolean;
  onToggleDecorate?: () => void;
  catalog?: WorldItem[];
  companion?: WorldCompanion | null;
  avatarGender?: 'male' | 'female';
}

const seasonLabel: Record<string,string> = { spring:'봄', summer:'여름', autumn:'가을', winter:'겨울' };
const timeLabel: Record<string,string> = { day:'낮', night:'밤' };
const seasonByMonth = (month:number) => month <= 2 || month === 12 ? 'winter' : month <= 5 ? 'spring' : month <= 8 ? 'summer' : 'autumn';
const timeByHour = (hour:number) => hour < 7 || hour >= 20 ? 'night' : 'day';

export default function WorldScene({ profile, isOwner, onToggleScene, roomItems = [], onMoveItem, onScaleItem, onRemoveItem, onFrontItem, onOpenInventory, decorate = false, onToggleDecorate, catalog = [], companion = null, avatarGender = 'male', equipment = {},selectedItemId,onSelectItem,onBackItem,busy=false,saveState='idle',onWindow,onPetLayout }: Props) {
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(timer);},[]);
  const editMode = decorate;
  const drag=useSceneDrag(editMode&&isOwner&&!busy,profile.user_id+profile.scene_type);
  const dragPositions=drag.positions;
  const [localSelectedId,setLocalSelectedId]=useState<string|null>(null);
  const selectedId=selectedItemId===undefined?localSelectedId:selectedItemId;
  const setSelectedId=(id:string|null)=>{setLocalSelectedId(id);onSelectItem?.(id);};
  useEffect(()=>{drag.reset();},[roomItems,profile.window_x,profile.window_y,companion?.scene_layout]);
  const season = seasonByMonth(now.getMonth() + 1);
  const time = timeByHour(now.getHours());
  const scene: WorldSceneType = profile.scene_type;
  const sceneClass = useMemo(() => `${scene} ${season} ${time}`, [scene, season, time]);

  const getMeta=(itemId:string)=>{
    const db=catalog.find(x=>x.id===itemId),item=db||{id:itemId,name:undefined,image:undefined,image_url:undefined};
    const design=furnitureDesign(item),label=db?.name||design?.name||itemId;
    return {item:{...item,name:label},design,label,kind:(db?.category==='커튼'||db?.subcategory==='커튼')?'curtain':design?.key||db?.type||'props'};
  };
  const positionOf = (item:RoomItem) => dragPositions[item.id] || { x:item.x, y:item.y };
  const startDrag=(e:React.PointerEvent<HTMLDivElement>,item:RoomItem)=>{if(!editMode||!isOwner||busy)return;setSelectedId(item.id);drag.start(e,item,p=>onMoveItem?.(item.id,p.x,p.y));};
  const petLayout={x:68,y:94,scale:1,z_index:16,...companion?.scene_layout?.[scene]};
  const petPosition=dragPositions['@pet']||petLayout;
  const windowPosition=dragPositions['@window']||{x:Number(profile.window_x)||50,y:Number(profile.window_y)||27};
  const petSize=companion?companionSceneSize(companion.item_id):[72,72];
  const petMinY=scene==='interior'?64:15;
  const petMove=(dx:number,dy:number)=>onPetLayout?.({x:Math.max(6,Math.min(94,petLayout.x+dx)),y:Math.max(petMinY,Math.min(94,petLayout.y+dy))});
  const windowMove=(dx:number,dy:number)=>onWindow?.({x:Math.max(15,Math.min(85,windowPosition.x+dx)),y:Math.max(14,Math.min(45,windowPosition.y+dy))});
  const keyMove=(e:React.KeyboardEvent,move:(dx:number,dy:number)=>void)=>{if(!editMode||!isOwner||busy)return;const deltas:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(deltas[e.key]){e.preventDefault();move(...deltas[e.key]);}else if(e.key===' '||e.key==='Enter')e.preventDefault();};

  const styleFor=(id:string,type:'wallpaper'|'floor')=>{
    const item=catalog.find(i=>i.id===id),url=item?.image_url||(item?.image?.startsWith('/')?item.image:undefined);
    if(url)return {backgroundImage:`url(${JSON.stringify(url)})`,backgroundSize:type==='wallpaper'?'240px 240px':'320px 320px'};
    if(id==='wallpaper-check')return {backgroundImage:'repeating-linear-gradient(0deg,#0000 0 28px,#c9b6c533 28px 30px),repeating-linear-gradient(90deg,#f7f0e8 0 28px,#c9b6c555 28px 30px)'};
    if(id==='wallpaper-flower')return {backgroundImage:'radial-gradient(ellipse at 30% 30%,#e6a5b488 0 4px,#0000 5px),radial-gradient(ellipse at 65% 65%,#9cbd9988 0 3px,#0000 4px)',backgroundSize:'40px 40px',backgroundColor:'#fff5ed'};
    if(id==='floor-check')return {backgroundImage:'conic-gradient(#ead3b2 25%,#ccb18b 0 50%,#ead3b2 0 75%,#ccb18b 0)',backgroundSize:'65px 65px'};
    return undefined;
  };
  return <><section className={`world-scene-real cyworld-room ${sceneClass}`}>
    {scene === 'interior' ? <>
      <div className="cy-room-wall" style={styleFor(profile.wallpaper_id,'wallpaper')} aria-hidden="true"/>
      <div className="cy-room-floor" style={styleFor(profile.floor_id,'floor')} aria-hidden="true"/>
      {profile.window_frame_id!==null&&<RoomWindow profile={{...profile,window_x:windowPosition.x,window_y:windowPosition.y}} editing={editMode&&isOwner} selected={selectedId==='@window'} onClick={()=>editMode&&isOwner&&setSelectedId('@window')} onKeyDown={e=>{setSelectedId('@window');keyMove(e,windowMove);}} onPointerDown={e=>{if(!editMode||!isOwner||busy)return;setSelectedId('@window');drag.start(e,{id:'@window',...windowPosition,minX:15,maxX:85,minY:14,maxY:45},p=>onWindow?.(p));}}/>}
      <div className="cy-room-overlay" aria-hidden="true" />
    </> : <div className="scene-garden-field" aria-label="비어 있는 정원" />}

    {roomItems.filter(item=>(item.scene_type||'interior')===scene&&!isWindowFrame(catalog.find(i=>i.id===item.item_id)||{id:item.item_id})).map((item,index) => { const meta=getMeta(item.item_id); const pos=positionOf(item); return <div key={item.id} className={`scene-furniture ${meta.kind} ${meta.kind==='curtain'?'scene-room-curtain':''} ${editMode&&isOwner?'editing':''} ${selectedId===item.id?'selected':''}`} style={{width:meta.design?.sceneSize[0],height:meta.design?.sceneSize[1],left:`${pos.x}%`,top:`${pos.y}%`,transform:`translate(-50%,-50%) scale(${item.scale})`,zIndex:item.z_index??index+12}} role={editMode&&isOwner?'button':undefined} tabIndex={editMode&&isOwner?0:undefined} aria-label={editMode&&isOwner?`${meta.label} 선택`:undefined} aria-pressed={editMode&&isOwner?selectedId===item.id:undefined} title={meta.label} onKeyDown={e=>{if(!editMode||!isOwner||busy)return;setSelectedId(item.id);if(e.key==='Enter'||e.key===' '){e.preventDefault();return;}const delta:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(delta[e.key]){e.preventDefault();const [x,y]=delta[e.key];onMoveItem?.(item.id,Math.max(4,Math.min(96,pos.x+x)),Math.max(5,Math.min(92,pos.y+y)));}}} onPointerDown={e=>startDrag(e,item)} onClick={()=>editMode&&isOwner&&setSelectedId(item.id)}>
      <FurnitureArt item={meta.item}/>
      {editMode&&isOwner&&<span className="furniture-label">{meta.label}</span>}

    </div>; })}



    <div className="scene-character-wrap" title="내 미니미"><CharacterAvatar gender={avatarGender} equipment={equipment.avatar} className="scene-character" /></div>
    {companion && <div className={`scene-companion ${editMode&&isOwner?'editing':''} ${selectedId==='@pet'?'selected':''}`} style={{width:petSize[0]*petLayout.scale,height:'auto','--companion-height':petSize[1]*petLayout.scale+'px',left:`clamp(${petSize[0]*petLayout.scale/2+6}px, ${petPosition.x}%, calc(100% - ${petSize[0]*petLayout.scale/2+6}px))`,top:`${petPosition.y}%`,bottom:'auto',transform:'translate(-50%,-100%)',zIndex:petLayout.z_index} as React.CSSProperties} title={companion.name} role={editMode&&isOwner?'button':undefined} tabIndex={editMode&&isOwner?0:undefined} aria-label={editMode&&isOwner?`${companion.name} 동물 선택`:undefined} aria-pressed={editMode&&isOwner?selectedId==='@pet':undefined} onClick={()=>editMode&&isOwner&&setSelectedId('@pet')} onKeyDown={e=>{setSelectedId('@pet');keyMove(e,petMove);}} onPointerDown={e=>{if(!editMode||!isOwner||busy)return;setSelectedId('@pet');drag.start(e,{id:'@pet',...petPosition,minX:6,maxX:94,minY:petMinY,maxY:94},p=>onPetLayout?.(p));}}><CompanionAvatar itemId={companion.item_id} equipment={equipment[companion.id]} name={companion.name} image={catalog.find(i=>i.id===companion.item_id)?.image_url} animate={!editMode}/><span className="companion-nameplate">{companion.name}</span></div>}

    <div className="scene-info"><b>{seasonLabel[season]} · {timeLabel[time]}</b><span>{scene==='interior'?'나만의 미니룸':'나만의 정원'}</span></div>

    {isOwner && <div className="scene-tools">
      <button disabled={busy} onClick={()=>{setSelectedId(null);onToggleDecorate?.();}}>{editMode?'✓ 꾸미기 완료':'✏️ 방 꾸미기'}</button>
      {editMode&&<button onClick={onOpenInventory}>📦 내 아이템</button>}
      <button disabled={busy} onClick={onToggleScene}>{scene==='interior'?'🌳 정원 보기':'🏠 집 안 보기'}</button>
    </div>}
  </section>
    {editMode&&isOwner&&selectedId==='@window'&&scene==='interior'&&profile.window_frame_id!==null&&<SceneControls name="원목 창문" scale={Number(profile.window_scale)||1} busy={busy} saveState={saveState} onClose={()=>setSelectedId(null)} onMove={windowMove} onScale={d=>onWindow?.({scale:Math.max(.6,Math.min(1.2,Number(profile.window_scale||1)+d))})} onRemove={()=>{onWindow?.({frame:null});setSelectedId(null);}}/>}
    {editMode&&isOwner&&selectedId==='@pet'&&companion&&<SceneControls name={companion.name} scale={petLayout.scale} busy={busy} saveState={saveState} onClose={()=>setSelectedId(null)} onMove={petMove} onScale={d=>onPetLayout?.({scale:Math.max(.6,Math.min(1.5,petLayout.scale+d))})} onFront={()=>onPetLayout?.({z_index:Math.min(60,Math.max(petLayout.z_index,...roomItems.map(i=>i.z_index),20)+1)})} onBack={()=>onPetLayout?.({z_index:Math.max(4,Math.min(petLayout.z_index,...roomItems.map(i=>i.z_index),20)-1)})} onRemove={()=>{onPetLayout?.({hide:true});setSelectedId(null);}} removeLabel="함께하기 해제"/>}
    {editMode&&isOwner&&roomItems.filter(i=>i.id===selectedId&&(i.scene_type||'interior')===scene).map(item=><SceneControls key={item.id} name={getMeta(item.item_id).label} scale={Number(item.scale)} busy={busy} saveState={saveState} onClose={()=>setSelectedId(null)} onMove={(dx,dy)=>onMoveItem?.(item.id,Math.max(4,Math.min(96,item.x+dx)),Math.max(5,Math.min(92,item.y+dy)))} onScale={d=>onScaleItem?.(item.id,Number(item.scale)+d)} onFront={()=>onFrontItem?.(item.id)} onBack={()=>onBackItem?.(item.id)} onRemove={()=>onRemoveItem?.(item.id)}/>)}

  </>;
}
