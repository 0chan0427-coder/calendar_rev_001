import PurchaseDialog from './PurchaseDialog';
import RefundPanel from './RefundPanel';
import { useEffect, useState } from 'react';
import { WEARABLES, WEAR_SLOTS, AVATAR_DEFAULTS, normalizeAvatarEquipment, isCat } from '../../data/wardrobe';
import type { Equipment, WearSlot } from '../../data/wardrobe';
import { listWorldWardrobe, saveWorldAppearance } from '../../services/world';
import {useAvatarMotionEnabled,setAvatarMotionEnabled} from '../../lib/avatarMotion';
import CharacterAvatar from './CharacterAvatar';
import WearableThumbnail from './WearableThumbnail';
import CompanionAvatar from './CompanionAvatar';

export default function WardrobePanel({userId,targetId='avatar',itemId='',gender='male',initial={},initialSlot,initialItemId,onClose,onSaved}:{userId:string;targetId?:string;itemId?:string;gender?:'male'|'female';initial?:Equipment;initialSlot?:WearSlot;initialItemId?:string;onClose:()=>void;onSaved:()=>Promise<void>}){
 const [pendingPurchase,setPendingPurchase]=useState<string|null>(null),[refundOpen,setRefundOpen]=useState(false);
 const motion=useAvatarMotionEnabled();
 const target=targetId==='avatar'?'avatar':'cat';
 const slots=target==='avatar'?WEAR_SLOTS:[['coat','털색·무늬'],['accessory','액세서리']] as [WearSlot,string][];
 const [draft,setDraft]=useState<Equipment>(()=>{const value=target==='avatar'?normalizeAvatarEquipment(initial):{...initial};const item=WEARABLES.find(i=>i.id===initialItemId&&i.target===target);return item?{...value,[item.slot]:item.id}:value;});
 const [slot,setSlot]=useState<WearSlot>(initialSlot||(target==='avatar'?'hair':'coat'));
 const [owned,setOwned]=useState<string[]>([]);const [busy,setBusy]=useState(false);const [ready,setReady]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 useEffect(()=>{let live=true;listWorldWardrobe(userId).then(r=>{if(!live)return;if(r.error)setError('보유 아이템을 불러오지 못했어요. 잠시 후 다시 열어주세요.');else{setOwned((r.data||[]).map(i=>i.item_id));setReady(true);}});return()=>{live=false;};},[userId]);
 const [ownedOnly,setOwnedOnly]=useState(Boolean(initialItemId));const [query,setQuery]=useState('');
 const items=WEARABLES.filter(i=>i.target===target&&i.slot===slot&&(!i.hidden||owned.includes(i.id))&&(!ownedOnly||i.price===0||owned.includes(i.id))&&i.name.includes(query.trim()));
 const remove=()=>{setDraft(p=>{const n={...p};if(target==='avatar'&&AVATAR_DEFAULTS[slot])n[slot]=AVATAR_DEFAULTS[slot];else delete n[slot];return n;});setNotice('기본 모습으로 미리보고 있어요. 저장하면 적용돼요.');};
 const refreshAfterRefund=async()=>{const r=await listWorldWardrobe(userId);if(r.error)throw r.error;const next=(r.data||[]).map(i=>i.item_id);setOwned(next);setDraft(current=>{const d={...current};for(const [slot,id]of Object.entries(d)){if(id&&owned.includes(id)&&!next.includes(id)){delete d[slot as WearSlot];}}return target==='avatar'?normalizeAvatarEquipment(d):d;});await onSaved();};
 const save=async()=>{setBusy(true);setError('');try{const r=await saveWorldAppearance(targetId,draft as Record<string,string>);if(r.error||r.data?.success===false)throw r.error||new Error('save failed');await onSaved();onClose();}catch{setError('착용 상태를 저장하지 못했어요. 다시 시도해주세요.');}finally{setBusy(false);}};
 if(target==='cat'&&!isCat(itemId))return null;
 return <><div className="modal-backdrop"><section className="wardrobe-modal" role="dialog" aria-modal="true" aria-label={target==='avatar'?'미니미 꾸미기':'동물 꾸미기'}><div className="wardrobe-heading"><div><small>DRESS ROOM</small><h2>{target==='avatar'?'미니미 꾸미기':'고양이 꾸미기'}</h2><p>{target==='avatar'?'헤어·모자·상의·겉옷을 따로 조합해요. 구매 전에도 미리 입어볼 수 있어요.':'털색과 장식을 조합해요.'}</p></div><button disabled={busy} onClick={onClose} aria-label="닫기">닫기</button></div>
 <div className="wardrobe-layout"><div className="wardrobe-preview">{target==='avatar'?<CharacterAvatar gender={gender} equipment={draft}/>:<CompanionAvatar itemId={itemId} equipment={draft}/>}<span>미리보기</span></div><div className="wardrobe-choices"><div className="wardrobe-tabs" role="group" aria-label="꾸미기 부위">{slots.map(([id,label])=><button key={id} aria-pressed={slot===id} className={slot===id?'active':''} onClick={()=>setSlot(id)}>{label}</button>)}</div>
 {target==='avatar'&&<button className="wardrobe-motion" aria-pressed={motion} onClick={()=>setAvatarMotionEnabled(!motion)}>움직임 {motion?'켜짐':'꺼짐'}</button>}
 <button className="refund-open" disabled={busy} onClick={()=>setRefundOpen(true)}>구매·환불 내역</button>
 <div className="wardrobe-filters"><label><input type="checkbox" checked={ownedOnly} onChange={e=>setOwnedOnly(e.target.checked)}/> 보유 아이템만</label><input aria-label="꾸미기 아이템 검색" placeholder="이름 검색" value={query} onChange={e=>setQuery(e.target.value)}/></div>
 <p className="wardrobe-count">{items.length}가지 선택지</p>
 <button className="wardrobe-reset" disabled={busy} onClick={remove}>이 부위 기본 모습 / 해제</button><div className="wardrobe-grid">{items.map(i=>{const has=i.price===0||owned.includes(i.id);return <article key={i.id} className={draft[i.slot]===i.id?'selected':''}><button className="wearable-select" disabled={busy||!ready} onClick={()=>{setDraft(p=>({...p,[i.slot]:i.id}));setNotice(has?'미리 착용했어요. 저장하면 적용돼요.':'구매 전 미리보기예요. 구매하면 저장할 수 있어요.');}}><WearableThumbnail item={i} gender={gender}/><b>{i.name}</b><small>{draft[i.slot]===i.id?'선택됨':has?'보유':`${i.price.toLocaleString()}P`}</small></button>{!has&&<button disabled={busy||!ready} onClick={()=>setPendingPurchase(i.id)}>구매 {i.price.toLocaleString()}P</button>}</article>;})}</div>{!items.length&&<p className="wardrobe-empty">이 부위는 새 아이템을 준비 중이에요. 기본 외형으로 이용할 수 있어요.</p>}</div></div>
 {error&&<p className="wardrobe-error" role="alert">{error}</p>}{notice&&<p className="wardrobe-notice" role="status">{notice}</p>}<footer><button disabled={busy} onClick={onClose}>취소</button><button disabled={busy||!ready||Object.values(draft).some(id=>{const i=WEARABLES.find(w=>w.id===id);return !i||(i.price>0&&!owned.includes(id!));})} onClick={save}>{busy?'처리 중…':'착용 저장'}</button></footer></section></div>{pendingPurchase&&<PurchaseDialog key={pendingPurchase} kind="wearable" itemId={pendingPurchase} name={WEARABLES.find(i=>i.id===pendingPurchase)?.name||pendingPurchase} onClose={()=>setPendingPurchase(null)} onPurchased={async()=>{setOwned(p=>Array.from(new Set([...p,pendingPurchase])));setNotice('구매했어요. 아이템을 눌러 미리 착용해보세요.');await onSaved();}}/>}{refundOpen&&<RefundPanel onClose={()=>setRefundOpen(false)} onChanged={refreshAfterRefund}/>}</>;
}
