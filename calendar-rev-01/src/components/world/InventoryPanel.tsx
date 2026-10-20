import WindowPanel from './WindowPanel';
import type {WindowUpdate} from './WindowPanel';
import {isWindowFrame,WINDOW_SCENERY} from '../../data/windows';
import {useMemo,useState} from 'react';
import type {WorldCompanion,WorldItem,WorldProfile,WorldRoomItem} from '../../types/world';
import {WEARABLES,WEAR_SLOTS,normalizeAvatarEquipment,isCat} from '../../data/wardrobe';
import type {Equipment,WearSlot,Wearable} from '../../data/wardrobe';
import FurnitureArt from './FurnitureArt';
import WearableThumbnail from './WearableThumbnail';
import CompanionAvatar from './CompanionAvatar';

type Tab='avatar'|'furniture'|'animals'|'background'|'window';
interface Props {
 inventory:{item_id:string;quantity:number}[];owned:string[];catalog:WorldItem[];roomItems:WorldRoomItem[];
 companions:WorldCompanion[];equipment:Record<string,Equipment>;profile:WorldProfile;gender:'male'|'female';
 error:string;busy:boolean;saveState:string;selectedId:string|null;
 onRefund:()=>void;
 onWindow:(v:WindowUpdate)=>void;
 onClose:()=>void;onRefresh:()=>void;onShop:()=>void;onGender:(g:'male'|'female')=>void;
 onWear:(item?:Wearable)=>void;onPetWear:(c:WorldCompanion)=>void;onPet:(c:WorldCompanion)=>void;onPets:()=>void;
 onPlace:(item:WorldItem)=>void;onSelect:(item:WorldRoomItem)=>void;onRemove:(id:string)=>void;
 onScene:(scene:'interior'|'exterior')=>void;onBackground:(item:WorldItem)=>void;
}
export default function InventoryPanel(p:Props){
 const [tab,setTab]=useState<Tab>('avatar'),[query,setQuery]=useState(''),[slot,setSlot]=useState<WearSlot|''>(''),[filter,setFilter]=useState('all');
 const match=(name:string)=>name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
 const eq=normalizeAvatarEquipment(p.equipment.avatar);
 const ownedSet=new Set(p.owned);
 const clothes=WEARABLES.filter(i=>i.target==='avatar'&&(!i.hidden||ownedSet.has(i.id))&&(i.price===0||ownedSet.has(i.id))&&(!i.name.includes('해제')));
 const amounts=useMemo(()=>{
  const result=new Map<string,{available:number;placed:WorldRoomItem[]}>();
  for(const i of p.inventory)result.set(i.item_id,{available:Math.max(0,Number(i.quantity)||0),placed:[]});
  for(const i of p.roomItems){const row=result.get(i.item_id)||{available:0,placed:[]};row.placed.push(i);result.set(i.item_id,row);}
  for(const item of p.catalog)if(item.price===0&&['wallpaper','floor'].includes(item.type)&&!result.has(item.id))result.set(item.id,{available:1,placed:[]});
  return result;
 },[p.inventory,p.roomItems,p.catalog]);
 const meta=(id:string):WorldItem=>p.catalog.find(i=>i.id===id)||{id,name:`아이템 ${id}`,type:'unknown',image:'📦',price:0};
 const entries=[...amounts].map(([id,row])=>({item:meta(id),...row})).filter(r=>r.available+r.placed.length>0);
 const furniture=entries.filter(r=>!isWindowFrame(r.item)&&(['room','garden'].includes(r.item.placement_type||'')||['furniture','props','unknown'].includes(r.item.type)||r.placed.length>0));
 const backgrounds=entries.filter(r=>!furniture.includes(r)&&r.item.type!=='animal'&&!isWindowFrame(r.item)&&!WINDOW_SCENERY.some(v=>v.id===r.item.id));
 const tabList:[Tab,string,number][]=[['avatar','미니미',clothes.length],['furniture','가구·소품',furniture.length],['animals','동물',p.companions.length],['window','창문·풍경',WINDOW_SCENERY.filter(v=>v.price===0||p.inventory.some(i=>i.item_id===v.id&&i.quantity>0)).length],['background','배경·기타',backgrounds.length]];
 const changeTab=(t:Tab)=>{setTab(t);setQuery('');setFilter('all');};
 const art=(item:WorldItem)=><div className="inventory-art"><FurnitureArt item={item}/></div>;
 const empty=<div className="inventory-empty"><b>표시할 아이템이 없어요.</b><p>{query||filter!=='all'||slot?'검색어나 필터를 바꿔보세요.':'구매한 품목이 여기에 모여요.'}</p><button onClick={()=>{setQuery('');setFilter('all');setSlot('');}}>필터 초기화</button><button onClick={p.onShop}>포인트샵</button></div>;
 const shownClothes=clothes.filter(i=>(!slot||i.slot===slot)&&match(i.name)&&(filter!=='using'||eq[i.slot]===i.id)&&(filter!=='purchased'||i.price>0));
 const shownFurniture=furniture.filter(r=>match(r.item.name)&&(filter!=='available'||r.available>0)&&(filter!=='placed'||r.placed.length>0));
 return <aside className="decorate-panel side-item-panel inventory-panel" aria-label="내 아이템 관리">
  <div className="inventory-heading"><div><small>MY COLLECTION</small><h3>내 아이템</h3><p>구매한 옷부터 배치한 가구까지</p></div><button onClick={p.onClose} disabled={p.busy}>닫기</button></div>
  <button className="inventory-wide refund-open" onClick={p.onRefund}>구매·환불 내역</button>
  <div className="inventory-tabs" role="group" aria-label="아이템 종류">{tabList.map(([id,label,count])=><button key={id} aria-pressed={tab===id} onClick={()=>changeTab(id)}>{label}<small>{count}</small></button>)}</div>
  <label className="inventory-search"><span>이름 검색</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="아이템 이름으로 찾기"/></label>
  {p.error&&<div className="inventory-error" role="alert">{p.error}<button onClick={p.onRefresh}>다시 불러오기</button></div>}
  {tab==='avatar'&&<>
   <div className="inventory-filters"><select aria-label="미니미 부위" value={slot} onChange={e=>setSlot(e.target.value as WearSlot|'')}><option value="">모든 부위</option>{WEAR_SLOTS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><select aria-label="미니미 상태" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">전체 보유</option><option value="purchased">구매한 아이템</option><option value="using">착용 중</option></select></div>
   <div className="inventory-avatar-tools"><button className="wardrobe-open" onClick={()=>p.onWear()}>미니미 옷·헤어·장식 꾸미기</button><div className="inventory-gender" role="group" aria-label="미니미 성별"><button aria-pressed={p.gender==='male'} onClick={()=>p.onGender('male')}>남성</button><button aria-pressed={p.gender==='female'} onClick={()=>p.onGender('female')}>여성</button></div></div>
   <p className="inventory-caption">{shownClothes.length}종 · 기본 제공 품목도 함께 보여요.</p>
   <div className="inventory-grid">{shownClothes.map(i=><article key={i.id} className={eq[i.slot]===i.id?'in-use':''}><WearableThumbnail item={i} gender={p.gender}/><b>{i.name}</b><small>{WEAR_SLOTS.find(s=>s[0]===i.slot)?.[1]} · {i.price===0?'기본 제공':'구매 보유'}</small><span className="inventory-badge">{eq[i.slot]===i.id?'착용 중':'보유'}</span><button onClick={()=>p.onWear(i)}>{eq[i.slot]===i.id?'착용 확인':'입어보기'}</button></article>)}</div>{!shownClothes.length&&empty}
  </>}
  {tab==='furniture'&&<>
   <div className="inventory-filters"><select aria-label="가구 상태" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">전체 보유</option><option value="available">배치 가능</option><option value="placed">배치 중</option></select><span className="inventory-save" role="status">{p.saveState==='saving'?'저장 중…':p.saveState==='error'?'저장 실패 · 다시 시도해주세요':p.saveState==='saved'?'저장됨':'변경 시 자동 저장'}</span></div>
   <p className="inventory-caption">현재 {p.profile.scene_type==='interior'?'집 안':'정원'} · 배치된 항목을 선택하면 방에서 조절할 수 있어요.</p>
   <div className="inventory-grid">{shownFurniture.map(({item,available,placed})=>{const scene=item.placement_type==='garden'?'exterior':'interior',wrong=scene!==p.profile.scene_type,valid=['room','garden'].includes(item.placement_type||'');return <article key={item.id}>{art(item)}<b>{item.name}</b><small>전체 {available+placed.length} · 배치 {placed.length} · 남음 {available}</small><span className="inventory-badge">{scene==='exterior'?'정원용':'집 안용'}</span><button disabled={p.busy||!available||!valid||item.is_active===false} onClick={()=>wrong?p.onScene(scene):p.onPlace(item)}>{!valid?'배치 정보 없음':item.is_active===false?'판매 종료 · 수거 가능':!available?'모두 배치 중':wrong?(scene==='exterior'?'정원으로 이동':'집 안으로 이동'):'배치하기'}</button>{placed.map((r,index)=><div className="inventory-placement" key={r.id}><button disabled={p.busy} aria-pressed={p.selectedId===r.id} onClick={()=>p.onSelect(r)}>{(r.scene_type||'interior')==='interior'?'집 안':'정원'} #{index+1} 선택</button><button disabled={p.busy} onClick={()=>p.onRemove(r.id)}>수거</button></div>)}</article>})}</div>{!shownFurniture.length&&empty}
  </>}
  {tab==='animals'&&<><button className="inventory-wide" onClick={p.onPets}>동물 이름·꾸미기 관리</button><div className="inventory-grid">{p.companions.filter(c=>match(c.name)||match(meta(c.item_id).name)).map(c=><article key={c.id}><div className="inventory-pet"><CompanionAvatar itemId={c.item_id} image={meta(c.item_id).image_url} name={c.name} equipment={p.equipment[c.id]}/></div><b>{c.name}</b><small>{meta(c.item_id).name}</small><span className="inventory-badge">{c.is_active?'함께하는 중':'보유'}</span><button disabled={c.is_active||p.busy} onClick={()=>p.onPet(c)}>{c.is_active?'현재 함께함':'함께하기'}</button>{isCat(c.item_id)&&<button onClick={()=>p.onPetWear(c)}>꾸미기</button>}</article>)}</div>{!p.companions.some(c=>match(c.name)||match(meta(c.item_id).name))&&empty}</>}
  {tab==='window'&&<WindowPanel profile={p.profile} inventory={p.inventory} busy={p.busy} onSave={p.onWindow} onShop={p.onShop}/>}
  {tab==='background'&&<><p className="inventory-caption">벽지와 바닥은 집 안에 적용돼요.</p><div className="inventory-grid">{backgrounds.filter(r=>match(r.item.name)).map(({item,available})=>{const supported=['wallpaper','floor'].includes(item.type),using=(item.type==='wallpaper'?p.profile.wallpaper_id:p.profile.floor_id)===item.id;return <article key={item.id}>{art(item)}<b>{item.name}</b><small>{item.price===0?'기본 제공':`보유 ${available}개`}</small><span className="inventory-badge">{using?'사용 중':'보유'}</span><button disabled={!supported||using||p.busy} onClick={()=>p.onBackground(item)}>{!supported?'보관 중 · 적용 기능 준비 중':using?'사용 중':'집 안에 적용'}</button></article>})}</div>{!backgrounds.some(r=>match(r.item.name))&&empty}</>}
 </aside>;
}
