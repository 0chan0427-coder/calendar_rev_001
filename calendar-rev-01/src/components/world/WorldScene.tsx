import React, { useMemo, useState } from 'react';
import type { WorldProfile, WorldSceneType } from '../../types/world';

interface RoomItem { id: string; item_id: string; x: number; y: number; scale: number; z_index: number; }
interface Props {
  profile: WorldProfile;
  isOwner: boolean;
  onToggleScene: () => void;
  roomItems?: RoomItem[];
  onMoveItem?: (id: string, x: number, y: number) => void;
  onScaleItem?: (id: string, scale: number) => void;
  onRemoveItem?: (id: string) => void;
  onFrontItem?: (id: string) => void;
  onOpenInventory?: () => void;
  decorate?: boolean;
  onToggleDecorate?: () => void;
}

const assetRoot = '/world';
const seasonLabel: Record<string,string> = { spring:'봄', summer:'여름', autumn:'가을', winter:'겨울' };
const timeLabel: Record<string,string> = { morning:'아침', day:'낮', evening:'저녁', night:'밤', late_night:'심야' };
const seasonByMonth = (month:number) => month <= 2 || month === 12 ? 'winter' : month <= 5 ? 'spring' : month <= 8 ? 'summer' : 'autumn';
const timeByHour = (hour:number) => hour < 7 ? 'late_night' : hour < 11 ? 'morning' : hour < 17 ? 'day' : hour < 20 ? 'evening' : 'night';

const furnitureAssets = [
  ['sofa-basic','/furniture/livingroom/sofa.png','소파','sofa'],
  ['table','/furniture/livingroom/table.png','테이블','table'],
  ['chair','/furniture/livingroom/chair.png','의자','chair'],
  ['plant','/furniture/livingroom/plant_large.png','화분','plant'],
  ['cactus','/props/interior/plant.png','선인장','plant'],
  ['bookcase','/furniture/livingroom/bookcase.png','책장','bookcase'],
  ['tv','/furniture/livingroom/tv.png','TV','tv'],
  ['piano','/furniture/study_pc/piano.png','피아노','piano'],
  ['desk','/furniture/study_pc/computer_desk.png','컴퓨터 책상','desk'],
  ['bed','/furniture/bedroom/bed.png','침대','bed'],
  ['lamp','/furniture/seasonal/lamp.png','스탠드 조명','lamp'],
] as const;

export default function WorldScene({ profile, isOwner, onToggleScene, roomItems = [], onMoveItem, onScaleItem, onRemoveItem, onFrontItem, decorate = false, onOpenInventory, onToggleDecorate }: Props) {
  const now = new Date();
  const editMode = decorate;
  const [dragPositions, setDragPositions] = useState<Record<string,{x:number;y:number}>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const season = seasonByMonth(now.getMonth() + 1);
  const time = timeByHour(now.getHours());
  const scene: WorldSceneType = profile.scene_type;
  const background = `${assetRoot}/backgrounds/empty-gardenwindow/${season}_${time}.png`;
  const sceneClass = useMemo(() => `${scene} ${season} ${time}`, [scene, season, time]);

  const getMeta = (itemId:string) => furnitureAssets.find(x => x[0] === itemId) || furnitureAssets[0];
  const positionOf = (item:RoomItem) => dragPositions[item.id] || { x:item.x, y:item.y };

  const startDrag = (e: React.PointerEvent<HTMLButtonElement>, item: RoomItem) => {
    if (!editMode || !isOwner || !onMoveItem) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    const sceneEl = e.currentTarget.parentElement as HTMLElement;
    const rect = sceneEl.getBoundingClientRect();
    const move = (ev: PointerEvent) => setDragPositions(prev => ({...prev, [item.id]: {
      x: Math.max(4, Math.min(96, ((ev.clientX-rect.left)/rect.width)*100)),
      y: Math.max(5, Math.min(92, ((ev.clientY-rect.top)/rect.height)*100))
    }}));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const pos = positionOf(item);
      onMoveItem(item.id, pos.x, pos.y);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <section className={`world-scene-real ${sceneClass}`}>
      {scene === 'interior' ? <img className="scene-background" src={background} alt="미니홈 빈 방 배경" /> : <div className="scene-garden-field" aria-label="비어 있는 정원" />}
      {scene === 'interior' && <div className="scene-floor-light" aria-hidden="true" />}
      {scene === 'interior' && roomItems.map((item, index) => {
        const meta = getMeta(item.item_id);
        const kind = meta[3];
        const pos = positionOf(item);
        return <div
          key={item.id}
          className={`scene-furniture ${kind} ${editMode && isOwner ? 'editing' : ''} ${selectedId === item.id ? 'selected' : ''}`}
          style={{ left:`${pos.x}%`, top:`${pos.y}%`, transform:`translate(-50%,-50%) scale(${item.scale})`, zIndex:item.z_index ?? index + 12 }}
          title={meta[2]}
          onPointerDown={(e) => startDrag(e,item)}
          onClick={() => editMode && isOwner && setSelectedId(item.id)}
          role={editMode && isOwner ? "button" : undefined}
          tabIndex={editMode && isOwner ? 0 : undefined}
        >
          <img src={`${assetRoot}${meta[1]}`} alt={meta[2]} />
          {editMode && isOwner && <span className="furniture-label">{meta[2]}</span>}
          {editMode && isOwner && selectedId === item.id && <span className="furniture-controls" onPointerDown={e=>e.stopPropagation()}>
            <button type="button" onClick={()=>onScaleItem?.(item.id, Math.min(1.1, Number(item.scale)+0.05))}>＋ 크게</button>
            <button type="button" onClick={()=>onScaleItem?.(item.id, Math.max(0.25, Number(item.scale)-0.05))}>－ 작게</button>
            <button type="button" onClick={()=>onFrontItem?.(item.id)}>↥ 앞으로</button>
            <button type="button" className="remove-item-btn" onClick={()=>onRemoveItem?.(item.id)}>📦 수거</button>
          </span>}
        </div>;
      })}

      <div className={`scene-character-wrap ${scene === 'exterior' ? 'garden-character' : ''}`} title="내 캐릭터">
        <img className="scene-character" src={`${assetRoot}/characters/base/character_01.png`} alt="내 캐릭터" />
      </div>
      <div className="scene-info"><b>{seasonLabel[season]} · {timeLabel[time]}</b><span>{scene === 'interior' ? '나만의 방' : '나만의 정원'}</span></div>

      {isOwner && <div className="scene-tools">
        <button onClick={() => {setSelectedId(null); onToggleDecorate?.();}}>{editMode ? '✓ 꾸미기 완료' : '✏️ 방 꾸미기'}</button>
        {editMode && <button onClick={onOpenInventory}>📦 아이템 목록</button>}
        <button onClick={onToggleScene}>{scene === 'interior' ? '🌳 정원 보기' : '🏠 집 안 보기'}</button>
      </div>}
    </section>
  );
}
