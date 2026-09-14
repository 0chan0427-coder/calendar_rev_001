import React, { useMemo, useState } from 'react';
import type { WorldProfile, WorldSceneType } from '../../types/world';

interface RoomItem { id: string; item_id: string; x: number; y: number; scale: number; z_index: number; }
interface Props {
  profile: WorldProfile;
  isOwner: boolean;
  onToggleScene: () => void;
  roomItems?: RoomItem[];
  onMoveItem?: (id: string, x: number, y: number) => void;
}

const assetRoot = '/world';
const seasonLabel: Record<string,string> = { spring:'봄', summer:'여름', autumn:'가을', winter:'겨울' };
const timeLabel: Record<string,string> = { morning:'아침', day:'낮', evening:'저녁', night:'밤', late_night:'심야' };
const seasonByMonth = (month:number) => month <= 2 || month === 12 ? 'winter' : month <= 5 ? 'spring' : month <= 8 ? 'summer' : 'autumn';
const timeByHour = (hour:number) => hour < 7 ? 'late_night' : hour < 11 ? 'morning' : hour < 17 ? 'day' : hour < 20 ? 'evening' : hour < 24 ? 'night' : 'late_night';

const furnitureAssets = [
  ['sofa-basic','/furniture/livingroom/sofa.png','소파'],
  ['table','/furniture/livingroom/table.png','테이블'],
  ['chair','/furniture/livingroom/chair.png','의자'],
  ['plant','/furniture/livingroom/plant_large.png','큰 화분'],
  ['cactus','/props/interior/plant.png','선인장'],
  ['bookcase','/furniture/livingroom/bookcase.png','책장'],
  ['tv','/furniture/livingroom/tv.png','TV'],
  ['piano','/furniture/study_pc/piano.png','피아노'],
  ['desk','/furniture/study_pc/computer_desk.png','컴퓨터 책상'],
  ['bed','/furniture/bedroom/bed.png','침대'],
] as const;

export default function WorldScene({ profile, isOwner, onToggleScene, roomItems = [], onMoveItem }: Props) {
  const now = new Date();
  const [editMode, setEditMode] = useState(false);
  const [dragPositions, setDragPositions] = useState<Record<string,{x:number;y:number}>>({});
  const season = seasonByMonth(now.getMonth() + 1);
  const time = timeByHour(now.getHours());
  const scene: WorldSceneType = profile.scene_type;
  const background = `${assetRoot}/backgrounds/${season}/${time}/background_01.png`;
  const sceneClass = useMemo(() => `${scene} ${season} ${time}`, [scene, season, time]);

  const movable = roomItems.length ? roomItems : [
    { id:'demo-sofa', item_id:'sofa-basic', x:18, y:68, scale:0.48, z_index:4 },
    { id:'demo-plant', item_id:'cactus', x:78, y:67, scale:0.34, z_index:5 },
  ];
  const getAsset = (itemId:string) => furnitureAssets.find(x => x[0] === itemId)?.[1] || furnitureAssets[0][1];
  const getName = (itemId:string) => furnitureAssets.find(x => x[0] === itemId)?.[2] || '가구';
  const positionOf = (item:RoomItem) => dragPositions[item.id] || { x:item.x, y:item.y };

  return (
    <section className={`world-scene-real ${sceneClass}`}>
      <img className="scene-background" src={background} alt="미니홈 배경" />

      {scene === 'exterior' && <div className="scene-garden-overlay"><img src={`${assetRoot}/garden/garden/${season}_garden.png`} alt="계절 정원" /></div>}

      <div className="scene-atmosphere" aria-hidden="true">
        <span>{season === 'spring' ? '✿' : season === 'summer' ? '✦' : season === 'autumn' ? '🍂' : '❄'}</span>
        <span>{time === 'night' || time === 'late_night' ? '✦　☾　✦' : '☁　☁'}</span>
      </div>

      {scene === 'interior' && movable.map((item, index) => (
        <button
          key={item.id}
          className={`scene-furniture ${editMode && isOwner ? 'editing' : ''}`}
          style={{ left:`${positionOf(item).x}%`, top:`${positionOf(item).y}%`, transform:`translate(-50%,-50%) scale(${item.scale})`, zIndex:item.z_index ?? index + 4 }}
          title={getName(item.item_id)}
          onPointerDown={(e) => {
            if (!editMode || !isOwner || !onMoveItem) return;
            e.preventDefault();
            const sceneEl = e.currentTarget.parentElement as HTMLElement;
            const rect = sceneEl.getBoundingClientRect();
            const move = (ev: PointerEvent) => setDragPositions(prev => ({...prev, [item.id]: {
              x: Math.max(5, Math.min(95, ((ev.clientX-rect.left)/rect.width)*100)),
              y: Math.max(5, Math.min(95, ((ev.clientY-rect.top)/rect.height)*100))
            }}));
            const up = () => {
              window.removeEventListener('pointermove', move);
              window.removeEventListener('pointerup', up);
              const pos = positionOf(item);
              onMoveItem(item.id, pos.x, pos.y);
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
          }}
        >
          <img src={`${assetRoot}${getAsset(item.item_id)}`} alt={getName(item.item_id)} />
          {editMode && isOwner && <span className="furniture-label">{getName(item.item_id)}</span>}
        </button>
      ))}

      <div className="scene-character-wrap" title="내 캐릭터">
        <img className="scene-character" src={`${assetRoot}/characters/base/character_01.png`} alt="내 캐릭터" />
      </div>
      <div className="scene-pet" title="동반 동물"><img src={`${assetRoot}/animals/cats/cat.png`} alt="고양이" /></div>
      <div className="scene-info"><b>{seasonLabel[season]} · {timeLabel[time]}</b><span>{scene === 'interior' ? '나만의 방' : '나만의 정원'}</span></div>

      {isOwner && <div className="scene-tools">
        <button onClick={() => setEditMode(v=>!v)}>{editMode ? '✓ 꾸미기 완료' : '✏️ 방 꾸미기'}</button>
        <button onClick={onToggleScene}>{scene === 'interior' ? '🌳 정원 보기' : '🏠 집 안 보기'}</button>
      </div>}
    </section>
  );
}
