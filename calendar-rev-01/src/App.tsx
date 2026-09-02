import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const customStorage = {
  getItem: (key) => {
    return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  },
  setItem: (key, value) => {
    const keepLoggedIn = window.localStorage.getItem('keepLoggedIn') !== 'false';
    if (keepLoggedIn) {
      window.localStorage.setItem(key, value);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const PRESET_COLORS = [
  '#ff6b6b', '#fa5252', '#ff922b', '#fab005', '#fcc419',
  '#82c91e', '#40c057', '#12b886', '#22b8cf', '#15aabf',
  '#339af0', '#4c6ef5', '#7950f2', '#be4bdb', '#f06595'
];

const DEFAULT_COLOR_LABELS: Record<string, string> = {
  '#ff6b6b': '술 모집',
  '#fa5252': '술 약속',
  '#ff922b': '피파 모집',
  '#fab005': '롤 모집',
  '#fcc419': '배그 모집',
  '#82c91e': '로아 모집',
  '#40c057': '기타게임 모집',
  '#12b886': '여행 일정',
  '#22b8cf': '캠핑 모집',
  '#15aabf': '기타 활동 모집',
  '#339af0': '쉬는날 공유(작성자 이름 필수)',
  '#4c6ef5': '여름휴가 일정(작성자 이름 필수)',
  '#7950f2': '겨울휴가 일정(작성자 이름 필수)',
  '#be4bdb': '번개',
  '#f06595': '정기모임 일정'
};

export default function CalendarApp() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupColor, setSignupColor] = useState('#339af0');
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false); // 💡 우측바 상태 복원
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [targetRoomIdForAdd, setTargetRoomIdForAdd] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [autoLogin, setAutoLogin] = useState(() => {
    return localStorage.getItem('keepLoggedIn') !== 'false';
  });

  const handleAutoLoginChange = (e) => {
    setAutoLogin(e.target.checked);
    localStorage.setItem('keepLoggedIn', e.target.checked.toString());
  };

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomManageModalOpen, setRoomManageModalOpen] = useState(false);
  const [eventAddModalOpen, setEventAddModalOpen] = useState(false);
  
  // 💡 달력 그리드 클릭 시 우측바에 띄우기 위한 상태
  const [rightSidebarDateStr, setRightSidebarDateStr] = useState('');
  const [rightSidebarEvents, setRightSidebarEvents] = useState<any[]>([]);

  // 일정 상세 정보 + 댓글 모달 상태
  const [eventDetailModalOpen, setEventDetailModalOpen] = useState(false);

  const [rooms, setRooms] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);
  
  const [eventEditModalOpen, setEventEditModalOpen] = useState(false);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventContent, setEditEventContent] = useState('');
  const [editEventStartDate, setEditEventStartDate] = useState('');
  const [editEventEndDate, setEditEventEndDate] = useState('');
  const [editEventColor, setEditEventColor] = useState('#339af0');

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomNameText, setEditRoomNameText] = useState('');
  
  const [newRoomName, setNewRoomName] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventContent, setNewEventContent] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');

  const [nameChangeModalOpen, setNameChangeModalOpen] = useState(false);
  const [newNameRequestText, setNewNameRequestText] = useState('');
  
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  
  const [newEventColor, setNewEventColor] = useState(PRESET_COLORS[0]);
  const [customPickerColor, setCustomPickerColor] = useState('#ff0000');
  const [customColorLabel, setCustomColorLabel] = useState('');

  const [colorLabels, setColorLabels] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('calendar_color_labels');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COLOR_LABELS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('calendar_color_labels', JSON.stringify(colorLabels));
    } catch (e) {
      console.error(e);
    }
  }, [colorLabels]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && profile && profile.status === 'approved') {
      fetchRooms();
      fetchEvents();
      fetchProfilesMap();
      if (profile.role === 'admin') {
        fetchPendingProfiles();
        fetchAllProfiles();
      }
    }
  }, [session, profile]);

  useEffect(() => {
    if (selectedEvent) {
      fetchComments(selectedEvent.id);
    } else {
      setComments([]);
    }
  }, [selectedEvent]);

  // 이벤트가 변경될 때 우측바가 열려있다면 우측바 목록도 실시간 반영
  useEffect(() => {
    if (rightSidebarOpen && rightSidebarDateStr) {
      const updatedEvents = events.filter(ev => {
        if (!selectedRoomIds.includes(ev.room_id)) return false;
        return rightSidebarDateStr >= ev.event_date && rightSidebarDateStr <= (ev.end_date || ev.event_date);
      });
      setRightSidebarEvents(updatedEvents);
    }
  }, [events]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('프로필 조회 실패:', err);
    }
  };

  const requestNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameRequestText.trim()) {
      alert('변경할 이름을 입력해주세요.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        requested_name: newNameRequestText.trim(),
        name_status: 'pending' 
      })
      .eq('id', session.user.id);

    if (error) {
      alert('이름 변경 신청 실패: ' + error.message);
    } else {
      alert('관리자에게 이름 변경 신청이 접수되었습니다. 승인을 기다려주세요.');
      setNewNameRequestText('');
      setNameChangeModalOpen(false);
      fetchProfile(session.user.id);
    }
  };
  
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchEndX - touchStartX;
    const minSwipeDistance = 50; 
    const edgeLimit = 120;       

    if (leftSidebarOpen && distance < -minSwipeDistance) {
      setLeftSidebarOpen(false);
    } else if (rightSidebarOpen && distance > minSwipeDistance) {
      setRightSidebarOpen(false);
    } else if (!leftSidebarOpen && !rightSidebarOpen && touchStartX < edgeLimit && distance > minSwipeDistance) {
      setLeftSidebarOpen(true);
    } else if (!leftSidebarOpen && !rightSidebarOpen && touchStartX > window.innerWidth - edgeLimit && distance < -minSwipeDistance) {
      setRightSidebarOpen(true);
    } else if (!leftSidebarOpen && !rightSidebarOpen && Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      } else {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      }
    }

    setTouchStartX(0);
    setTouchEndX(0);
  };
  
  const fetchRooms = async () => {
    const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      setRooms(data);
      if (selectedRoomIds.length === 0 && data.length > 0) {
        setSelectedRoomIds([data[0].id]);
        setTargetRoomIdForAdd(data[0].id);
      }
    }
  };

  const updateRoomName = async (roomId) => {
    if (!editRoomNameText.trim()) {
      alert('변경할 방 이름을 입력해주세요.');
      return;
    }

    const { error } = await supabase
      .from('rooms')
      .update({ name: editRoomNameText.trim() })
      .eq('id', roomId);

    if (error) {
      alert('방 이름 변경에 실패했습니다: ' + error.message);
      return;
    }

    setRooms(rooms.map(r => r.id === roomId ? { ...r, name: editRoomNameText.trim() } : r));
    setEditingRoomId(null);
    setEditRoomNameText('');
  };

  const moveRoomOrder = async (index, direction) => {
    const newRooms = [...rooms];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newRooms.length) return;

    const temp = newRooms[index];
    newRooms[index] = newRooms[targetIndex];
    newRooms[targetIndex] = temp;

    const updates = newRooms.map((room, idx) => {
      return supabase
        .from('rooms')
        .update({ sort_order: idx })
        .eq('id', room.id);
    });

    await Promise.all(updates);
    setRooms([...newRooms]);
  };
  
  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (!error && data) setEvents(data);
  };

  const fetchProfilesMap = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      const map: Record<string, any> = {};
      data.forEach(p => { map[p.id] = p; });
      setProfilesMap(map);
    }
  };

  const fetchPendingProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('status', 'pending');
    if (!error && data) setPendingProfiles(data);
  };

  const fetchAllProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) setAllProfiles(data);
  };

  const fetchComments = async (eventId: string) => {
    const { data, error } = await supabase.from('comments').select('*').eq('event_id', eventId).order('created_at', { ascending: true });
    if (!error && data) setComments(data);
  };

  const approveNameChange = async (userId: string, requestedName: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        name: requestedName,
        requested_name: null,
        name_status: 'approved' 
      })
      .eq('id', userId);

    if (error) {
      alert('승인 실패: ' + error.message);
    } else {
      alert('이름 변경이 승인되었습니다.');
      fetchAllProfiles();
      fetchProfilesMap();
    }
  };

  const rejectNameChange = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        requested_name: null,
        name_status: 'approved' 
      })
      .eq('id', userId);

    if (error) {
      alert('거절 처리 실패: ' + error.message);
    } else {
      alert('이름 변경 요청이 거절(취소)되었습니다.');
      fetchAllProfiles();
    }
  };
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (!signupName.trim()) {
          alert('이름(닉네임)을 입력해주세요.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: signupName, color: signupColor } }
        });
        if (error) throw error;
        alert('가입 신청 완료. 관리자 승인을 기다려주세요.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const approveUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'approved' }).eq('id', userId);
    if (error) {
      alert('승인 실패: ' + error.message);
    } else {
      alert('승인되었습니다.');
      fetchPendingProfiles();
      fetchAllProfiles();
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const { error } = await supabase.from('rooms').insert([{ name: newRoomName }]);
    if (error) {
      alert('방 생성 실패: ' + error.message);
    } else {
      setNewRoomName('');
      setRoomModalOpen(false);
      fetchRooms();
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm('정말 이 방을 삭제하시겠습니까? 관련된 일정과 댓글도 모두 삭제될 수 있습니다.')) return;
    const { error } = await supabase.from('rooms').delete().eq('id', roomId);
    if (error) {
      alert('방 삭제 실패: ' + error.message);
    } else {
      setSelectedRoomIds(selectedRoomIds.filter(id => id !== roomId));
      fetchRooms();
      fetchEvents();
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !targetRoomIdForAdd || !newEventStartDate) {
      alert('방, 제목, 시작일을 모두 확인해주세요.');
      return;
    }

    let finalColor = newEventColor;
    if (newEventColor === customPickerColor && customColorLabel.trim()) {
      setColorLabels(prev => ({ ...prev, [customPickerColor]: customColorLabel.trim() }));
    }

    const { error } = await supabase.from('events').insert([{
      room_id: targetRoomIdForAdd,
      user_id: session.user.id,
      title: newEventTitle,
      content: newEventContent,
      event_date: newEventStartDate,
      end_date: newEventEndDate || newEventStartDate,
      color: finalColor
    }]);

    if (error) {
      alert('일정 등록 실패: ' + error.message);
    } else {
      setNewEventTitle('');
      setNewEventContent('');
      setNewEventStartDate('');
      setNewEventEndDate('');
      setNewEventColor(PRESET_COLORS[0]);
      setCustomColorLabel('');
      setEventAddModalOpen(false);
      fetchEvents();
    }
  };

  const updateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !editEventTitle.trim() || !editEventStartDate) {
      alert('제목과 시작일을 확인해주세요.');
      return;
    }

    const { error } = await supabase.from('events').update({
      title: editEventTitle,
      content: editEventContent,
      event_date: editEventStartDate,
      end_date: editEventEndDate || editEventStartDate,
      color: editEventColor
    }).eq('id', selectedEvent.id);

    if (error) {
      alert('일정 수정 실패: ' + error.message);
    } else {
      alert('일정이 수정되었습니다.');
      setEventEditModalOpen(false);
      const updated = {
        ...selectedEvent,
        title: editEventTitle,
        content: editEventContent,
        event_date: editEventStartDate,
        end_date: editEventEndDate || editEventStartDate,
        color: editEventColor
      };
      setSelectedEvent(updated);
      fetchEvents();
    }
  };
  
  const deleteEvent = async (eventId: string) => {
    if (!confirm('일정을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      setSelectedEvent(null);
      setEventDetailModalOpen(false);
      fetchEvents();
      if (rightSidebarOpen) {
        setRightSidebarEvents(prev => prev.filter(ev => ev.id !== eventId));
      }
    }
  };
  
  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedEvent) return;
    const { error } = await supabase.from('comments').insert([{
      event_id: selectedEvent.id,
      user_id: session.user.id,
      content: newCommentText
    }]);
    if (error) {
      alert('댓글 등록 실패: ' + error.message);
    } else {
      setNewCommentText('');
      fetchComments(selectedEvent.id);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const totalWeeks = Math.ceil((firstDayOfMonth + lastDateOfMonth) / 7);
  const prevMonth = () => { setSelectedEvent(null); setCurrentDate(new Date(year, month - 1, 1)); };
  const nextMonth = () => { setSelectedEvent(null); setCurrentDate(new Date(year, month + 1, 1)); };

  const toggleRoomSelection = (roomId: string) => {
    setSelectedEvent(null);
    if (selectedRoomIds.includes(roomId)) {
      const next = selectedRoomIds.filter(id => id !== roomId);
      setSelectedRoomIds(next);
      if (targetRoomIdForAdd === roomId && next.length > 0) {
        setTargetRoomIdForAdd(next[0]);
      }
    } else {
      const next = [...selectedRoomIds, roomId];
      setSelectedRoomIds(next);
      if (!targetRoomIdForAdd) {
        setTargetRoomIdForAdd(roomId);
      }
    }
  };

  const getRoomOrderIndex = (roomId: string) => {
    const index = rooms.findIndex(r => r.id === roomId);
    return index !== -1 ? index : 999;
  };

  if (loading && session) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;

  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', fontFamily: 'sans-serif', background: '#fff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isSignUp ? '회원가입' : '로그인'}</h2>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" name="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="password" name="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          
          {isSignUp && (
            <>
              <input type="text" placeholder="본인 이름 (닉네임)" value={signupName} onChange={e => setSignupName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <span>기본 프로필 색상:</span>
                <input type="color" value={signupColor} onChange={e => setSignupColor(e.target.value)} style={{ width: '40px', height: '35px', border: 'none', cursor: 'pointer', background: 'none' }} />
              </div>
            </>
          )}
          {!isSignUp && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={autoLogin} 
                onChange={handleAutoLoginChange} 
                style={{ cursor: 'pointer' }}
              />
              자동로그인
            </label>
          )}
          <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isSignUp ? '가입 신청' : '로그인'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}>
            {isSignUp ? '로그인하기' : '회원가입하기'}
          </span>
        </p>
      </div>
    );
  }

  if (profile && profile.status === 'pending') {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '12px', fontFamily: 'sans-serif', background: '#fff' }}>
        <h2>승인 대기 중</h2>
        <p style={{ margin: '15px 0', color: '#555' }}>관리자 승인을 기다리고 있습니다.</p>
        <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>로그아웃</button>
      </div>
    );
  }

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'sans-serif', position: 'fixed', top: 0, left: 0, boxSizing: 'border-box', background: '#fff' }}
    >
      
      {/* 1. 좌측 사이드바 컨테이너 */}
      <div style={{
        width: leftSidebarOpen ? '260px' : '0px',
        minWidth: leftSidebarOpen ? '260px' : '0px',
        height: '100vh',
        background: '#f8f9fa',
        borderRight: leftSidebarOpen ? '1px solid #ddd' : 'none',
        overflow: 'hidden',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0,
        zIndex: 10
      }}>
        <div style={{ width: '260px', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '20px', paddingBottom: '75px', overflowY: 'auto' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '15px', lineHeight: '1.2', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#555' }}>씩씩이들의</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>공유캘린더</div>
            </div>
            
            <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', margin: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  title="클릭하여 프로필 색상 변경"
                  style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '50%', background: profile?.color || '#339af0', flexShrink: 0, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.2)' }}
                >
                  <input 
                    type="color" 
                    value={profile?.color || '#339af0'} 
                    onChange={async (e) => {
                      const newColor = e.target.value;
                      const { error } = await supabase
                        .from('profiles')
                        .update({ color: newColor })
                        .eq('id', session.user.id);
                      
                      if (!error) {
                        fetchProfile(session.user.id);
                        fetchProfilesMap();
                      } else {
                        alert('색상 변경 실패: ' + error.message);
                      }
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile?.name}
                    </span>
                    {profile?.name_status === 'pending' && (
                      <span style={{ fontSize: '10px', background: '#ffc107', color: '#000', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                        변경 대기중
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: '#888' }}>
                    색상: {profile?.color || '#339af0'}
                  </span>
                  
                  {profile?.name_status !== 'pending' && (
                    <button 
                      onClick={() => {
                        setNewNameRequestText(profile?.name || '');
                        setNameChangeModalOpen(true);
                      }}
                      style={{ marginTop: '4px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', fontSize: '11px', padding: '2px 4px', cursor: 'pointer', alignSelf: 'flex-start', color: '#555' }}
                    >
                      이름 변경 신청
                    </button>
                  )}
                </div>
              </div>
              
              <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.email}
              </div>
            </div>

            <div style={{ margin: '10px 0 15px 0', padding: '10px 12px', background: '#fff', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>친구와 일정 함께 쓰기</span>
              <button 
                onClick={() => {
                  const inviteUrl = window.location.href;
                  navigator.clipboard.writeText(inviteUrl).then(() => {
                    alert('초대 링크가 클립보드에 복사되었습니다! 친구에게 공유해 보세요.');
                  }).catch(() => {
                    alert('링크 복사에 실패했습니다.');
                  });
                }}
                style={{ width: '100%', background: '#007bff', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                🔗 초대 링크 복사하기
              </button>
            </div>

            <button onClick={handleLogout} style={{ width: '100%', margin: '5px 0 10px 0', padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>로그아웃</button>
            
            {profile?.role === 'admin' && (
              <button 
                onClick={() => setAdminModalOpen(true)} 
                style={{ width: '100%', marginBottom: '15px', padding: '8px 12px', background: '#343a40', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ⚙️ 멤버 관리 (관리자)
              </button>
            )}

            <div style={{ marginTop: '15px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '4px' }}>방 목록 (다중 선택 가능)</div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>선택한 순서대로 캘린더에 겹쳐 표시됩니다.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {rooms.map(room => {
                  const isSelected = selectedRoomIds.includes(room.id);
                  return (
                    <div 
                      key={room.id} 
                      onClick={() => toggleRoomSelection(room.id)}
                      style={{ 
                        padding: '10px 12px', background: isSelected ? '#007bff' : '#fff', color: isSelected ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: isSelected ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>{room.name}</span>
                      {isSelected && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px' }}>선택됨</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setRoomModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#f1f3f5', color: '#212529', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>방 생성하기 +</button>
            <button onClick={() => setRoomManageModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#343a40', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>방 관리하기 ⚙️</button>
          </div>
        </div>
      </div>

      {/* 2. 중앙 메인 콘텐츠 뷰 */}
      <div style={{ flex: 1, height: '100vh', padding: '20px', paddingBottom: '75px', overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 }}>
        {selectedRoomIds.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2>
                통합 캘린더 보기 
                <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
                  ({selectedRoomIds.map(id => rooms.find(r => r.id === id)?.name).filter(Boolean).join(', ')})
                </span>
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={prevMonth} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>&lt; 이전 달</button>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{year}년 {month + 1}월</h3>
                <button onClick={nextMonth} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>다음 달 &gt;</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMembersDropdownOpen(!membersDropdownOpen);
                  }}
                  style={{ padding: '4px 10px', fontSize: '12px', background: '#f1f3f5', color: '#333', border: '1px solid #ced4da', borderRadius: '4px', cursor: 'pointer' }}
                >
                  사용 중인 맴버 보기 ▾
                </button>

                {membersDropdownOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '28px', width: '180px', background: 'white', border: '1px solid #ced4da', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 100, padding: '8px' }}>
                    {profilesMap && Object.values(profilesMap).map((m: any) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', gap: '8px' }}>
                        <div style={{ width: '4px', height: '16px', backgroundColor: m.color || '#339af0', borderRadius: '2px', flexShrink: 0 }}></div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `auto repeat(${totalWeeks}, 1fr)`, gap: '1px', background: '#ddd', border: '1px solid #ddd', flex: 1, minHeight: 0 }}>
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                <div key={idx} style={{ background: '#f1f3f5', textAlign: 'center', fontWeight: 'bold', padding: '8px 0', fontSize: '13px' }}>
                  {day}
                </div>
              ))}

              {(() => {
                const prevMonthLastDate = new Date(year, month, 0).getDate();
                return Array.from({ length: firstDayOfMonth }).map((_, idx) => {
                  const dayNum = prevMonthLastDate - firstDayOfMonth + idx + 1;
                  return (
                    <div key={`prev-${idx}`} style={{ background: '#f8f9fa', minHeight: '0', padding: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#adb5bd', fontWeight: 'bold' }}>{dayNum}</span>
                    </div>
                  );
                });
              })()}

              {Array.from({ length: lastDateOfMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                
                const dayEvents = events.filter(ev => {
                  if (!selectedRoomIds.includes(ev.room_id)) return false;
                  const start = ev.event_date;
                  const end = ev.end_date || ev.event_date;
                  return formattedDate >= start && formattedDate <= end;
                });

                dayEvents.sort((a, b) => getRoomOrderIndex(a.room_id) - getRoomOrderIndex(b.room_id));

                return (
                  <div 
                    key={`day-${dayNum}`} 
                    onClick={(e) => {
                      e.stopPropagation();
                      // 💡 달력 그리드 칸 전체(일정 포함)를 누르면 우측바에 해당 날짜의 일정 목록이 나오도록 설정
                      setRightSidebarDateStr(formattedDate);
                      setRightSidebarEvents(dayEvents);
                      setRightSidebarOpen(true);
                      if (selectedRoomIds.length > 0) setTargetRoomIdForAdd(selectedRoomIds[0]);
                    }}
                    style={{ 
                      background: '#fff', 
                      minHeight: '0', 
                      padding: '5px 0', 
                      overflowY: 'auto', 
                      border: '1px solid #eee', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      cursor: 'pointer',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#333', padding: '0 5px' }}>{dayNum}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
                      {dayEvents.map(ev => {
                        const eventColor = ev.color || profilesMap[ev.user_id]?.color || '#339af0';
                        const start = ev.event_date;
                        const end = ev.end_date || ev.event_date;
                        
                        const isStart = formattedDate === start;
                        const isEnd = formattedDate === end;

                        return (
                          <div 
                            key={ev.id} 
                            // 💡 일정 아이템 개별의 onClick은 삭제되어, 누르면 부모(날짜 칸)의 이벤트가 발생해 우측바만 열립니다.
                            style={{ 
                              background: eventColor, 
                              color: '#fff', 
                              padding: '3px 6px', 
                              fontSize: '11px', 
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              wordBreak: 'keep-all',
                              marginLeft: isStart ? '4px' : '-2px',
                              marginRight: isEnd ? '4px' : '-2px',
                              borderTopLeftRadius: isStart ? '4px' : '0px',
                              borderBottomLeftRadius: isStart ? '4px' : '0px',
                              borderTopRightRadius: isEnd ? '4px' : '0px',
                              borderBottomRightRadius: isEnd ? '4px' : '0px',
                              zIndex: 2,
                              position: 'relative',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {ev.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {(() => {
                const totalCellsSoFar = firstDayOfMonth + lastDateOfMonth;
                const totalGridCells = totalCellsSoFar <= 35 ? 35 : 42;
                const nextMonthDaysCount = totalGridCells - totalCellsSoFar;

                return Array.from({ length: nextMonthDaysCount }).map((_, idx) => {
                  const dayNum = idx + 1;
                  return (
                    <div key={`next-${idx}`} style={{ background: '#f8f9fa', minHeight: '100px', padding: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#adb5bd', fontWeight: 'bold' }}>{dayNum}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ) : (
          <h3 style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>하단 메뉴에서 좌측 바를 열어 캘린더에 표시할 방을 선택해주세요.</h3>
        )}
      </div>

      {/* 3. 우측 사이드바 컨테이너 (달력 그리드 클릭 시 해당 날짜의 일정 목록 표시) */}
      <div style={{
        width: rightSidebarOpen ? '320px' : '0px',
        minWidth: rightSidebarOpen ? '320px' : '0px',
        height: '100vh',
        background: '#f8f9fa',
        borderLeft: rightSidebarOpen ? '1px solid #ddd' : 'none',
        overflow: 'hidden',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0,
        zIndex: 10
      }}>
        <div style={{ width: '320px', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '20px', paddingBottom: '75px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>📅 {rightSidebarDateStr || '날짜 선택 안됨'}</h3>
            <button onClick={() => setRightSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>

          <button 
            onClick={() => {
              if (!rightSidebarDateStr) {
                alert('날짜를 먼저 선택해주세요.');
                return;
              }
              setNewEventStartDate(rightSidebarDateStr);
              setNewEventEndDate(rightSidebarDateStr);
              setNewEventColor(PRESET_COLORS[0]);
              setCustomColorLabel('');
              setEventAddModalOpen(true);
            }}
            style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginBottom: '15px' }}
          >
            이 날짜에 일정 등록하기 +
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>등록된 일정 목록</div>
            {rightSidebarEvents.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginTop: '20px' }}>해당 날짜에 등록된 일정이 없습니다.</p>
            ) : (
              rightSidebarEvents.map(ev => {
                const roomInfo = rooms.find(r => r.id === ev.room_id);
                return (
                  <div 
                    key={ev.id}
                    onClick={() => {
                      setSelectedEvent(ev);
                      setEventDetailModalOpen(true); // 💡 우측바의 일정을 눌렀을 때만 상세/댓글 모달 팝업
                    }}
                    style={{ padding: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{ev.title}</span>
                      <span style={{ fontSize: '11px', color: '#007bff', fontWeight: 'bold' }}>상세/댓글 &gt;</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      방: {roomInfo?.name || '알 수 없음'} | 작성자: {profilesMap[ev.user_id]?.name || '익명'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. 화면 하단 고정 네비게이션 바 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '55px',
        background: '#343a40',
        borderTop: '1px solid #495057',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 40,
        boxShadow: '0 -2px 6px rgba(0,0,0,0.15)',
        boxSizing: 'border-box'
      }}>
        <button 
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          style={{ flex: 1, height: '100%', background: leftSidebarOpen ? '#495057' : 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          📁 방 목록 / 메뉴 {leftSidebarOpen ? '▼' : '▲'}
        </button>
        <button 
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          style={{ flex: 1, height: '100%', background: rightSidebarOpen ? '#495057' : 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderLeft: '1px solid #495057' }}
        >
          📅 우측 일정 목록 {rightSidebarOpen ? '▼' : '▲'}
        </button>
      </div>

      {/* ================= 모달 모음 ================= */}

      {/* 5. 💡 일정 상세 정보 및 댓글 모달 (우측바 목록에서 일정을 눌렀을 때만 팝업) */}
      {eventDetailModalOpen && selectedEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '450px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#222' }}>📌 일정 상세 정보</h3>
              <button onClick={() => setEventDetailModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#888' }}>제목</span>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#222', marginTop: '2px' }}>{selectedEvent.title}</div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#888' }}>기간</span>
                  <div style={{ fontSize: '13px', color: '#444', marginTop: '2px' }}>
                    {selectedEvent.event_date} {selectedEvent.end_date ? `~ ${selectedEvent.end_date}` : ''}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#888' }}>작성자</span>
                  <div style={{ fontSize: '13px', color: '#444', marginTop: '2px' }}>
                    {profilesMap[selectedEvent.user_id]?.name || '알 수 없음'}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#888' }}>상세 내용</span>
                <div style={{ marginTop: '4px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', minHeight: '70px', color: '#333' }}>
                  {selectedEvent.content || '작성된 내용이 없습니다.'}
                </div>
              </div>

              {(selectedEvent.user_id === session?.user?.id || profile?.role === 'admin') && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      setEditEventTitle(selectedEvent.title);
                      setEditEventContent(selectedEvent.content || '');
                      setEditEventStartDate(selectedEvent.event_date);
                      setEditEventEndDate(selectedEvent.end_date || '');
                      setEditEventColor((selectedEvent.color || '#339af0').trim());
                      setEventDetailModalOpen(false);
                      setEventEditModalOpen(true);
                    }}
                    style={{ flex: 1, padding: '8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    일정 수정
                  </button>
                  <button 
                    onClick={() => deleteEvent(selectedEvent.id)} 
                    style={{ flex: 1, padding: '8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    일정 삭제
                  </button>
                </div>
              )}
            </div>

            {/* 댓글 영역 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '5px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#333' }}>💬 해당 일정 댓글</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {comments.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#888', margin: '5px 0' }}>작성된 댓글이 없습니다.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} style={{ background: '#f8f9fa', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e9ecef', fontSize: '13px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#555', marginBottom: '2px' }}>
                        {profilesMap[c.user_id]?.name || '익명'}
                      </div>
                      <div style={{ color: '#333' }}>{c.content}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={addComment} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <input 
                  type="text" 
                  placeholder="이 일정에 댓글을 입력하세요..." 
                  value={newCommentText} 
                  onChange={e => setNewCommentText(e.target.value)} 
                  style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }} 
                />
                <button type="submit" style={{ padding: '9px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>등록</button>
              </form>
            </div>

            <button 
              onClick={() => setEventDetailModalOpen(false)} 
              style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 6. 멤버 관리 (관리자) 모달 */}
      {adminModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '450px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0' }}>멤버 관리</h3>
              <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>가입 대기 중인 회원 및 이름 변경 요청을 관리할 수 있습니다.</p>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>📌 가입 대기 목록</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingProfiles.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>대기 중인 멤버가 없습니다.</p>
                ) : (
                  pendingProfiles.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{p.email}</div>
                      </div>
                      <button onClick={() => approveUser(p.id)} style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>승인</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>✏️ 이름 변경 요청 목록</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allProfiles.filter(p => p.name_status === 'pending').length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>이름 변경 요청이 없습니다.</p>
                ) : (
                  allProfiles.filter(p => p.name_status === 'pending').map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff9db', borderRadius: '6px', border: '1px solid #ffe066' }}>
                      <div>
                        <div style={{ fontSize: '13px' }}>기존: <b>{p.name}</b></div>
                        <div style={{ fontSize: '13px', color: '#d9534f', marginTop: '2px' }}>변경 요청: <b>{p.requested_name}</b></div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => approveNameChange(p.id, p.requested_name)} style={{ padding: '6px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>승인</button>
                        <button onClick={() => rejectNameChange(p.id)} style={{ padding: '6px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>거절</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button onClick={() => setAdminModalOpen(false)} style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>닫기</button>
          </div>
        </div>
      )}

      {/* 7. 이름 변경 신청 모달 */}
      {nameChangeModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>이름 변경 신청</h3>
            <form onSubmit={requestNameChange} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                value={newNameRequestText} 
                onChange={e => setNewNameRequestText(e.target.value)} 
                placeholder="변경할 이름 입력" 
                required 
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button type="button" onClick={() => setNameChangeModalOpen(false)} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>취소</button>
                <button type="submit" style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>신청</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 8. 방 생성 모달 */}
      {roomModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <form onSubmit={createRoom} style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>새로운 방 생성</h3>
            <input type="text" placeholder="방 이름 입력" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>생성</button>
              <button type="button" onClick={() => setRoomModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 9. 방 관리 모달 */}
      {roomManageModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '450px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>방 관리하기</h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>방 이름을 변경하거나 순서를 조정할 수 있습니다.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '15px 0' }}>
              {rooms.map((room, index) => (
                <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd', gap: '8px' }}>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {editingRoomId === room.id ? (
                      <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                        <input 
                          type="text" 
                          value={editRoomNameText} 
                          onChange={e => setEditRoomNameText(e.target.value)}
                          style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                        />
                        <button 
                          onClick={() => updateRoomName(room.id)}
                          style={{ padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          저장
                        </button>
                        <button 
                          onClick={() => setEditingRoomId(null)}
                          style={{ padding: '4px 8px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{room.name}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {editingRoomId !== room.id && (
                      <>
                        <button 
                          onClick={() => moveRoomOrder(index, 'up')} 
                          disabled={index === 0}
                          style={{ padding: '4px 6px', background: index === 0 ? '#e9ecef' : '#6c757d', color: index === 0 ? '#adb5bd' : '#fff', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '11px' }}
                        >
                          ▲
                        </button>
                        <button 
                          onClick={() => moveRoomOrder(index, 'down')} 
                          disabled={index === rooms.length - 1}
                          style={{ padding: '4px 6px', background: index === rooms.length - 1 ? '#e9ecef' : '#6c757d', color: index === rooms.length - 1 ? '#adb5bd' : '#fff', border: 'none', borderRadius: '4px', cursor: index === rooms.length - 1 ? 'not-allowed' : 'pointer', fontSize: '11px' }}
                        >
                          ▼
                        </button>
                        <button 
                          onClick={() => {
                            setEditingRoomId(room.id);
                            setEditRoomNameText(room.name);
                          }} 
                          style={{ padding: '5px 8px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          수정
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => deleteRoom(room.id)} 
                      style={{ padding: '5px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      삭제
                    </button>
                  </div>

                </div>
              ))}
            </div>

            <button onClick={() => setRoomManageModalOpen(false)} style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>닫기</button>
          </div>
        </div>
      )}
      
      {/* 10. 일정 수정 모달 */}
      {eventEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '380px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>일정 수정</h3>
            <form onSubmit={updateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>제목</label>
                <input 
                  type="text" 
                  value={editEventTitle} 
                  onChange={e => setEditEventTitle(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>내용</label>
                <textarea 
                  value={editEventContent} 
                  onChange={e => setEditEventContent(e.target.value)} 
                  rows={4}
                  placeholder="일정 내용을 입력하세요"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>시작일</label>
                <input 
                  type="date" 
                  value={editEventStartDate} 
                  onChange={e => setEditEventStartDate(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>종료일 (선택)</label>
                <input 
                  type="date" 
                  value={editEventEndDate} 
                  onChange={e => setEditEventEndDate(e.target.value)} 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>색상 선택</label>
                <input 
                  type="color" 
                  value={editEventColor} 
                  onChange={e => setEditEventColor(e.target.value)} 
                  style={{ width: '100%', height: '35px', border: 'none', cursor: 'pointer', background: 'none' }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>저장</button>
                <button type="button" onClick={() => setEventEditModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 11. 일정 등록 모달 */}
      {eventAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <form onSubmit={createEvent} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '680px', maxWidth: '95vw', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0 }}>일정 등록</h3>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              
              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>대상 방</label>
                  <select value={targetRoomIdForAdd || ''} onChange={e => setTargetRoomIdForAdd(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>일정 제목</label>
                  <input type="text" placeholder="일정 제목 입력" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>상세 내용</label>
                  <textarea placeholder="일정 내용을 입력하세요" value={newEventContent} onChange={e => setNewEventContent(e.target.value)} rows={3} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>시작일</label>
                  <input type="date" value={newEventStartDate} onChange={e => setNewEventStartDate(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>종료일 (선택)</label>
                  <input type="date" value={newEventEndDate} onChange={e => setNewEventEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '2px' }}>
                  🎨 색상별 항목 지정 (선택한 색상: <span style={{ color: newEventColor, fontWeight: 'bold' }}>{newEventColor}</span>)
                </label>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
                  지정된 색상 항목은 고정되어 있으며, 본인 색상은 닉네임으로 자동 표시됩니다.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  
                  <div 
                    onClick={() => {
                      const userColor = profile?.color || '#339af0';
                      setCustomPickerColor(userColor);
                      setNewEventColor(userColor);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '6px 8px',
                      background: newEventColor === (profile?.color || '#339af0') ? '#e7f5ff' : '#fff',
                      border: newEventColor === (profile?.color || '#339af0') ? '2px solid #339af0' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: '22px', height: '22px', backgroundColor: profile?.color || '#339af0', borderRadius: '4px', flexShrink: '0', border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span style={{ flex: 1, fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                      {profile?.name || '내 이름'} (본인)
                    </span>
                  </div>

                  {Array.isArray(PRESET_COLORS) && PRESET_COLORS.map(colorCode => (
                    <div 
                      key={colorCode}
                      onClick={() => {
                        setNewEventColor(colorCode);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '6px 8px',
                        background: newEventColor === colorCode ? '#e7f5ff' : '#fff',
                        border: newEventColor === colorCode ? '2px solid #339af0' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ width: '22px', height: '22px', backgroundColor: colorCode, borderRadius: '4px', flexShrink: '0', border: '1px solid rgba(0,0,0,0.1)' }} />
                      <span style={{ flex: 1, fontSize: '12px', color: '#333', fontWeight: '500' }}>
                        {(colorLabels && colorLabels[colorCode]) ? colorLabels[colorCode] : '지정 항목'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>등록</button>
              <button type="button" onClick={() => setEventAddModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>취소</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
