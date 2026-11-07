import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {getAquarium,displayFish,FISH_TIERS,type FishAquarium} from '../../services/fishing';
import FishArt from './FishArt';
import {aquariumLayout} from '../../data/aquariumLayout';
import '../../styles/fishing.css';
export default function AquariumPanel({ownerId,isOwner,onManage,refreshKey=0}:{ownerId:string;isOwner:boolean;onManage?:()=>void;refreshKey?:number}){
 const [state,setState]=useState<FishAquarium|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[busy,setBusy]=useState(false);
 useEffect(()=>{let live=true;setState(null);setError('');getAquarium(ownerId).then(s=>{if(live)setState(s)},()=>{if(live)setError('수족관을 불러오지 못했어요. 027 SQL 적용 상태를 확인해주세요.')});return()=>{live=false};},[ownerId,retry,refreshKey]);
 const fish=state?.fish,s=fish?.species;
 const tank=useRef<HTMLDivElement>(null),[bounds,setBounds]=useState({width:300,height:220});
 useEffect(()=>{const el=tank.current;if(!el)return;const measure=()=>setBounds({width:el.clientWidth,height:el.clientHeight});measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect();},[!!state,error]);
 const motion=s?.motion||'fish';
 const layout=aquariumLayout(Number(fish?.length_cm)||0,s?.crop||[0,0,180,100],bounds.width,bounds.height,motion);
 const remove=async()=>{setBusy(true);try{await displayFish(null);setRetry(v=>v+1)}catch{setError('전시를 해제하지 못했어요. 다시 시도해주세요.')}finally{setBusy(false)}};
 return <section className="aquarium-panel" aria-label="수족관"><header className="fishing-section-head"><div><small>MINI AQUARIUM</small><h2>수족관</h2><p>직접 잡은 수중 생물 한 마리를 전시해요. 잡은 크기에 따라 표시 크기가 달라져요.</p></div>{isOwner&&onManage&&<button onClick={onManage}>전시 수중 생물 선택</button>}</header>
 {error?<div role="alert">{error}<button onClick={()=>setRetry(v=>v+1)}>다시 불러오기</button></div>:<>
 <div ref={tank} className="aquarium-tank" aria-busy={!state}><div className="aquarium-light"/><div className="aquarium-waterline"/><div className="aquarium-sand"/><div className="aquarium-rock rock-one"/><div className="aquarium-rock rock-two"/><div className="aquarium-plant plant-one"/><div className="aquarium-plant plant-two"/>
 {fish&&s?<div className={`aquarium-route aquarium-sized motion-${motion}`}><div className="aquarium-swim" style={{width:layout.width+'px',height:layout.height+'px',top:layout.top+'px','--swim-distance':layout.travel+'px','--swim-duration':layout.duration+'s','--rest-position':layout.travel/2+'px'} as CSSProperties}><div className="aquarium-float"><div className="aquarium-turn"><FishArt species={s} animate/></div></div></div></div>:<p className="aquarium-empty">{state?'전시 중인 수중 생물이 없어요.':'수족관을 불러오는 중…'}</p>}
 {[0,1,2,3].map(i=><i className={`aquarium-bubble bubble-${i}`} key={i}/>)}</div>
 {fish&&s?<div className="aquarium-plaque"><div><small>{FISH_TIERS[s.tier]}</small><h3>{s.name} <strong>{Number(fish.length_cm).toFixed(1)}cm</strong></h3><p>잡은 사람 {state?.owner_name||'사용자'} · {new Date(fish.caught_at).toLocaleDateString('ko-KR')}</p></div>{isOwner&&<button disabled={busy} onClick={remove}>전시 해제</button>}</div>:isOwner&&<p className="fishing-note">광장에서 수중 생물을 잡은 뒤 보관함의 ‘전시’ 버튼으로 선택할 수 있어요.</p>}
 </>}
 </section>;
}
