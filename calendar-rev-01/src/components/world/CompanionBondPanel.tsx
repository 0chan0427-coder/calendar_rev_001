import {useEffect,useRef,useState} from 'react';
import type {WorldCompanion} from '../../types/world';
import type {Equipment} from '../../data/wardrobe';
import {BOND_THEMES,BOND_MAX,BOND_ACCESSORY_AT,CARE_ACTIONS,companionBondFamily,specialFormAvailable,type CompanionBondState,type CareAction,type RewardKind} from '../../data/companionBonds';
import {getCompanionBond,careCompanion,setCompanionReward} from '../../services/worldBonds';
import CompanionAvatar from './CompanionAvatar';
export default function CompanionBondPanel({companion,equipment={},onChange,onClose}:{companion:WorldCompanion;equipment?:Equipment;onChange:(c:WorldCompanion)=>void;onClose:()=>void}){
 const [state,setState]=useState<CompanionBondState|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[reaction,setReaction]=useState('');
 const [preview,setPreview]=useState(false),[demoPoints,setDemoPoints]=useState(440),[demoAccessory,setDemoAccessory]=useState(false),[demoSpecial,setDemoSpecial]=useState(false);
 const lock=useRef(false),live=useRef(true),panel=useRef<HTMLElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const keys=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();onClose();}if(event.key==='Tab'){const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),[tabindex="0"]')||[]);const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};document.addEventListener('keydown',keys);return()=>{document.body.style.overflow=oldOverflow;document.removeEventListener('keydown',keys);previous?.focus();};
 },[]);
 useEffect(()=>{live.current=true;const load=async()=>{if(lock.current||document.hidden)return;lock.current=true;try{const next=await getCompanionBond(companion.id);if(live.current){setState(next);setError('');}}catch{if(live.current)setError('돌보기 정보를 불러오지 못했어요. V054 SQL 적용 후 다시 열어주세요.');}finally{lock.current=false;}};void load();const timer=setInterval(load,60000);document.addEventListener('visibilitychange',load);return()=>{live.current=false;clearInterval(timer);document.removeEventListener('visibilitychange',load);};},[companion.id]);
 const family=companionBondFamily(companion.item_id),theme=family?BOND_THEMES[family]:null;
 const c=state?.companion||companion,points=preview?demoPoints:c.bond_points||0;
 const accessoryUnlocked=preview?points>=BOND_ACCESSORY_AT:state?.rewards.includes('accessory');
 const specialUnlocked=preview?points>=BOND_MAX:state?.rewards.includes('special');
 const accessory=preview?demoAccessory:c.reward_accessory,special=preview?demoSpecial:c.special_form;
 const formReady=specialFormAvailable(companion.item_id,equipment);
 const apply=(next:CompanionBondState)=>{if(live.current){setState(next);onChange(next.companion);setError('');}};
 const care=async(action:CareAction)=>{
  if(preview){const next=Math.min(BOND_MAX,demoPoints+10);setDemoPoints(next);setReaction(next>=BOND_MAX?'최대 친밀도! 특별 외형을 선택해보세요.':next>=BOND_ACCESSORY_AT?'전용 액세서리를 선택할 수 있어요.':'돌보기 체험 +10');return;}
  if(lock.current||!state||error)return;lock.current=true;setBusy(true);
  try{const next=await careCompanion(c.id,action);apply(next);if(live.current)setReaction(next.added?`${CARE_ACTIONS.find(a=>a.id===action)!.reaction} 친밀도 +${next.gained||0}`:'오늘은 이미 챙겨줬어요.');}
  catch{if(live.current)setError('돌보기를 저장하지 못했어요. 다시 열어서 확인해주세요.');}finally{lock.current=false;if(live.current)setBusy(false);}
 };
 const equip=async(kind:RewardKind,enabled:boolean)=>{
  if(preview){if(kind==='accessory')setDemoAccessory(enabled);else setDemoSpecial(enabled);return;}
  if(lock.current||!state||error)return;lock.current=true;setBusy(true);
  try{apply(await setCompanionReward(c.id,kind,enabled));}catch{if(live.current)setError('보상을 적용하지 못했어요. 해금 상태와 현재 털색을 확인해주세요.');}finally{lock.current=false;if(live.current)setBusy(false);}
 };
 return <div className="modal-backdrop bond-backdrop" onClick={onClose}><section ref={panel} className="bond-modal" role="dialog" aria-modal="true" aria-labelledby="bond-title" onClick={e=>e.stopPropagation()}>
 <header className="bond-header"><div><small>동물 돌보기</small><h2 id="bond-title">{c.name} 돌보기</h2></div><button onClick={onClose}>닫기</button></header>
 <div className="bond-mode"><button className={!preview?'selected':''} onClick={()=>{setPreview(false);setReaction('');}}>내 동물 돌보기</button><button className={preview?'selected':''} onClick={()=>{setPreview(true);setReaction('');}}>보상 체험</button></div>
 {preview&&<div className="bond-demo"><b>체험 중 · 실제 친밀도와 보상은 저장되지 않아요</b><div><button onClick={()=>{setDemoPoints(440);setDemoAccessory(false);setDemoSpecial(false);setReaction('');}}>중간 해금 직전</button><button onClick={()=>{setDemoPoints(890);setDemoAccessory(false);setDemoSpecial(false);setReaction('');}}>최대 해금 직전</button></div><small>돌보기 버튼을 한 번 누른 뒤 보상 장착을 확인해보세요.</small></div>}
 <div className="bond-hero"><div className="bond-animal" data-bond-preview={preview}><CompanionAvatar itemId={c.item_id} equipment={equipment} name={c.name} rewardAccessory={accessory} specialForm={special} animate/></div><div className="bond-summary"><p>{special&&formReady?theme?.special:'친밀도'}</p><strong>{points.toLocaleString()} <small>/ {BOND_MAX}</small></strong><progress max={BOND_MAX} value={points} aria-label="동물 친밀도"/><small>{points>=BOND_MAX?'최대 친밀도를 달성했어요!':`다음 보상까지 ${Math.max(0,(points<BOND_ACCESSORY_AT?BOND_ACCESSORY_AT:BOND_MAX)-points)} 남았어요.`}</small><p>쉬었다 와도 친밀도는 줄어들지 않아요.</p></div></div>
 <div className="bond-care-actions">{CARE_ACTIONS.map(a=><button key={a.id} disabled={!preview&&(busy||!state||Boolean(error)||state.actions.includes(a.id))} onClick={()=>care(a.id)}>{!preview&&state?.actions.includes(a.id)?'✓ ':''}{a.name}<small>{!preview&&state?.actions.includes(a.id)?'오늘 완료':'+10 친밀도'}</small></button>)}</div>
 <div className="bond-reaction" aria-live="polite">{reaction||'간식·쓰다듬기·놀이 각각 하루 한 번, 총 +30 · 한국 시간 자정 기준'}</div>
 {error&&!preview&&<p className="bond-error" role="alert">{error}</p>}
 <div className="bond-rewards"><article><small>450 친밀도 · 상점 미판매</small><h3>{theme?.accessory||'전용 액세서리 준비 중'}</h3><p>{accessoryUnlocked?'해금 완료 · 자유롭게 장착하거나 해제할 수 있어요.':'매일 세 번 챙기면 약 15일에 해금돼요.'}</p><button disabled={!theme||!accessoryUnlocked||(!preview&&(busy||Boolean(error)))} onClick={()=>equip('accessory',!accessory)}>{accessory?'액세서리 해제':accessoryUnlocked?'액세서리 장착':'아직 잠겨 있어요'}</button></article>
 <article><small>900 친밀도 · 최대 보상</small><h3>{theme?.special||'특별 외형 준비 중'}</h3><p>{formReady?(specialUnlocked?'해금 완료 · 기본 모습으로 언제든 돌아갈 수 있어요.':'매일 세 번 챙기면 약 30일에 해금돼요.'):'외형 제작 예정 · 해금 기록은 보관돼요.'}</p><button disabled={!specialUnlocked||(!formReady&&!special)||(!preview&&(busy||Boolean(error)))} onClick={()=>equip('special',!special)}>{special?'기본 모습으로':!formReady?'외형 준비 중':specialUnlocked?'특별 외형 적용':'아직 잠겨 있어요'}</button></article></div>

 <p className="bond-note">친밀도는 동물마다 따로 쌓여요. 받은 보상은 보관되며, 같은 동물을 다시 데려와도 사용할 수 있어요. 아기는 아기 모습, 성체는 성체 모습을 유지해요.</p>
 </section></div>;
}
