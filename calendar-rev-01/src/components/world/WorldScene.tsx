import React, { useEffect, useMemo, useState } from 'react';
import type { WorldProfile, WorldSceneType, WorldItem, WorldCompanion } from '../../types/world';
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
  onFrontItem?: (id: string) => void;
  onOpenInventory?: () => void;
  decorate?: boolean;
  onToggleDecorate?: () => void;
  catalog?: WorldItem[];
  companion?: WorldCompanion | null;
  avatarGender?: 'male' | 'female';
}

const assetRoot = '/world';
const seasonLabel: Record<string,string> = { spring:'봄', summer:'여름', autumn:'가을', winter:'겨울' };
const timeLabel: Record<string,string> = { day:'낮', night:'밤' };
const seasonByMonth = (month:number) => month <= 2 || month === 12 ? 'winter' : month <= 5 ? 'spring' : month <= 8 ? 'summer' : 'autumn';
const timeByHour = (hour:number) => hour < 7 || hour >= 20 ? 'night' : 'day';

const furnitureAssets = [
  ['sofa-basic','/furniture/livingroom/sofa.png','소파','sofa'], ['table','/furniture/livingroom/table.png','테이블','table'],
  ['chair','/furniture/livingroom/chair.png','의자','chair'], ['plant','/furniture/livingroom/plant_large.png','화분','plant'],
  ['cactus','/props/interior/plant.png','선인장','plant'], ['bookcase','/furniture/livingroom/bookcase.png','책장','bookcase'],
  ['tv','/furniture/livingroom/tv.png','TV','tv'], ['piano','/furniture/study_pc/piano.png','피아노','piano'],
  ['desk','/furniture/study_pc/computer_desk.png','컴퓨터 책상','desk'], ['bed','/furniture/bedroom/bed.png','침대','bed'],
  ['lamp','/furniture/seasonal/lamp.png','스탠드 조명','lamp'],
] as const;

export default function WorldScene({ profile, isOwner, onToggleScene, roomItems = [], onMoveItem, onScaleItem, onRemoveItem, onFrontItem, onOpenInventory, decorate = false, onToggleDecorate, catalog = [], companion = null, avatarGender = 'male', equipment = {} }: Props) {
  const now = new Date();
  const editMode = decorate;
  const [dragPositions, setDragPositions] = useState<Record<string,{x:number;y:number}>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(()=>setDragPositions({}),[roomItems]);
  const season = seasonByMonth(now.getMonth() + 1);
  const time = timeByHour(now.getHours());
  const scene: WorldSceneType = profile.scene_type;
  const sceneClass = useMemo(() => `${scene} ${season} ${time}`, [scene, season, time]);

  const getMeta = (itemId:string) => { const db = catalog.find((x:any)=>x.id===itemId || x.item_id===itemId); const hard = furnitureAssets.find(x=>x[0]===itemId); return { image: db?.image_url || (db?.image?.startsWith('/')?db.image:null) || (hard ? `${assetRoot}${hard[1]}` : `${assetRoot}/furniture/livingroom/sofa.png`), label: db?.name || (hard ? hard[2] : itemId), kind: ((db?.category==='커튼'||db?.subcategory==='커튼') ? 'curtain' : (db?.type || (hard ? hard[3] : 'props'))) }; };
  const positionOf = (item:RoomItem) => dragPositions[item.id] || { x:item.x, y:item.y };
  const startDrag = (e: React.PointerEvent<HTMLDivElement>, item: RoomItem) => {
    if (!editMode || !isOwner || !onMoveItem) return;
    e.preventDefault(); e.stopPropagation(); setSelectedId(item.id);
    const sceneEl = e.currentTarget.parentElement as HTMLElement; const rect = sceneEl.getBoundingClientRect();
    let latest=positionOf(item);
    const move = (ev: PointerEvent) => {latest={x:Math.max(4,Math.min(96,((ev.clientX-rect.left)/rect.width)*100)),y:Math.max(5,Math.min(92,((ev.clientY-rect.top)/rect.height)*100))};setDragPositions(prev=>({...prev,[item.id]:latest}));};
    const up = () => { window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); window.removeEventListener('pointercancel',up); onMoveItem(item.id,latest.x,latest.y); };
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',up); window.addEventListener('pointercancel',up);
  };

  return <section className={`world-scene-real cyworld-room ${sceneClass}`}>
    {scene === 'interior' ? <>
      <div className="cy-room-wall" aria-hidden="true"/>
      <div className="cy-room-floor" aria-hidden="true"/>
      <div className="cy-room-overlay" aria-hidden="true" />
    </> : <div className="scene-garden-field" aria-label="비어 있는 정원" />}

    {roomItems.filter(item=>(item.scene_type||'interior')===scene).map((item,index) => { const meta=getMeta(item.item_id); const pos=positionOf(item); return <div key={item.id} className={`scene-furniture ${meta.kind} ${meta.kind==='curtain'?'scene-room-curtain':''} ${editMode&&isOwner?'editing':''} ${selectedId===item.id?'selected':''}`} style={{left:`${pos.x}%`,top:`${pos.y}%`,transform:`translate(-50%,-50%) scale(${item.scale})`,zIndex:item.z_index??index+12}} title={meta.label} onPointerDown={e=>startDrag(e,item)} onClick={()=>editMode&&isOwner&&setSelectedId(item.id)}>
      <img src={meta.image} alt={meta.label}/>
      {editMode&&isOwner&&<span className="furniture-label">{meta.label}</span>}

    </div>; })}

    {editMode&&isOwner&&roomItems.filter(i=>i.id===selectedId&&(i.scene_type||'interior')===scene).map(item=><div key={item.id} className="furniture-controls" role="toolbar" aria-label="선택한 아이템 조절">
      <button type="button" onClick={()=>onScaleItem?.(item.id,Number(item.scale)+0.05)}>＋ 크게</button><button type="button" onClick={()=>onScaleItem?.(item.id,Number(item.scale)-0.05)}>－ 작게</button><button type="button" onClick={()=>onFrontItem?.(item.id)}>↥ 앞으로</button><button type="button" className="remove-item-btn" onClick={()=>onRemoveItem?.(item.id)}>📦 수거</button>
    </div>)}

    <div className="scene-character-wrap" title="내 미니미"><CharacterAvatar gender={avatarGender} equipment={equipment.avatar} className="scene-character" /></div>
    {companion && <div className="scene-companion" title={companion.name}><CompanionAvatar itemId={companion.item_id} equipment={equipment[companion.id]} name={companion.name} image={catalog.find(i=>i.id===companion.item_id)?.image_url}/><span className="companion-nameplate">{companion.name}</span></div>}
    <div className="scene-info"><b>{seasonLabel[season]} · {timeLabel[time]}</b><span>{scene==='interior'?'나만의 미니룸':'나만의 정원'}</span></div>

    {isOwner && <div className="scene-tools">
      <button onClick={()=>{setSelectedId(null);onToggleDecorate?.();}}>{editMode?'✓ 꾸미기 완료':'✏️ 방 꾸미기'}</button>
      {editMode&&<button onClick={onOpenInventory}>📦 내 아이템</button>}
      <button onClick={onToggleScene}>{scene==='interior'?'🌳 정원 보기':'🏠 집 안 보기'}</button>
    </div>}
  </section>;
}
