import React, { useEffect, useMemo, useState } from 'react';
import { getSession } from '../services/auth';
import { getProfiles } from '../services/profiles';
import { supabase } from '../lib/supabase';
import { WORLD_EARNING_ROWS, WORLD_ITEMS, WORLD_RANKING_BONUS, WORLD_WELCOME_POINTS } from '../constants/world';
import { ensureWorldProfile, awardWorldWeeklyBonuses, getWorldProfile, getWorldPoints, getWorldProfiles, listWorldInventory, listWorldRanking, updateWorldProfile, visitWorldHome, toggleWorldLike, createWorldGuestbook, listWorldGuestbook, purchaseWorldItem, recordWorldActivity, listWorldRoomItems, addWorldRoomItem, updateWorldRoomItem } from '../services/world';
import type { WorldProfile, WorldRankingRow, WorldView, WorldRoomItem } from '../types/world';
import WorldScene from '../components/world/WorldScene';
import WorldNavigation from '../components/world/WorldNavigation';
import '../styles/world.css';

const weekStart = () => { const d = new Date(); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; d.setDate(d.getDate()+diff); return d.toISOString().slice(0,10); };
const lastWeekStart = () => { const d = new Date(weekStart()); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10); };

export default function WorldPage() {
  const [session,setSession]=useState<any>(null); const [roomItems,setRoomItems]=useState<WorldRoomItem[]>([]); const [decorate,setDecorate]=useState(false); const [profile,setProfile]=useState<WorldProfile|null>(null); const [profiles,setProfiles]=useState<any[]>([]); const [view,setView]=useState<WorldView>('home'); const [points,setPoints]=useState(0); const [ranking,setRanking]=useState<WorldRankingRow[]>([]); const [winner,setWinner]=useState<WorldRankingRow|null>(null); const [inventory,setInventory]=useState<any[]>([]); const [guestbook,setGuestbook]=useState<any[]>([]); const [guestText,setGuestText]=useState(''); const [editingStatus,setEditingStatus]=useState(false); const [status,setStatus]=useState(''); const [loading,setLoading]=useState(true); const [message,setMessage]=useState(''); const [selectedHome,setSelectedHome]=useState<WorldProfile|null>(null); const [liked,setLiked]=useState(false);

  const reload=async(userId:string)=>{ const p=await getWorldProfile(userId); if(p.data){setProfile(p.data);setStatus(p.data.status_message||'');} const bal=await getWorldPoints(userId); if(bal.data!==null)setPoints(bal.data); const inv=await listWorldInventory(userId); if(inv.data)setInventory(inv.data); const r=await listWorldRanking(weekStart()); if(r.data)setRanking(r.data.map((x:any,i)=>({...x,rank:i+1}))); const w=await listWorldRanking(lastWeekStart()); if(w.data?.[0])setWinner({...w.data[0],rank:1}); const ps=await getWorldProfiles(); if(ps.data)setProfiles(ps.data); const ri=await listWorldRoomItems(userId); if(ri.data)setRoomItems(ri.data as WorldRoomItem[]); };

  useEffect(()=>{ getSession().then(async({data:{session}})=>{ if(!session?.user){window.location.href='/';return;} setSession(session); await ensureWorldProfile(session.user.id); await supabase.rpc('ensure_world_room_defaults',{p_user_id:session.user.id}).catch(()=>{}); await awardWorldWeeklyBonuses(lastWeekStart()).catch(() => {}); await recordWorldActivity(session.user.id,'attendance'); await reload(session.user.id); setLoading(false); }); },[]);
  useEffect(()=>{ if(selectedHome && session?.user){ visitWorldHome(session.user.id,selectedHome.user_id).then(()=>reload(session.user.id)); } },[selectedHome]);

  const myProfile=profile; const otherProfiles=useMemo(()=>profiles.filter(p=>p.user_id!==session?.user?.id),[profiles,session]);
  const addFurniture=async(item:any)=>{
    const r=await addWorldRoomItem(session.user.id,item.id,50,70,0.42,8);
    if(r.error){setMessage('가구를 배치하지 못했어요. 004_world_room_items.sql을 확인해주세요.');return;}
    await reload(session.user.id); setMessage(`${item.name}을(를) 방에 배치했어요.`);
  };
  const moveFurniture=async(id:string,x:number,y:number)=>{
    setRoomItems(items=>items.map(i=>i.id===id?{...i,x,y}:i));
    await updateWorldRoomItem(session.user.id,id,{x,y});
  };
  const buy=async(item:any)=>{ if(item.price===0){setMessage('기본 아이템은 바로 사용할 수 있어요.');return;} const r=await purchaseWorldItem(session.user.id,item.id,item.price); if(r.error){setMessage('구매에 실패했어요. 월드 DB 설정을 확인해주세요.');return;} if(r.data?.success){setMessage(`${item.name}을(를) 구매했어요!`); await reload(session.user.id);} else setMessage(r.data?.reason==='insufficient_points'?'포인트가 부족해요.':'이미 가지고 있는 아이템이에요.'); };
  const saveStatus=async()=>{ await updateWorldProfile(session.user.id,{status_message:status}); setEditingStatus(false); await reload(session.user.id); };
  const toggleScene=async()=>{ if(!myProfile)return; await updateWorldProfile(session.user.id,{scene_type:myProfile.scene_type==='interior'?'exterior':'interior'}); await reload(session.user.id); };
  const like=async()=>{if(!selectedHome)return;const r=await toggleWorldLike(session.user.id,selectedHome.user_id);if(!r.error){setLiked(Boolean(r.data?.liked));setSelectedHome({...selectedHome,likes:selectedHome.likes+(r.data?.liked?1:-1)});}};
  const postGuest=async()=>{if(!guestText.trim())return;await createWorldGuestbook(session.user.id,session.user.id,guestText.trim());setGuestText('');const g=await listWorldGuestbook(session.user.id);if(g.data)setGuestbook(g.data);};
  const openGuestbook=async()=>{setView('guestbook');const g=await listWorldGuestbook(session.user.id);if(g.data)setGuestbook(g.data);};
  if(loading)return <div className="world-loading">🌱 씩씩이 월드를 준비하고 있어요...</div>;
  return <div className="world-app">
    <header className="world-header"><div><span className="world-logo">🌐 씩씩이 월드</span><span className="world-sub">미니홈피가 중심이고, 광장은 놀러 가는 곳</span></div><div className="world-points">🪙 <b>{points.toLocaleString()}P</b></div></header>
    <WorldNavigation view={view} onChange={v=>{setView(v);if(v==='guestbook')openGuestbook();}} onCalendar={()=>{window.location.href=window.location.pathname;}} />
    <main className="world-main">
      {view==='home' && myProfile && <>
        <div className="mini-home-card"><div className="mini-home-top"><div><h1>{myProfile.display_name || '씩씩이'}'s MINI HOME</h1>{editingStatus?<div className="status-edit"><input value={status} onChange={e=>setStatus(e.target.value)} maxLength={60}/><button onClick={saveStatus}>저장</button></div>:<p onClick={()=>setEditingStatus(true)}>💬 {myProfile.status_message} <small>(눌러서 수정)</small></p>}</div><div className="visit-stats">TODAY <b>{myProfile.today_visits}</b>　/　TOTAL <b>{myProfile.total_visits}</b><br/>❤️ 좋아요 <b>{myProfile.likes}</b></div></div><WorldScene profile={myProfile} isOwner onToggleScene={toggleScene} roomItems={roomItems} onMoveItem={moveFurniture}/><div className="home-actions"><button onClick={()=>setDecorate(v=>!v)}>✏️ {decorate?'꾸미기 닫기':'내 방 꾸미기'}</button><button onClick={()=>setView('shop')}>🛍️ 포인트샵</button><button onClick={()=>openGuestbook()}>💌 방명록 보기</button><button onClick={()=>setView('friends')}>👥 친구 만나기</button></div>
        {decorate && <div className="decorate-panel"><div><h3>🪑 내 아이템 배치</h3><p>방 안의 가구를 드래그해서 원하는 곳으로 옮길 수 있어요. 새 아이템은 포인트샵에서 먼저 구매해요.</p></div><div className="decorate-grid">{inventory.filter((x:any)=>['furniture','props'].includes(WORLD_ITEMS.find(i=>i.id===x.item_id)?.type||'')).map((owned:any)=>{const item=WORLD_ITEMS.find(i=>i.id===owned.item_id); if(!item)return null; return <div className="decorate-card" key={owned.item_id}><div className="decorate-art">{item.image}</div><b>{item.name}</b><button onClick={()=>addFurniture(item)}>방에 놓기</button></div>})}</div><p className="decorate-help">💡 기본 소파와 화분은 처음부터 배치되어 있어요. 테스트 단계에서는 가구를 여러 개 놓아볼 수 있어요.</p></div>}
        </div>
        <div className="world-tip"><b>🎁 시작 선물 {WORLD_WELCOME_POINTS.toLocaleString()}P</b><span>처음 씩씩이 월드에 오면 3,000P로 시작해요. 오늘은 무엇부터 꾸며볼까요?</span></div>
      </>}
      {view==='friends' && <section className="world-panel"><h2>👥 1촌 / 친구 미니홈피</h2><p className="muted">다른 멤버의 미니홈피를 방문하면 <b>멤버별 하루 1회 +100P</b>를 받을 수 있어요.</p><div className="friend-grid">{otherProfiles.map(p=><button className="friend-card" key={p.user_id} onClick={()=>{setSelectedHome(p);setView('home');}}><span className="friend-avatar">🧑🏻‍🎨</span><b>{p.display_name||'씩씩이'}</b><small>{p.status_message||'놀러오세요!'}</small><em>🏠 방문하기</em></button>)}</div></section>}
      {view==='plaza' && <section className="world-panel plaza"><h2>🏛️ 씩씩이 광장</h2><div className="plaza-scene">🌳　🌷　🪑　🐶　✨　🎈<br/><b>친구들과 만나고 구경하는 공용 공간</b><small>광장 세부 콘텐츠는 다음 단계에서 확장해요.</small></div></section>}
      {view==='shop' && <section className="world-panel"><div className="shop-head"><div><h2>🛍️ 포인트샵</h2><p>현재 보유 포인트 <b>{points.toLocaleString()}P</b></p></div><div className="welcome-badge">🎁 처음 시작하면 {WORLD_WELCOME_POINTS.toLocaleString()}P</div></div><div className="earning-box"><h3>🪙 포인트 얻는 방법</h3><table><thead><tr><th>방법</th><th>포인트</th><th>횟수</th></tr></thead><tbody>{WORLD_EARNING_ROWS.map(r=><tr key={r[0]}><td>{r[0]}</td><td><b>{r[1]}</b></td><td>{r[2]}</td></tr>)}</tbody></table><p>💡 포인트는 실제 돈을 쓰지 않고 앱 활동으로 모으는 월드 전용 재화예요.</p></div><div className="item-grid">{WORLD_ITEMS.map(item=>{const owned=inventory.some(x=>x.item_id===item.id);return <div className="item-card" key={item.id}><div className="item-art">{item.image}</div><b>{item.name}</b><small>{item.description||'나만의 미니홈피를 꾸며보세요.'}</small><div className="item-buy"><strong>{item.price===0?'기본':`${item.price.toLocaleString()}P`}</strong><button disabled={owned} onClick={()=>buy(item)}>{owned?'보유중':item.price===0?'사용하기':'구매'}</button></div></div>})}</div></section>}
      {view==='ranking' && <section className="world-panel"><div className="ranking-hero"><h2>🏆 이번 주 씩씩이 랭킹</h2><p>월요일~일요일 · 출석 +1 / 첫 자유채팅 +1</p>{winner&&<div className="king">👑 지난주 <b>{winner.display_name}</b> 님이 <strong>씩씩이왕</strong>이었어요!</div>}</div><div className="ranking-list">{ranking.map((r,i)=><div className={`ranking-row r${i+1}`} key={r.user_id}><span className="rank">{i<3?['🥇','🥈','🥉'][i]:i+1}</span><b>{r.display_name}</b><span className="score">{r.weekly_score}점</span>{i<4&&<span className="bonus">주말 보너스 +{WORLD_RANKING_BONUS[i].toLocaleString()}P</span>}</div>)}</div></section>}
      {view==='guestbook' && <section className="world-panel"><h2>💌 내 미니홈피 방명록</h2><div className="guest-form"><input value={guestText} onChange={e=>setGuestText(e.target.value)} placeholder="방명록을 남겨보세요" maxLength={300}/><button onClick={postGuest}>남기기</button></div>{guestbook.length===0?<p className="muted">아직 방명록이 없어요. 첫 글을 남겨보세요!</p>:guestbook.map(g=><div className="guest-row" key={g.id}>💌 <b>{g.writer_id===session.user.id?'나':g.writer_id}</b><span>{g.content}</span><small>{new Date(g.created_at).toLocaleString('ko-KR')}</small></div>)}</section>}
      {selectedHome && <section className="world-panel visit-preview"><div className="mini-home-top"><div><h2>{selectedHome.display_name}'s MINI HOME</h2><p>💬 {selectedHome.status_message}</p></div><div>TODAY {selectedHome.today_visits} / TOTAL {selectedHome.total_visits}<br/>❤️ {selectedHome.likes}</div></div><WorldScene profile={selectedHome} isOwner={false} onToggleScene={()=>{}}/><div className="home-actions"><button onClick={like}>{liked?'💗 좋아요 취소':'❤️ 좋아요'}</button><button onClick={()=>openGuestbook()}>💌 방명록</button><button onClick={()=>setSelectedHome(null)}>← 내 미니홈피</button></div></section>}
    </main>
    {message&&<div className="world-toast" onClick={()=>setMessage('')}>{message}</div>}
  </div>;
}
