import React, { useEffect, useMemo, useState } from 'react';
import { getSession } from '../services/auth';
import { supabase } from '../lib/supabase';
import { WORLD_EARNING_ROWS, WORLD_ITEMS, WORLD_RANKING_BONUS, WORLD_WELCOME_POINTS } from '../constants/world';
import {
  ensureWorldProfile, syncWorldProfiles, awardWorldWeeklyBonuses, getWorldProfile, getWorldPoints, getWorldProfiles,
  listWorldInventory, listWorldRanking, listWorldRankingHistory, updateWorldProfile, visitWorldHome, toggleWorldLike,
  createWorldGuestbookSecure, listWorldGuestbookSecure, createWorldGuestbookReply, purchaseWorldItem, recordWorldActivity,
  listWorldRoomItems, addWorldRoomItem, updateWorldRoomItem, deleteWorldRoomItem, listWorldTodayAttendance,
  listWorldNotifications, markWorldNotificationsRead, sendWorldGift,
} from '../services/world';
import type { WorldProfile, WorldRankingRow, WorldView, WorldRoomItem } from '../types/world';
import WorldScene from '../components/world/WorldScene';
import WorldNavigation from '../components/world/WorldNavigation';
import '../styles/world.css';

const weekStart = () => { const d = new Date(); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; d.setDate(d.getDate()+diff); return d.toISOString().slice(0,10); };
const lastWeekStart = () => { const d = new Date(weekStart()); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10); };
const formatWeek = (s: string) => { const d=new Date(`${s}T00:00:00`); const e=new Date(d); e.setDate(e.getDate()+6); return `${s.replaceAll('-','.')} ~ ${e.toISOString().slice(0,10).replaceAll('-','.')}`; };

type Guest = { id:string; writer_id:string|null; writer_name:string; content:string; is_secret:boolean; created_at:string; replies:any[] };
type Notice = { id:string; notification_type:string; title:string; body:string; related_id:string|null; is_read:boolean; created_at:string };

