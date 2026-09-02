import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase 설정 ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 프리셋 색상 ---
const PRESET_COLORS = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#9370DB', '#FF8C00', '#20B2AA'];

export default function CalendarApp() {
  // --- 인증 및 유저 상태 ---
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // --- 메인 네비게이션 및 모달 상태 ---
  const [activeTab, setActiveTab] = useState<'calendar' | 'chat' | 'vote' | 'settlement'>('calendar');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [roomManageModalOpen, setRoomManageModalOpen] = useState(false);
  const [eventAddModalOpen, setEventAddModalOpen] = useState(false);

  // --- 방(Room) 및 캘린더 상태 ---
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);

  // --- 일정 추가 폼 상태 ---
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventContent, setNewEventContent] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventEndDate, setNewEventEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventColor, setNewEventColor] = useState(PRESET_COLORS[0]);
  const [newEventRoomId, setNewEventRoomId] = useState('');

  // --- 커뮤니티(채팅, 투표, 정산) 상태 ---
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- 초기 세션 및 데이터 로드 ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && userProfile?.status === 'approved') {
      fetchRooms();
      fetchProfiles();
    }
  }, [session, userProfile]);

  useEffect(() => {
    if (selectedRoomIds.length > 0) {
      fetchEvents();
    } else {
      setEvents([]);
    }
  }, [selectedRoomIds]);

  // 실시간 구독 설정 (Realtime)
  useEffect(() => {
    if (!session || userProfile?.status !== 'approved') return;

    const channel = supabase
      .channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, userProfile, selectedRoomIds]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) {
      setUserProfile(data);
    }
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase.from('rooms').select('*').order('sort_order', { ascending: true });
    if (!error && data) {
      setRooms(data);
      if (data.length > 0 && selectedRoomIds.length === 0) {
        setSelectedRoomIds([data[0].id]);
        setNewEventRoomId(data[0].id);
      }
    }
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      setAllProfiles(data);
      setPendingProfiles(data.filter((p: any) => p.status === 'pending'));
    }
  };

  const fetchEvents = async () => {
    if (selectedRoomIds.length === 0) return;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('room_id', selectedRoomIds);
    if (!error && data) {
      setEvents(data);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*, profiles(name, color)').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  // --- 인증 핸들러 ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(error.message);
        return;
      }
      if (data.user) {
        await supabase.from('profiles').insert([
          { id: data.user.id, email, name, color, status: 'pending', role: 'user' }
        ]);
        alert('회원가입 요청이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
      }
    }
  };

  // --- 관리자 기능: 유저 승인 ---
  const approveUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'approved' }).eq('id', userId);
    if (!error) {
      fetchProfiles();
      alert('승인되었습니다.');
    }
  };

  // --- 방 관리 기능 ---
  const createRoom = async () => {
    const roomName = prompt('새로운 방 이름을 입력하세요:');
    if (!roomName) return;
    const { error } = await supabase.from('rooms').insert([{ name: roomName, sort_order: rooms.length + 1 }]);
    if (!error) fetchRooms();
  };

  const updateRoomName = async (roomId: string, currentName: string) => {
    const newName = prompt('변경할 방 이름을 입력하세요:', currentName);
    if (!newName) return;
    const { error } = await supabase.from('rooms').update({ name: newName }).eq('id', roomId);
    if (!error) fetchRooms();
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm('정말 이 방을 삭제하시겠습니까? 관련된 모든 일정 데이터가 삭제될 수 있습니다.')) return;
    const { error } = await supabase.from('rooms').delete().eq('id', roomId);
    if (!error) {
      setSelectedRoomIds(selectedRoomIds.filter(id => id !== roomId));
      fetchRooms();
    }
  };

  const moveRoomOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rooms.length) return;
    
    const newRooms = [...rooms];
    const temp = newRooms[index];
    newRooms[index] = newRooms[targetIndex];
    newRooms[targetIndex] = temp;

    // 순서 일괄 업데이트
    for (let i = 0; i < newRooms.length; i++) {
      await supabase.from('rooms').update({ sort_order: i + 1 }).eq('id', newRooms[i].id);
    }
    fetchRooms();
  };

  // --- 일정 추가 제출 핸들러 ---
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const { error } = await supabase.from('events').insert([{
      room_id: newEventRoomId || selectedRoomIds[0],
      user_id: session.user.id,
      title: newEventTitle,
      content: newEventContent,
      event_date: newEventStartDate,
      end_date: newEventEndDate,
      color: newEventColor
    }]);

    if (error) {
      alert(error.message);
    } else {
      setNewEventTitle('');
      setNewEventContent('');
      setEventAddModalOpen(false);
      fetchEvents();
    }
  };

  // --- 채팅 전송 ---
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await supabase.from('messages').insert([{ user_id: session.user.id, content: newMessage }]);
    setNewMessage('');
    fetchMessages();
  };

  // --- 화면 렌더링: 미인증 또는 승인 대기 중 ---
  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f6fa' }}>
        <form onSubmit={handleAuth} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '320px' }}>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>씩씩이들의 공유캘린더</h2>
          {authMode === 'signup' && (
            <>
              <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#666' }}>대표 색상 선택</label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {PRESET_COLORS.map(c => (
                    <div key={c} onClick={() => setColor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '2px solid #333' : 'none' }} />
                  ))}
                </div>
              </div>
            </>
          )}
          <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#4D96FF', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {authMode === 'login' ? '로그인' : '회원가입 요청'}
          </button>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ textAlign: 'center', marginTop: '15px', fontSize: '12px', color: '#666', cursor: 'pointer' }}>
            {authMode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </p>
        </form>
      </div>
    );
  }

  if (userProfile && userProfile.status === 'pending') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>관리자 승인 대기 중입니다.</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>관리자가 가입을 승인하면 캘린더를 이용할 수 있습니다.</p>
        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '20px', padding: '8px 16px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>로그아웃</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* 사이드바 */}
      <div style={{ width: sidebarOpen ? '260px' : '0px', transition: 'width 0.3s', background: 'white', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>씩씩이 캘린더</h3>
          {userProfile?.role === 'admin' && (
            <button onClick={() => setAdminModalOpen(true)} style={{ fontSize: '11px', padding: '4px 8px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>관리</button>
          )}
        </div>

        <div style={{ padding: '15px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#888' }}>공유 방 목록</span>
            <button onClick={createRoom} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>+</button>
          </div>
          {rooms.map((room, idx) => (
            <div key={room.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', marginBottom: '4px', borderRadius: '6px', background: selectedRoomIds.includes(room.id) ? '#eef2ff' : 'transparent' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', flex: 1 }}>
                <input 
                  type="checkbox" 
                  checked={selectedRoomIds.includes(room.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedRoomIds([...selectedRoomIds, room.id]);
                    else setSelectedRoomIds(selectedRoomIds.filter(id => id !== room.id));
                  }}
                />
                {room.name}
              </label>
              <button onClick={() => setRoomManageModalOpen(true)} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#666', cursor: 'pointer' }}>⚙️</button>
            </div>
          ))}

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('calendar')} style={{ padding: '10px', textAlign: 'left', border: 'none', background: activeTab === 'calendar' ? '#4D96FF' : 'transparent', color: activeTab === 'calendar' ? 'white' : '#333', borderRadius: '6px', cursor: 'pointer' }}>📅 캘린더</button>
            <button onClick={() => { setActiveTab('chat'); fetchMessages(); }} style={{ padding: '10px', textAlign: 'left', border: 'none', background: activeTab === 'chat' ? '#4D96FF' : 'transparent', color: activeTab === 'chat' ? 'white' : '#333', borderRadius: '6px', cursor: 'pointer' }}>💬 실시간 채팅</button>
            <button onClick={() => setActiveTab('vote')} style={{ padding: '10px', textAlign: 'left', border: 'none', background: activeTab === 'vote' ? '#4D96FF' : 'transparent', color: activeTab === 'vote' ? 'white' : '#333', borderRadius: '6px', cursor: 'pointer' }}>📊 투표</button>
            <button onClick={() => setActiveTab('settlement')} style={{ padding: '10px', textAlign: 'left', border: 'none', background: activeTab === 'settlement' ? '#4D96FF' : 'transparent', color: activeTab === 'settlement' ? 'white' : '#333', borderRadius: '6px', cursor: 'pointer' }}>💰 정산</button>
          </div>
        </div>

        <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{userProfile?.name}님</span>
          <button onClick={() => supabase.auth.signOut()} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>로그아웃</button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '60px', background: 'white', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>☰</button>
          <h2 style={{ fontSize: '16px', margin: 0 }}>{activeTab === 'calendar' ? '캘린더' : activeTab === 'chat' ? '실시간 채팅' : activeTab === 'vote' ? '투표' : '정산'}</h2>
          {activeTab === 'calendar' && (
            <button onClick={() => setEventAddModalOpen(true)} style={{ padding: '6px 12px', background: '#4D96FF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ 일정 추가</button>
          )}
        </header>

        <main style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          {activeTab === 'calendar' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3>선택된 방 일정 현황</h3>
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.length === 0 ? (
                  <p style={{ color: '#888', fontSize: '14px' }}>등록된 일정이 없습니다.</p>
                ) : (
                  events.map(ev => (
                    <div key={ev.id} style={{ padding: '12px', borderLeft: `5px solid ${ev.color || '#4D96FF'}`, background: '#fdfdfd', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{ev.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{ev.event_date} ~ {ev.end_date}</p>
                      {ev.content && <p style={{ margin: '6px 0 0 0', fontSize: '13px' }}>{ev.content}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.user_id === session.user.id ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{msg.profiles?.name}</span>
                    <div style={{ background: msg.user_id === session.user.id ? '#4D96FF' : '#eee', color: msg.user_id === session.user.id ? 'white' : '#333', padding: '8px 12px', borderRadius: '8px', maxWidth: '70%', wordBreak: 'break-all', fontSize: '14px' }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="메시지를 입력하세요..." value={newMessage} onChange={e => setNewMessage(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                <button type="submit" style={{ padding: '0 20px', background: '#4D96FF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>전송</button>
              </form>
            </div>
          )}

          {activeTab === 'vote' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', height: '100%' }}>
              <h3>투표 기능</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>투표 목록 및 생성 UI 영역입니다.</p>
            </div>
          )}

          {activeTab === 'settlement' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', height: '100%' }}>
              <h3>정산 기능</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>지출 내역 및 1/N 정산 영역입니다.</p>
            </div>
          )}
        </main>
      </div>

      {/* 일정 추가 모달 */}
      {eventAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <form onSubmit={handleAddEvent} style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '380px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>새 일정 추가</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>방 선택</label>
              <select value={newEventRoomId} onChange={e => setNewEventRoomId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>제목</label>
              <input type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} required placeholder="일정 제목" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>내용</label>
              <textarea value={newEventContent} onChange={e => setNewEventContent(e.target.value)} placeholder="상세 내용" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', height: '60px' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>시작일</label>
                <input type="date" value={newEventStartDate} onChange={e => setNewEventStartDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>종료일</label>
                <input type="date" value={newEventEndDate} onChange={e => setNewEventEndDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>색상 선택</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(color => (
                  <div
                    key={color}
                    onClick={() => setNewEventColor(color)}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color, cursor: 'pointer', border: newEventColor === color ? '2px solid #333' : 'none' }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#4D96FF', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>저장</button>
              <button type="button" onClick={() => setEventAddModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#eee', color: '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 관리자 모달 (멤버 관리) */}
      {adminModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '420px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>멤버 승인 관리</h3>
            {pendingProfiles.length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px' }}>승인 대기 중인 유저가 없습니다.</p>
            ) : (
              pendingProfiles.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{p.name}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>{p.email}</p>
                  </div>
                  <button onClick={() => approveUser(p.id)} style={{ padding: '6px 12px', background: '#6BCB77', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>승인</button>
                </div>
              ))
            )}
            <button onClick={() => setAdminModalOpen(false)} style={{ width: '100%', marginTop: '20px', padding: '10px', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>닫기</button>
          </div>
        </div>
      )}

      {/* 방 관리 모달 */}
      {roomManageModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>공유 방 관리</h3>
            {rooms.map((room, index) => (
              <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{room.name}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => moveRoomOrder(index, 'up')} style={{ padding: '4px 8px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                  <button onClick={() => moveRoomOrder(index, 'down')} style={{ padding: '4px 8px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                  <button onClick={() => updateRoomName(room.id, room.name)} style={{ padding: '4px 8px', background: '#4D96FF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>수정</button>
                  <button onClick={() => deleteRoom(room.id)} style={{ padding: '4px 8px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                </div>
              </div>
            ))}
            <button onClick={() => setRoomManageModalOpen(false)} style={{ width: '100%', marginTop: '20px', padding: '10px', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>닫기</button>
          </div>
        </div>
      )}

    </div>
  );
}
