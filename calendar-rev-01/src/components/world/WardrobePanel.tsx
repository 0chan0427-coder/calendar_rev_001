import { useEffect, useState } from 'react';
import { WEARABLES, WEAR_SLOTS, isCat } from '../../data/wardrobe';
import type { Equipment, WearSlot } from '../../data/wardrobe';
import { listWorldWardrobe, buyWorldWearable, saveWorldAppearance } from '../../services/world';
import CharacterAvatar from './CharacterAvatar';
import CompanionAvatar from './CompanionAvatar';

export default function WardrobePanel({userId,targetId='avatar',itemId='',gender='male',initial={},onClose,onSaved}:{userId:string;targetId?:string;itemId?:string;gender?:'male'|'female';initial?:Equipment;onClose:()=>void;onSaved:()=>Promise<void>}){
 const target=targetId==='avatar'?'avatar':'cat';
 const slots=target==='avatar'?WEAR_SLOTS:[['coat','種類・털색'],['accessory','액세서리']] as [WearSlot,string][];
 const [draft,setDraft]=useState<Equipment>({...initial});
 const [slot,setSlot]=useState<WearSlot>(target==='avatar'?'hair':'coat');
 const [owned,setOwned]=useState<string[]>([]);const [busy,setBusy]=useState(false);const [ready,setReady]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 useEffect(()=>{let live=true;listWorldWardrobe(userId).then(r=>{if(!live)return;if(r.error)setError('꾸미기 저장소를 불러오지 못했어요. 013_world_appearance.sql 적용 여부와 연결 상태를 확인해주세요.');else{setOwned((r.data||[]).map(i=>i.item_id));setReady(true);}});return()=>{live=false;};},[userId]);
 const items=WEARABLES.filter(i=>i.target===target&&i.slot===slot);
 const remove=()=>{setDraft(p=>{const n={...p};delete n[slot];return n;});setNotice('기본 모습으로 미리보고 있어요. 저장하면 적용돼요.');};
 const purchase=async(id:string)=>{setBusy(true);setError('');try{const r=await buyWorldWearable(id);if(r.error)throw r.error;if(!r.data?.success){setError(r.data?.reason==='insufficient_points'?'포인트가 부족해요.':'구매하지 못했어요.');return;}setOwned(p=>[...p,id]);setNotice('구매했어요. 아이템을 눌러 미리 착용해보세요.');await onSaved();}catch{setError('구매하지 못했어요. 연결 상태를 확인해주세요.');}finally{setBusy(false);}};
 const save=async()=>{setBusy(true);setError('');try{const r=await saveWorldAppearance(targetId,draft as Record<string,string>);if(r.error)throw r.error;await onSaved();onClose();}catch{setError('착용 상태를 저장하지 못했어요. 다시 시도해주세요.');}finally{setBusy(false);}};
 if(target==='cat'&&!isCat(itemId))return null;
 return <div className="modal-backdrop"><section className="wardrobe-modal" role="dialog" aria-modal="true" aria-label={target==='avatar'?'미니미 꾸미기':'동물 꾸미기'}><div className="wardrobe-heading"><div><small>DRESS ROOM</small><h2>{target==='avatar'?'미니미 꾸미기':'고양이 꾸미기'}</h2><p>{target==='avatar'?'확정 미니미의 모습 그대로, 나만의 색과 장식을 골라요.':'털색과 장식을 조합해요.'}</p></div><button disabled={busy} onClick={onClose} aria-label="닫기">닫기</button></div>
 <div className="wardrobe-layout"><div className="wardrobe-preview">{target==='avatar'?<CharacterAvatar gender={gender} equipment={draft}/>:<CompanionAvatar itemId={itemId} equipment={draft}/>}<span>미리보기</span></div><div className="wardrobe-choices"><div className="wardrobe-tabs" role="group" aria-label="꾸미기 부위">{slots.map(([id,label])=><button key={id} aria-pressed={slot===id} className={slot===id?'active':''} onClick={()=>setSlot(id)}>{label.replace('種類・','종류·')}</button>)}</div>
 <button className="wardrobe-reset" disabled={busy} onClick={remove}>이 부위 기본 모습 / 해제</button><div className="wardrobe-grid">{items.map(i=>{const has=i.price===0||owned.includes(i.id);return <article key={i.id} className={draft[i.slot]===i.id?'selected':''}><button className="wearable-select" disabled={busy||!ready} onClick={()=>{setDraft(p=>({...p,[i.slot]:i.id}));setNotice(has?'미리 착용했어요. 저장하면 적용돼요.':'구매 전 미리보기예요. 구매하면 저장할 수 있어요.');}}>{i.mode==='image'?<img src={i.image} alt=""/>:<span className="wearable-swatch" style={{background:i.color}}/>}<b>{i.name}</b><small>{draft[i.slot]===i.id?'선택됨':has?'보유':`${i.price.toLocaleString()}P`}</small></button>{!has&&<button disabled={busy||!ready} onClick={()=>purchase(i.id)}>구매 {i.price.toLocaleString()}P</button>}</article>;})}</div>{!items.length&&<p className="wardrobe-empty">이 부위는 새 아이템을 준비 중이에요. 기본 외형으로 이용할 수 있어요.</p>}</div></div>
 {error&&<p className="wardrobe-error" role="alert">{error}</p>}{notice&&<p className="wardrobe-notice" role="status">{notice}</p>}<footer><button disabled={busy} onClick={onClose}>취소</button><button disabled={busy||!ready||Object.values(draft).some(id=>{const i=WEARABLES.find(w=>w.id===id);return !i||(i.price>0&&!owned.includes(id!));})} onClick={save}>{busy?'처리 중…':'착용 저장'}</button></footer></section></div>;
}
