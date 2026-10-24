import {useEffect,useRef,useState} from 'react';
import {getDailyHearts,giveDailyHeart,type DailyHearts} from '../../services/worldBonds';
export default function DailyHeartPanel({ownerId,canGive=false}:{ownerId:string;canGive?:boolean}){
 const [result,setResult]=useState<{owner:string;data:DailyHearts}|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const request=useRef(0),lock=useRef(false);
 const data=result?.owner===ownerId?result.data:null;
 useEffect(()=>{let live=true;setError('');
  const load=async()=>{if(lock.current||document.hidden)return;const n=++request.current;try{const data=await getDailyHearts(ownerId);if(live&&n===request.current){setResult({owner:ownerId,data});setError('');}}catch{if(live&&n===request.current)setError('하트를 불러오지 못했어요.');}};
  void load();const timer=window.setInterval(load,60000);document.addEventListener('visibilitychange',load);
  return()=>{live=false;request.current++;clearInterval(timer);document.removeEventListener('visibilitychange',load);};
 },[ownerId]);
 const give=async()=>{if(lock.current||!data||data.given)return;lock.current=true;setBusy(true);const n=++request.current;
  try{const next=await giveDailyHeart(ownerId);if(n===request.current){setResult({owner:ownerId,data:next});setError('');}}
  catch{if(n===request.current)setError('하트를 보내지 못했어요. 다시 눌러주세요.');}finally{lock.current=false;setBusy(false);}
 };
 return <div className="daily-hearts"><span>♥ 오늘 받은 하트 <b>{data?data.today:'—'}</b> · 전체 <b>{data?data.total:'—'}</b></span>{canGive&&<button disabled={busy||!data||data.given} onClick={give}>{busy?'보내는 중…':data?.given?'♥ 오늘 하트 전달 완료':'♡ 오늘의 하트 주기'}</button>}{canGive&&<small>친구마다 하루 한 번 · 한국 시간 자정에 다시 전달</small>}{error&&<small role="alert">{error} 잠시 후 자동으로 다시 확인해요.</small>}</div>;
}
