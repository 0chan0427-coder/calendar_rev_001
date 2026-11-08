import type {WorldProfile,WorldItem} from '../../types/world';
import {GARDEN_ITEMS,BASIC_GARDEN} from '../../data/gardens';
import FurnitureArt from './FurnitureArt';
export default function GardenPanel({profile,inventory,busy,onApply,onShop}:{profile:WorldProfile;inventory:{item_id:string;quantity:number}[];busy:boolean;onApply:(i:WorldItem)=>void;onShop:()=>void}){
 const current=profile.garden_theme_id||BASIC_GARDEN,owned=GARDEN_ITEMS.filter(i=>i.price===0||inventory.some(v=>v.item_id===i.id&&Number(v.quantity)>0));
 return <div className="garden-panel"><p className="inventory-caption">정원은 테마 한 개를 선택해 전체 공간을 바꿉니다. 미니미·동물과 보관된 배치는 유지됩니다. 창문에서 ‘내 정원 연동’을 선택하면 같은 풍경이 보여요.</p><div className="inventory-grid">{owned.map(i=><article key={i.id} className={current===i.id?'in-use':''}><div className="garden-theme-thumb"><FurnitureArt item={i}/></div><b>{i.name}</b><small>{i.price===0?'기본 제공':'구매 보유'}</small><button disabled={busy||current===i.id} onClick={()=>onApply(i)}>{current===i.id?'적용 중':'정원에 적용'}</button></article>)}</div><button className="inventory-wide" onClick={onShop}>포인트샵에서 정원 테마 보기</button></div>;
}