export default function WorldPage() {
  const [session,setSession]=useState<any>(null);
  const [roomItems,setRoomItems]=useState<WorldRoomItem[]>([]);
  const [decorate,setDecorate]=useState(false);
  const [profile,setProfile]=useState<WorldProfile|null>(null);
  const [profiles,setProfiles]=useState<any[]>([]);
  const [view,setView]=useState<WorldView>('home');
  const [points,setPoints]=useState(0);
  const [ranking,setRanking]=useState<WorldRankingRow[]>([]);
  const [winner,setWinner]=useState<WorldRankingRow|null>(null);
  const [history,setHistory]=useState<any[]>([]);
  const [inventory,setInventory]=useState<any[]>([]);
  const [guestbook,setGuestbook]=useState<Guest[]>([]);
  const [guestOwnerId,setGuestOwnerId]=useState('');
  const [guestText,setGuestText]=useState('');
  const [guestSecret,setGuestSecret]=useState(false);
  const [replyOpen,setReplyOpen]=useState<string|null>(null);
  const [replyText,setReplyText]=useState('');
  const [editingStatus,setEditingStatus]=useState(false);
  const [status,setStatus]=useState('');
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');
  const [selectedHome,setSelectedHome]=useState<WorldProfile|null>(null);
  const [liked,setLiked]=useState(false);
  const [attendance,setAttendance]=useState<any[]>([]);
  const [notices,setNotices]=useState<Notice[]>([]);
  const [giftItem,setGiftItem]=useState<any|null>(null);

  const reload=async(userId:string)=>{
    const p=await getWorldProfile(userId); if(p.data){setProfile(p.data);setStatus(p.data.status_message||'');}
    const bal=await getWorldPoints(userId); if(bal.data!==null)setPoints(bal.data);
    const inv=await listWorldInventory(userId); if(inv.data)setInventory(inv.data);
    const r=await listWorldRanking(weekStart()); if(r.data)setRanking(r.data.map((x:any,i)=>({...x,rank:i+1})));
    const w=await listWorldRanking(lastWeekStart()); if(w.data?.[0])setWinner({...w.data[0],rank:1});
    const h=await listWorldRankingHistory(); if(h.data)setHistory(h.data);
    const ps=await getWorldProfiles(); if(ps.data)setProfiles(ps.data);
    const ri=await listWorldRoomItems(userId); if(ri.data)setRoomItems(ri.data as WorldRoomItem[]);
    const a=await listWorldTodayAttendance(); if(a.data)setAttendance(Array.isArray(a.data)?a.data:[]);
    const n=await listWorldNotifications(); if(n.data)setNotices(Array.isArray(n.data)?n.data:[]);
  };

  useEffect(()=>{ getSession().then(async({data:{session}})=>{ if(!session?.user){window.location.href='/';return;} setSession(session); try { await ensureWorldProfile(session.user.id); await syncWorldProfiles(); await supabase.rpc('ensure_world_room_defaults',{p_user_id:session.user.id}); await awardWorldWeeklyBonuses(lastWeekStart()).catch(() => {}); await recordWorldActivity(session.user.id,'attendance'); await reload(session.user.id); } catch (error) { console.error('World initialization failed:', error); setMessage('씩씩이 월드를 불러오지 못했어요. Supabase 설정을 확인해주세요.'); } finally { setLoading(false); } }); },[]);
  useEffect(()=>{ if(selectedHome && session?.user){ visitWorldHome(session.user.id,selectedHome.user_id).then(()=>reload(session.user.id)); } },[selectedHome]);

  const myProfile=profile;
  const otherProfiles=useMemo(()=>profiles.filter(p=>p.user_id!==session?.user?.id),[profiles,session]);
  const placedCount=(itemId:string)=>roomItems.filter(i=>i.item_id===itemId).length;
  const inventoryCount=(itemId:string)=>Number(inventory.find((x:any)=>x.item_id===itemId)?.quantity ?? 0);
  const unread=notices.filter(n=>!n.is_read).length;

  const addFurniture=async(item:any)=>{ const available=inventoryCount(item.id)-placedCount(item.id); if(available<=0){setMessage(`현재 ${item.name}을(를) 더 배치할 수 없어요.`);return;} const r=await addWorldRoomItem(session.user.id,item.id,24+Math.random()*10,34+Math.random()*10,0.5,12); if(r.error){setMessage('가구를 배치하지 못했어요. 007_world_inventory_count.sql을 확인해주세요.');return;} await reload(session.user.id); setMessage(`${item.name}을(를) 방에 배치했어요.`); };
  const moveFurniture=async(id:string,x:number,y:number)=>{setRoomItems(items=>items.map(i=>i.id===id?{...i,x,y}:i));await updateWorldRoomItem(session.user.id,id,{x,y});};
  const scaleFurniture=async(id:string,scale:number)=>{setRoomItems(items=>items.map(i=>i.id===id?{...i,scale}:i));await updateWorldRoomItem(session.user.id,id,{scale});};
  const frontFurniture=async(id:string)=>{const maxZ=Math.max(20,...roomItems.map(i=>Number(i.z_index)||0));setRoomItems(items=>items.map(i=>i.id===id?{...i,z_index:maxZ+1}:i));await updateWorldRoomItem(session.user.id,id,{z_index:maxZ+1});};
  const removeFurniture=async(id:string)=>{const r=await deleteWorldRoomItem(session.user.id,id);if(r.error){setMessage('가구를 아이템함으로 돌려놓지 못했어요.');return;}await reload(session.user.id);setMessage('아이템을 아이템함으로 돌려놓았어요.');};
  const buy=async(item:any)=>{if(item.price===0){setMessage('기본 아이템은 아이템함에서 바로 배치할 수 있어요.');return;}const r=await purchaseWorldItem(session.user.id,item.id,item.price);if(r.error){setMessage('구매에 실패했어요.');return;}if(r.data?.success){setMessage(`${item.name}을(를) 구매했어요!`);await reload(session.user.id);}else setMessage(r.data?.reason==='insufficient_points'?'포인트가 부족해요.':'구매에 실패했어요.');};
  const saveStatus=async()=>{await updateWorldProfile(session.user.id,{status_message:status});setEditingStatus(false);await reload(session.user.id);};
  const toggleScene=async()=>{if(!myProfile)return;await updateWorldProfile(session.user.id,{scene_type:myProfile.scene_type==='interior'?'exterior':'interior'});await reload(session.user.id);};
  const like=async()=>{if(!selectedHome)return;const r=await toggleWorldLike(session.user.id,selectedHome.user_id);if(!r.error){setLiked(Boolean(r.data?.liked));setSelectedHome({...selectedHome,likes:selectedHome.likes+(r.data?.liked?1:-1)});}};

  const loadGuestbook=async(ownerId:string)=>{setGuestOwnerId(ownerId);const g=await listWorldGuestbookSecure(ownerId);if(g.data)setGuestbook(Array.isArray(g.data)?g.data:[]);};
  const openGuestbook=async(ownerId=session.user.id)=>{setView('guestbook');await loadGuestbook(ownerId);};
  const postGuest=async()=>{if(!guestText.trim())return;const r=await createWorldGuestbookSecure(guestOwnerId||session.user.id,guestText.trim(),guestSecret);if(r.error){setMessage('방명록을 등록하지 못했어요.');return;}setGuestText('');setGuestSecret(false);await loadGuestbook(guestOwnerId||session.user.id);await reload(session.user.id);};
  const postReply=async(id:string)=>{if(!replyText.trim())return;const r=await createWorldGuestbookReply(id,replyText.trim());if(r.error){setMessage('답글을 등록하지 못했어요.');return;}setReplyText('');setReplyOpen(null);await loadGuestbook(guestOwnerId);await reload(session.user.id);};
  const openNotifications=async()=>{setView('notifications');const n=await listWorldNotifications();if(n.data)setNotices(Array.isArray(n.data)?n.data:[]);await markWorldNotificationsRead();setNotices(ns=>ns.map(n=>({...n,is_read:true})));};
  const sendGift=async(recipientId:string)=>{if(!giftItem)return;const r=await sendWorldGift(recipientId,giftItem.id);if(r.error){setMessage('선물을 보내지 못했어요.');return;}if(r.data?.success){setGiftItem(null);setMessage(`${giftItem.name}을(를) 선물했어요!`);await reload(session.user.id);}else setMessage(r.data?.reason==='insufficient_points'?'포인트가 부족해요.':'선물할 수 없는 아이템이에요.');};

  if(loading)return <div className="world-loading">🌱 씩씩이 월드를 준비하고 있어요...</div>;
  return <div className="world-app">
    <header className="world-header"><div><span className="world-logo">🌐 씩씩이 월드</span><span className="world-sub">미니홈피가 중심이고, 광장은 놀러 가는 곳</span></div><div className="world-header-right"><button className="notification-button" onClick={openNotifications}>🔔 {unread>0&&<b>{unread}</b>}</button><div className="world-points">🪙 <b>{points.toLocaleString()}P</b></div></div></header>
    <WorldNavigation view={view} onChange={v=>{setView(v);if(v==='guestbook')openGuestbook();}} onCalendar={()=>{window.location.href=window.location.pathname;}} />
    <main className="world-main">
      {view==='home' && myProfile && <>
        {selectedHome ? <section className="mini-home-card friend-home-card"><div className="mini-home-top"><div><h1>{selectedHome.display_name || '씩씩이'}'s MINI HOME</h1><p>💬 {selectedHome.status_message || '놀러오세요!'}</p></div><div className="visit-stats">TODAY <b>{selectedHome.today_visits}</b>　/　TOTAL <b>{selectedHome.total_visits}</b><br/>❤️ 좋아요 <b>{selectedHome.likes}</b></div></div><WorldScene profile={selectedHome} isOwner={false} onToggleScene={()=>{}}/><div className="home-actions"><button onClick={like}>{liked?'💗 좋아요 취소':'❤️ 좋아요'}</button><button onClick={()=>openGuestbook(selectedHome.user_id)}>💌 방명록</button><button onClick={()=>{setSelectedHome(null);setLiked(false);}}>🏠 내 미니홈피</button></div></section> : <>
          <div className="mini-home-card"><div className="mini-home-top"><div><h1>{myProfile.display_name || '씩씩이'}'s MINI HOME</h1>{editingStatus?<div className="status-edit"><input value={status} onChange={e=>setStatus(e.target.value)} maxLength={60}/><button onClick={saveStatus}>저장</button></div>:<p onClick={()=>setEditingStatus(true)}>💬 {myProfile.status_message} <small>(눌러서 수정)</small></p>}</div><div className="visit-stats">TODAY <b>{myProfile.today_visits}</b>　/　TOTAL <b>{myProfile.total_visits}</b><br/>❤️ 좋아요 <b>{myProfile.likes}</b></div></div><WorldScene profile={myProfile} isOwner roomItems={roomItems} onMoveItem={moveFurniture} onScaleItem={scaleFurniture} onRemoveItem={removeFurniture} onFrontItem={frontFurniture} onOpenInventory={()=>setDecorate(true)} decorate={decorate} onToggleDecorate={()=>setDecorate(v=>!v)} onToggleScene={toggleScene}/><div className="home-actions"><button onClick={()=>setDecorate(v=>!v)}>📦 내 아이템</button><button onClick={()=>setView('shop')}>🛍️ 포인트샵</button><button onClick={()=>openGuestbook(session.user.id)}>💌 방명록 보기</button><button onClick={()=>setView('friends')}>👥 친구 만나기</button></div>
          {decorate && <div className="decorate-panel"><div className="decorate-head"><div><h3>🪑 내 아이템함</h3><p>아이템을 방에 놓은 뒤, 선택해서 이동·크기 조절·앞으로 보내기·수거를 할 수 있어요.</p></div><button className="decorate-close" onClick={()=>setDecorate(false)}>아이템 목록 닫기</button></div><div className="decorate-grid">{inventory.filter((x:any)=>['furniture','props'].includes(WORLD_ITEMS.find(i=>i.id===x.item_id)?.type||'')).map((owned:any)=>{const item=WORLD_ITEMS.find(i=>i.id===owned.item_id);if(!item)return null;const total=Number(owned.quantity??1);const placed=placedCount(item.id);const available=Math.max(0,total-placed);return <div className="decorate-card" key={owned.item_id}><div className="decorate-art">{item.image}</div><b>{item.name}</b><small>보유 {total}개 · 배치 {placed}개 · 남음 {available}개</small><button disabled={available<=0} onClick={()=>addFurniture(item)}>{available>0?'방에 놓기':'배치 완료'}</button></div>})}</div></div>}
          </div>
          <section className="attendance-panel"><div><h3>🟢 오늘 출석한 멤버 <b>{attendance.length}명</b></h3><p>오늘 씩씩이 월드에 처음 들어온 멤버예요.</p></div><div className="attendance-list">{attendance.length?attendance.map(a=><span key={a.user_id}>● {a.display_name}</span>):<span className="muted">아직 출석한 멤버가 없어요.</span>}</div></section>
          <div className="world-tip"><b>🎁 시작 선물 {WORLD_WELCOME_POINTS.toLocaleString()}P</b><span>처음 씩씩이 월드에 오면 3,000P로 시작해요.</span></div>
        </>}
      </>}

      {view==='friends' && <section className="world-panel"><h2>👥 1촌 / 친구 미니홈피</h2><p className="muted">다른 멤버의 미니홈피를 방문하면 멤버별 하루 1회 +100P를 받을 수 있어요.</p><div className="friend-grid">{otherProfiles.length===0?<div className="muted">아직 다른 공유캘린더 멤버가 없어요.</div>:otherProfiles.map(p=><button className="friend-card" key={p.user_id} onClick={()=>{setSelectedHome(p);setView('home');}}><b>{p.display_name||'씩씩이'}</b><small>{p.status_message||'놀러오세요!'}</small><em>🏠 미니홈피 방문</em></button>)}</div></section>}
      {view==='plaza' && <section className="world-panel plaza"><h2>🏛️ 씩씩이 광장</h2><div className="plaza-scene">🌳　🌷　🪑　🐶　✨　🎈<br/><b>친구들과 만나고 구경하는 공용 공간</b><small>광장 세부 콘텐츠는 다음 단계에서 확장해요.</small></div></section>}
      {view==='shop' && <section className="world-panel"><div className="shop-head"><div><h2>🛍️ 포인트샵</h2><p>현재 보유 포인트 <b>{points.toLocaleString()}P</b></p></div><div className="welcome-badge">🎁 처음 시작하면 {WORLD_WELCOME_POINTS.toLocaleString()}P</div></div><div className="earning-box"><h3>🪙 포인트 얻는 방법</h3><table><thead><tr><th>방법</th><th>포인트</th><th>횟수</th></tr></thead><tbody>{WORLD_EARNING_ROWS.map(r=><tr key={r[0]}><td>{r[0]}</td><td><b>{r[1]}</b></td><td>{r[2]}</td></tr>)}</tbody></table></div><div className="item-grid">{WORLD_ITEMS.map(item=>{const qty=inventoryCount(item.id);return <div className="item-card" key={item.id}><div className="item-art">{item.image}</div><b>{item.name}</b><small>{item.description||'나만의 미니홈피를 꾸며보세요.'}</small><div className="item-buy"><strong>{item.price===0?'기본':`${item.price.toLocaleString()}P`}</strong><span className="owned-count">보유 {qty}개</span><button onClick={()=>buy(item)}>{item.price===0?'기본 아이템':'구매 +1'}</button>{item.price>0&&<button className="gift-button" onClick={()=>setGiftItem(item)}>🎁</button>}</div></div>})}</div></section>}
      {view==='ranking' && <section className="world-panel"><div className="ranking-hero"><h2>🏆 이번 주 씩씩이 랭킹</h2><p>월요일~일요일 · 출석 +1 / 첫 자유채팅 +1</p>{winner&&<div className="king">👑 지난주 <b>{winner.display_name}</b> 님이 <strong>씩씩이</strong>였어요!</div>}</div><div className="ranking-list">{ranking.map((r,i)=><div className={`ranking-row r${i+1}`} key={r.user_id}><span className="rank">{i<3?['🥇','🥈','🥉'][i]:i+1}</span><b>{r.display_name}</b><span className="score">{r.weekly_score}점</span>{i<4&&<span className="bonus">주간 보너스 +{WORLD_RANKING_BONUS[i].toLocaleString()}P</span>}</div>)}</div><div className="history-box"><h3>📚 역대 씩씩이 기록</h3>{Object.entries(history.reduce((acc:any,r:any)=>{(acc[r.week_start]??=[]).push(r);return acc;},{})).map(([week,rows]:any)=><div className="history-week" key={week}><b>{formatWeek(week)}</b>{rows.slice(0,5).map((r:any,i:number)=><span key={r.user_id}>{i<3?['🥇','🥈','🥉'][i]:`${i+1}위`} {r.display_name} · {r.weekly_score}점</span>)}</div>)}</div></section>}
      {view==='guestbook' && <section className="world-panel"><div className="guestbook-title"><div><h2>💌 {guestOwnerId===session.user.id?'내':'친구'} 미니홈피 방명록</h2><p className="muted">{guestOwnerId===session.user.id?'누구나 방명록을 남길 수 있어요.':'방문한 미니홈피에 방명록을 남겨보세요.'}</p></div>{guestOwnerId!==session.user.id&&<button onClick={()=>{setSelectedHome(null);setView('home');}}>🏠 내 미니홈피</button>}</div><div className="guest-form"><input value={guestText} onChange={e=>setGuestText(e.target.value)} placeholder="방명록을 남겨보세요" maxLength={300}/><label className="secret-check"><input type="checkbox" checked={guestSecret} onChange={e=>setGuestSecret(e.target.checked)}/> 🔒 비밀글</label><button onClick={postGuest}>남기기</button></div>{guestbook.length===0?<p className="muted">아직 방명록이 없어요. 첫 글을 남겨보세요!</p>:guestbook.map(g=><div className={`guest-thread ${g.is_secret?'secret':''}`} key={g.id}><div className="guest-row"><span>{g.is_secret?'🔒':'💌'}</span><b>{g.writer_name}</b><span>{g.content}</span><small>{new Date(g.created_at).toLocaleString('ko-KR')}</small></div><button className="reply-button" onClick={()=>setReplyOpen(replyOpen===g.id?null:g.id)}>↳ 답글</button>{replyOpen===g.id&&<div className="reply-form"><input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder={g.is_secret?'🔒 비밀 답글을 남겨보세요':'답글을 남겨보세요'} maxLength={300}/><button onClick={()=>postReply(g.id)}>등록</button></div>}{g.replies?.map((r:any)=><div className="reply-row" key={r.id}><span>↳ {g.is_secret?'🔒':'💬'}</span><b>{r.writer_name}</b><span>{r.content}</span><small>{new Date(r.created_at).toLocaleString('ko-KR')}</small></div>)}</div>)}</section>}
      {view==='notifications' && <section className="world-panel"><div className="notification-head"><h2>🔔 알림함</h2><button onClick={async()=>{await markWorldNotificationsRead();setNotices(ns=>ns.map(n=>({...n,is_read:true})));}}>모두 읽음</button></div>{notices.length===0?<p className="muted">아직 알림이 없어요.</p>:notices.map(n=><div className={`notice-row ${n.is_read?'read':'unread'}`} key={n.id}><span className="notice-icon">{n.notification_type==='gift'?'🎁':n.notification_type==='ranking'?'🏆':n.notification_type==='points'?'💰':n.notification_type==='guestbook_reply'?'💬':'💌'}</span><div><b>{n.title}</b><p>{n.body}</p><small>{new Date(n.created_at).toLocaleString('ko-KR')}</small></div></div>)}</section>}
    </main>
    {giftItem&&<div className="modal-backdrop" onClick={()=>setGiftItem(null)}><div className="gift-modal" onClick={e=>e.stopPropagation()}><h3>🎁 {giftItem.name} 선물하기</h3><p>{giftItem.price.toLocaleString()}P · 누구에게 보낼까요?</p><div className="gift-recipient-list">{otherProfiles.map(p=><button key={p.user_id} onClick={()=>sendGift(p.user_id)}><b>{p.display_name||'씩씩이'}</b><small>{p.status_message||'놀러오세요!'}</small></button>)}</div><button className="modal-close" onClick={()=>setGiftItem(null)}>닫기</button></div></div>}
    {message&&<div className="world-toast" onClick={()=>setMessage('')}>{message}</div>}
  </div>;
}
