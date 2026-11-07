import {useRef,useState} from 'react';
import FishingPanel from './FishingPanel';
import FishingScene from './FishingScene';
export type GameExitGuard=()=>Promise<boolean>;
export default function PlazaHub({userId,initialTab='fish',onPointsChange,onAquarium,onGuardChange}:{userId:string;initialTab?:string;onPointsChange?:()=>void;onAquarium?:()=>void;onGuardChange:(guard:GameExitGuard|null)=>void}){
 const [game,setGame]=useState<string|null>(initialTab==='bag'?'fishing':null),guard=useRef<GameExitGuard|null>(null);
 const register=(value:GameExitGuard|null)=>{guard.current=value;onGuardChange(value)};
 const back=async()=>{if(guard.current&&!await guard.current())return;setGame(null);register(null)};
 if(game==='fishing')return <section className="plaza-game-screen"><button className="plaza-back" onClick={()=>void back()}>← 광장으로</button><FishingPanel userId={userId} initialTab={initialTab} onPointsChange={onPointsChange} onAquarium={onAquarium} onExitGuard={register}/></section>;
 return <section className="plaza-hub"><header><small>SSIKSIK WORLD · PLAZA</small><h2>광장</h2><p>즐길 게임을 골라 입장하세요.</p></header><div className="plaza-games"><article className="plaza-game-card"><div className="plaza-game-preview"><FishingScene location="pond" preview/></div><div className="plaza-game-description"><small>수집 · 기록</small><h3>낚시</h3><p>민물과 바다에서 물고기를 낚고, 도감을 채우거나 수족관에 전시하세요.</p><button onClick={()=>setGame('fishing')}>낚시터 가기</button></div></article><article className="plaza-next-game"><span aria-hidden="true">＋</span><h3>새 게임 준비 중</h3><p>다음 게임도 이곳에서 선택할 수 있게 추가할 예정이에요.</p></article></div></section>;
}
