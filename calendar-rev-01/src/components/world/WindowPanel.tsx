import type {WorldProfile} from '../../types/world';
import {WINDOW_SCENERY,sceneryImage} from '../../data/windows';
export interface WindowUpdate {frame?:string|null;scenery?:string;x?:number;y?:number;scale?:number}
export default function WindowPanel({profile,inventory,busy,onSave,onShop}:{profile:WorldProfile;inventory:{item_id:string;quantity:number}[];busy:boolean;onSave:(v:WindowUpdate)=>void;onShop:()=>void}){
 const current=profile.window_scenery_id||'view-garden',visible=profile.window_frame_id!==null;
 const owned=(id:string)=>id==='view-garden'||inventory.some(i=>i.item_id===id&&Number(i.quantity)>0);
 const x=Number(profile.window_x)||50,y=Number(profile.window_y)||27,scale=Number(profile.window_scale)||1;
 return <div className="window-panel"><p className="inventory-caption">창문은 집 안에 1개만 놓을 수 있어요. 풍경은 프레임과 별도로 선택해요.</p>
 <button disabled={busy} onClick={()=>onSave({frame:visible?null:'window-oak'})}>{visible?'창문 수거':'기본 창문 놓기'}</button>
 {visible&&<div className="window-position" role="group" aria-label="창문 위치와 크기"><button disabled={busy||x<=15} onClick={()=>onSave({x:Math.max(15,x-3)})} aria-label="창문 왼쪽">←</button><button disabled={busy||x>=85} onClick={()=>onSave({x:Math.min(85,x+3)})} aria-label="창문 오른쪽">→</button><button disabled={busy||y<=14} onClick={()=>onSave({y:Math.max(14,y-2)})} aria-label="창문 위로">↑</button><button disabled={busy||y>=45} onClick={()=>onSave({y:Math.min(45,y+2)})} aria-label="창문 아래로">↓</button><button disabled={busy||scale>=1.2} onClick={()=>onSave({scale:Math.min(1.2,scale+.05)})}>＋ 크게</button><button disabled={busy||scale<=.6} onClick={()=>onSave({scale:Math.max(.6,scale-.05)})}>－ 작게</button><span>{Math.round(scale*100)}%</span></div>}
 <div className="inventory-grid">{WINDOW_SCENERY.filter(v=>owned(v.id)).map(v=><article key={v.id}><div className="window-view-thumb"><img src={sceneryImage(v.id)} alt=""/></div><b>{v.name}</b><small>{v.price===0?'기본 제공 · 낮/노을/밤 자동':'구매 보유 · 고유 분위기 유지'}</small><button disabled={busy||current===v.id} onClick={()=>onSave({scenery:v.id})}>{current===v.id?'선택 중':'창밖에 적용'}</button></article>)}</div><button className="inventory-wide" onClick={onShop}>포인트샵에서 다른 풍경 보기</button>
 </div>;
}
