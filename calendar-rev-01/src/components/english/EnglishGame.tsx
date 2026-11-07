import {useCallback,useEffect,useRef,useState} from 'react';
import {getEnglish,mutateEnglish,type EnglishState,type EnglishAction} from '../../services/englishGame';
import '../../styles/english-game.css';
type Guard=()=>Promise<boolean>;
export default function EnglishGame({userId,onPointsChange,onExitGuard}:{userId:string;onPointsChange?:()=>void;onExitGuard?:(guard:Guard|null)=>void}){
 const[data,setData]=useState<EnglishState|null>(null),[busy,setBusy]=useState(false),[pending,setPending]=useState<EnglishAction|null>(null),[error,setError]=useState(''),[now,setNow]=useState(Date.now()),[tab,setTab]=useState('play');
 const live=useRef(true),lock=useRef(false),offset=useRef(0),auto=useRef(''),current=useRef({data,busy,pending});current.current={data,busy,pending};
 const accept=useCallback((value:EnglishState)=>{offset.current=Date.parse(value.serverNow)-Date.now();if(live.current){setData(value);setNow(Date.now());}},[]);
 const refresh=useCallback(async()=>{if(lock.current)return;lock.current=true;setBusy(true);try{accept(await getEnglish());setError('');setPending(null);}catch{if(live.current)setError('영어 게임을 불러오지 못했어요. 연결 상태와 030 SQL 적용 여부를 확인해주세요.');}finally{lock.current=false;if(live.current)setBusy(false);}},[accept]);
 useEffect(()=>{live.current=true;void refresh();const clock=window.setInterval(()=>setNow(Date.now()),250);return()=>{live.current=false;clearInterval(clock);};},[refresh]);
 const perform=useCallback(async(action:EnglishAction)=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');setPending(action);try{const value=await mutateEnglish(action);accept(value);if(live.current){setPending(null);if(action.type==='start')setTab('play');}if(action.type==='answer')onPointsChange?.();return true;}catch{if(live.current)setError('처리 결과를 확인하지 못했어요. 같은 요청을 다시 확인하거나 저장된 상태를 불러와주세요.');return false;}finally{lock.current=false;if(live.current)setBusy(false);}},[accept,onPointsChange]);
 const guard=useCallback(async()=>{const value=current.current;if(lock.current||value.pending){setError('처리 중인 요청의 결과를 먼저 확인해주세요.');return false;}const r=value.data?.run;if(!r||!['question','review'].includes(r.status))return true;if(!window.confirm('영어 도전을 종료하고 이동할까요? 지금까지의 기록과 받은 포인트는 유지됩니다.'))return false;return !!await perform({type:'quit',run:r.id});},[perform]);
 useEffect(()=>{onExitGuard?.(guard);return()=>onExitGuard?.(null);},[onExitGuard,guard]);
 const r=data?.run,q=r?.question,playing=r?.status==='question',review=r?.status==='review',active=playing||review,blocked=busy||!!pending;
 const remaining=q?Math.max(0,Math.ceil((Date.parse(q.expiresAt)-now-offset.current)/1000)):0;
 useEffect(()=>{if(playing&&q&&remaining>0&&!pending&&auto.current===q.id)auto.current='';if(playing&&q&&remaining===0&&!blocked&&auto.current!==q.id){auto.current=q.id;void perform({type:'answer',run:r!.id,turn:q.id,choice:-1,request:crypto.randomUUID()});}},[playing,q?.id,remaining,blocked,pending,perform,r?.id]);
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};if(active||blocked)window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[active,blocked]);
 useEffect(()=>{const visible=()=>{if(!document.hidden&&!lock.current&&!current.current.pending)void refresh();};document.addEventListener('visibilitychange',visible);return()=>document.removeEventListener('visibilitychange',visible);},[refresh]);
 const choose=(i:number)=>{if(playing&&q&&r&&!blocked&&remaining>0)void perform({type:'answer',run:r.id,turn:q.id,choice:i,request:crypto.randomUUID()});};
 const next=()=>{if(review&&q&&r&&!blocked)void perform({type:'next',run:r.id,turn:q.id});};
 const start=()=>{if(!blocked)void perform({type:'start',request:crypto.randomUUID()});};
 return <section className="english-game"><header className="english-head"><div><small>PLAZA · ENGLISH</small><h2>영어 연속 도전</h2><p>보기 세 개 중 정답을 골라 기록을 이어가세요.</p></div><div className="english-best">내 최고 기록<strong>{data?.best??0}<small>문제</small></strong></div></header>
 <nav className="english-tabs" aria-label="영어 게임 메뉴"><button aria-pressed={tab==='play'} onClick={()=>setTab('play')}>도전</button><button disabled={!!active||blocked} aria-pressed={tab==='ranks'} onClick={()=>{setTab('ranks');void refresh();}}>연속 정답 랭킹</button></nav>
 {error&&<div className="english-error" role="alert"><p>{error}</p>{pending&&<button disabled={busy} onClick={()=>void perform(pending)}>같은 요청 다시 확인</button>}<button disabled={busy} onClick={()=>void refresh()}>상태 다시 불러오기</button></div>}
 {!data?<p role="status">{busy?'게임 정보를 불러오는 중…':'게임 정보를 확인해주세요.'}</p>:tab==='ranks'?<div className="english-rank"><h3>최고 연속 정답</h3><p>개인 최고 기록 · 동점은 먼저 달성한 기록 순서</p>{data.rankings.length?<ol>{data.rankings.map((x,i)=><li key={x.user_id} className={x.user_id===userId?'is-me':''}><span>{i+1}</span><b>{x.name}{x.user_id===userId?' (나)':''}</b><strong>{x.score}문제</strong></li>)}</ol>:<p>아직 기록이 없어요. 첫 기록에 도전해보세요.</p>}</div>:<>
 <div className="english-summary"><span>현재 연속 정답 <strong>{r?.score??0}문제</strong></span><span>오늘 최고 <b>{data.todayBest}문제</b> · 보상 {data.todayPoints}/{data.dailyCap}P</span></div>
 {r&&q&&r.status!=='quit'?<article className="english-question" key={q.id}>
 <div className="english-question-top"><b>{playing?`${q.number}번째 문제`:review?'정답입니다':r.reason==='timeout'?'시간 초과':r.status==='completed'?'완주했습니다':'이번 도전 종료'}</b>{playing&&<span className={remaining<=5?'english-clock urgent':'english-clock'} role="timer" aria-label="남은 시간">{remaining}초</span>}</div>
 {playing&&<div className="english-time-track" aria-hidden="true"><i style={{width:Math.min(100,remaining/30*100)+'%'}}/></div>}
 <p className="english-instruction">빈칸에 들어갈 가장 알맞은 표현을 고르세요.</p>
 <p className="english-prompt">{q.prompt}</p>
 <div className="english-choices">{q.choices.map((choice,i)=>{const resolved=q.correctIndex!==undefined,isCorrect=resolved&&q.correctIndex===i,isChosen=q.chosen===i;return <button key={i} disabled={!playing||blocked||remaining===0} className={`${isCorrect?'correct':''} ${resolved&&isChosen&&!isCorrect?'wrong':''}`} onClick={()=>choose(i)}><span>{i+1}</span><b>{choice}</b>{isCorrect&&<em>정답</em>}{resolved&&isChosen&&!isCorrect&&<em>선택한 답</em>}</button>;})}</div>
 {q.explanation&&<div className="english-explanation" aria-live="polite"><b>{q.correct?'정답 해설':'정답을 확인하세요'}</b><p>{q.explanation}</p>{!!q.points&&<small>오늘 최고 기록 보상 +{q.points}P</small>}</div>}
 <div className="english-actions">{review?<button disabled={blocked} onClick={next}>다음 문제</button>:!playing?<><p>이번 기록 <strong>{r.score}문제</strong></p><button disabled={blocked} onClick={start}>다시 도전</button><button disabled={blocked} onClick={()=>{setTab('ranks');void refresh();}}>랭킹 보기</button></>:<button className="english-quit" disabled={blocked} onClick={()=>void guard()}>도전 종료</button>}</div>
 </article>:<div className="english-intro"><h3>몇 문제까지 이어갈 수 있을까요?</h3><p>문제마다 30초가 주어집니다. 정답을 맞히면 해설을 확인한 뒤 다음 문제로 넘어갑니다. 오답이나 시간 초과 시 도전이 끝나요.</p><p>새로고침하거나 다른 앱으로 이동해도 문제의 남은 시간은 계속 흐릅니다.</p><button disabled={blocked} onClick={start}>도전 시작</button></div>}
 <p className="english-reward-note">무료로 도전할 수 있어요. 오늘 최고 기록을 1문제 높일 때마다 10P, 하루 최대 {data.dailyCap}P를 받아요. 같은 기록을 반복해도 추가 지급되지 않습니다. 한국 시간 자정 기준입니다.</p>
 </>}
 {busy&&data&&<p className="english-saving" role="status">저장된 결과를 확인하는 중…</p>}
 </section>;
}
