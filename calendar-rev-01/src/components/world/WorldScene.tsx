import RoomWindow from './RoomWindow';
import {isWindowFrame} from '../../data/windows';
import {companionSceneSize} from '../../data/companions';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { WorldProfile, WorldSceneType, WorldItem, WorldCompanion } from '../../types/world';
import FurnitureArt from './FurnitureArt';
import {furnitureDesign} from '../../data/furniture';
import CharacterAvatar from './CharacterAvatar';
import CompanionAvatar from './CompanionAvatar';
import type { Equipment } from '../../data/wardrobe';

interface RoomItem { id: string; item_id: string; x: number; y: number; scale: number; z_index: number; scene_type?: WorldSceneType; }
interface Props {
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

export default function WorldScene({ profile, isOwner, onToggleScene, roomItems = [], onMoveItem, onScaleItem, onRemoveItem, onFrontItem, onOpenInventory, decorate = false, onToggleDecorate, catalog = [], companion = null, avatarGender = 'male', equipment = {},selectedItemId,onSelectItem,onBackItem,busy=false,saveState='idle' }: Props) {
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(timer);},[]);
  const editMode = decorate;
  const [dragPositions, setDragPositions] = useState<Record<string,{x:number;y:number}>>({});
  const [localSelectedId,setLocalSelectedId]=useState<string|null>(null);
  const selectedId=selectedItemId===undefined?localSelectedId:selectedItemId;
  const setSelectedId=(id:string|null)=>{setLocalSelectedId(id);onSelectItem?.(id);};
  const cancelDrag=useRef<(()=>void)|null>(null);
  useEffect(()=>()=>cancelDrag.current?.(),[]);
  useEffect(()=>{if(!decorate)cancelDrag.current?.();},[decorate]);
  useEffect(()=>setDragPositions({}),[roomItems]);
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
  const startDrag = (e: React.PointerEvent<HTMLDivElement>, item: RoomItem) => {
    if (!editMode || !isOwner || !onMoveItem || busy) return;
    e.preventDefault(); e.stopPropagation(); setSelectedId(item.id);
    const sceneEl = e.currentTarget.parentElement as HTMLElement; const rect = sceneEl.getBoundingClientRect();
    cancelDrag.current?.();
    const initial=positionOf(item),offsetX=e.clientX-(rect.left+initial.x/100*rect.width),offsetY=e.clientY-(rect.top+initial.y/100*rect.height);
    let latest=initial;
    const move = (ev: PointerEvent) => {latest={x:Math.max(4,Math.min(96,((ev.clientX-rect.left-offsetX)/rect.width)*100)),y:Math.max(5,Math.min(92,((ev.clientY-rect.top-offsetY)/rect.height)*100))};setDragPositions(prev=>({...prev,[item.id]:latest}));};
    const cleanup=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);cancelDrag.current=null;};
    const cancel=()=>{cleanup();setDragPositions(prev=>{const n={...prev};delete n[item.id];return n;});};
    const up=()=>{cleanup();if(Math.abs(latest.x-initial.x)+Math.abs(latest.y-initial.y)>.05)onMoveItem(item.id,latest.x,latest.y);};
    cancelDrag.current=cancel;
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',up); window.addEventListener('pointercancel',cancel);
  };

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
      {profile.window_frame_id!==null&&<RoomWindow profile={profile}/>}
      <div className="cy-room-overlay" aria-hidden="true" />
    </> : <div className="scene-garden-field" aria-label="비어 있는 정원" />}

    {roomItems.filter(item=>(item.scene_type||'interior')===scene&&!isWindowFrame(catalog.find(i=>i.id===item.item_id)||{id:item.item_id})).map((item,index) => { const meta=getMeta(item.item_id); const pos=positionOf(item); return <div key={item.id} className={`scene-furniture ${meta.kind} ${meta.kind==='curtain'?'scene-room-curtain':''} ${editMode&&isOwner?'editing':''} ${selectedId===item.id?'selected':''}`} style={{width:meta.design?.sceneSize[0],height:meta.design?.sceneSize[1],left:`${pos.x}%`,top:`${pos.y}%`,transform:`translate(-50%,-50%) scale(${item.scale})`,zIndex:item.z_index??index+12}} role={editMode&&isOwner?'button':undefined} tabIndex={editMode&&isOwner?0:undefined} aria-label={editMode&&isOwner?`${meta.label} 선택`:undefined} aria-pressed={editMode&&isOwner?selectedId===item.id:undefined} title={meta.label} onKeyDown={e=>{if(!editMode||!isOwner||busy)return;setSelectedId(item.id);if(e.key==='Enter'||e.key===' '){e.preventDefault();return;}const delta:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(delta[e.key]){e.preventDefault();const [x,y]=delta[e.key];onMoveItem?.(item.id,Math.max(4,Math.min(96,pos.x+x)),Math.max(5,Math.min(92,pos.y+y)));}}} onPointerDown={e=>startDrag(e,item)} onClick={()=>editMode&&isOwner&&setSelectedId(item.id)}>
      <FurnitureArt item={meta.item}/>
      {editMode&&isOwner&&<span className="furniture-label">{meta.label}</span>}

    </div>; })}



    <div className="scene-character-wrap" title="내 미니미"><CharacterAvatar gender={avatarGender} equipment={equipment.avatar} className="scene-character" /></div>
    {companion && <div className="scene-companion" style={{width:companionSceneSize(companion.item_id)[0],height:'auto','--companion-height':companionSceneSize(companion.item_id)[1]+'px'} as React.CSSProperties} title={companion.name}><CompanionAvatar itemId={companion.item_id} equipment={equipment[companion.id]} name={companion.name} image={catalog.find(i=>i.id===companion.item_id)?.image_url}/><span className="companion-nameplate">{companion.name}</span></div>}
    <div className="scene-info"><b>{seasonLabel[season]} · {timeLabel[time]}</b><span>{scene==='interior'?'나만의 미니룸':'나만의 정원'}</span></div>

    {isOwner && <div className="scene-tools">
      <button disabled={busy} onClick={()=>{setSelectedId(null);onToggleDecorate?.();}}>{editMode?'✓ 꾸미기 완료':'✏️ 방 꾸미기'}</button>
      {editMode&&<button onClick={onOpenInventory}>📦 내 아이템</button>}
      <button disabled={busy} onClick={onToggleScene}>{scene==='interior'?'🌳 정원 보기':'🏠 집 안 보기'}</button>
    </div>}
  </section>
    {editMode&&isOwner&&roomItems.filter(i=>i.id===selectedId&&(i.scene_type||'interior')===scene).map(item=><div key={item.id} className="furniture-controls" role="toolbar" aria-label="선택한 아이템 조절">
      <div className="furniture-control-title"><b>{getMeta(item.item_id).label}</b><span>{Math.round(Number(item.scale)*100)}% · {saveState==='saving'?'저장 중…':saveState==='error'?'저장 실패':saveState==='saved'?'저장됨':'자동 저장'}</span><button onClick={()=>setSelectedId(null)} aria-label="가구 선택 해제">×</button></div>
      <div className="furniture-control-actions">
      <button disabled={busy} onClick={()=>onMoveItem?.(item.id,Math.max(4,item.x-1),item.y)} aria-label="왼쪽으로 이동">←</button><button disabled={busy} onClick={()=>onMoveItem?.(item.id,Math.min(96,item.x+1),item.y)} aria-label="오른쪽으로 이동">→</button><button disabled={busy} onClick={()=>onMoveItem?.(item.id,item.x,Math.max(5,item.y-1))} aria-label="위로 이동">↑</button><button disabled={busy} onClick={()=>onMoveItem?.(item.id,item.x,Math.min(92,item.y+1))} aria-label="아래로 이동">↓</button>
      <button disabled={busy} onClick={()=>onScaleItem?.(item.id,Number(item.scale)+0.05)}>＋ 크게</button><button disabled={busy} onClick={()=>onScaleItem?.(item.id,Number(item.scale)-0.05)}>－ 작게</button><button disabled={busy} onClick={()=>onFrontItem?.(item.id)}>맨 앞으로</button><button disabled={busy} onClick={()=>onBackItem?.(item.id)}>맨 뒤로</button><button disabled={busy} className="remove-item-btn" onClick={()=>onRemoveItem?.(item.id)}>수거</button>
      </div>
    </div>)}
  </>;
}
