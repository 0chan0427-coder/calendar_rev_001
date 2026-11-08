import DicePair from '../dice/DicePair';
import DiceGame from '../dice/DiceGame';
import {useRef,useState} from 'react';
import PetBattlePanel from '../battle/PetBattlePanel';
import EnglishGame from '../english/EnglishGame';
import '../../styles/english-game.css';
import FishingPanel from './FishingPanel';
import FishingScene from './FishingScene';
export type GameExitGuard=()=>Promise<boolean>;
export default function PlazaHub({userId,initialTab='fish',onPointsChange,onAquarium,onGuardChange}:{userId:string;initialTab?:string;onPointsChange?:()=>void;onAquarium?:()=>void;onGuardChange:(guard:GameExitGuard|null)=>void}){
 const [game,setGame]=useState<string|null>(initialTab==='bag'?'fishing':null),guard=useRef<GameExitGuard|null>(null);
 const register=(value:GameExitGuard|null)=>{guard.current=value;onGuardChange(value)};
 const back=async()=>{if(guard.current&&!await guard.current())return;setGame(null);register(null)};
 if(game==='dice')return <section className="plaza-game-screen"><button className="plaza-back" onClick={()=>void back()}>← 광장으로</button><DiceGame userId={userId} onPointsChange={onPointsChange} onExitGuard={register}/></section>;
 if(game==='battle')return <section className="plaza-game-screen"><button className="plaza-back" onClick={()=>void back()}>← 광장으로</button><PetBattlePanel onPointsChange={onPointsChange} userId={userId} onExitGuard={register}/></section>;
 if(game==='english')return <section className="plaza-game-screen"><button className="plaza-back" onClick={()=>void back()}>← 광장으로</button><EnglishGame userId={userId} onPointsChange={onPointsChange} onExitGuard={register}/></section>;
 if(game==='fishing')return <section className="plaza-game-screen"><button className="plaza-back" onClick={()=>void back()}>← 광장으로</button><FishingPanel userId={userId} initialTab={initialTab} onPointsChange={onPointsChange} onAquarium={onAquarium} onExitGuard={register}/></section>;
 return <section className="plaza-hub"><header><small>SSIKSIK WORLD · PLAZA</small><h2>광장</h2><p>즐길 게임을 골라 입장하세요.</p></header><div className="plaza-games"><article className="plaza-game-card"><div className="plaza-dice-preview" aria-hidden="true"><DicePair values={[4,2]} round={0}/></div><div className="plaza-game-description"><small>운 · 2~4인 대결</small><h3>주사위 대결</h3><p>컵 속 주사위 두 개를 굴리고 높은 합계에 도전하세요. 공동 최고점은 다시 굴립니다.</p><button onClick={()=>setGame('dice')}>주사위 테이블 가기</button></div></article><article className="plaza-game-card"><div className="english-preview" aria-hidden="true"><span>3</span><strong>VS</strong><span>3</span></div><div className="plaza-game-description"><small>전략 · 턴제</small><h3>펫 대전</h3><p>동물 100마리의 속성과 스킬을 확인하고, 내 동물 3마리로 친구와 대전하세요.</p><button onClick={()=>setGame('battle')}>펫 대전 하기</button></div></article><article className="plaza-game-card"><div className="plaza-game-preview"><FishingScene location="pond" preview/></div><div className="plaza-game-description"><small>수집 · 기록</small><h3>낚시</h3><p>민물과 바다에서 물고기를 낚고, 도감을 채우거나 수족관에 전시하세요.</p><button onClick={()=>setGame('fishing')}>낚시터 가기</button></div></article><article className="plaza-game-card"><div className="english-preview" aria-hidden="true"><span>A</span><strong>___</strong><span>B</span><span>C</span></div><div className="plaza-game-description"><small>영어 · 연속 정답</small><h3>영어 연속 도전</h3><p>보기 세 개 중 알맞은 표현을 고르고, 최고 연속 정답 기록에 도전하세요.</p><button onClick={()=>setGame('english')}>영어 게임 하기</button></div></article></div></section>;
}
