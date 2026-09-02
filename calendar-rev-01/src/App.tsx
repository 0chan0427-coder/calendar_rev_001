import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const customStorage = {
  getItem: (key: string) => {
    return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    const keepLoggedIn = window.localStorage.getItem('keepLoggedIn') !== 'false';
    if (keepLoggedIn) {
      window.localStorage.setItem(key, value);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
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
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  
  const [currentViewMode, setCurrentViewMode] = useState<'calendar' | 'chat' | 'vote' | 'settlement'>('calendar');
  
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 투표 관련 상태
  const [votes, setVotes] = useState<any[]>([]);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [newVoteTitle, setNewVoteTitle] = useState('');
  const [newVoteEndDate, setNewVoteEndDate] = useState('');
  const [newVoteOptions, setNewVoteOptions] = useState<string[]>(['', '']);
  const [newVoteIsMultiple, setNewVoteIsMultiple] = useState(false);
  const [newVoteIsAnonymous, setNewVoteIsAnonymous] = useState(true);
  
  const [selectedVote, setSelectedVote] = useState<any>(null);
  const [voteOptionsList, setVoteOptionsList] = useState<any[]>([]);
  const [voteRecordsList, setVoteRecordsList] = useState<any[]>([]);
  const [voteDetailModalOpen, setVoteDetailModalOpen] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  // 정산 관련 상태
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [newSettlementTitle, setNewSettlementTitle] = useState('');
  const [newSettlementTotalAmount, setNewSettlementTotalAmount] = useState('');
  const [targetRoomIdForSettlement, setTargetRoomIdForSettlement] = useState<string | null>(null);
  const [newSettlementFile, setNewSettlementFile] = useState<File | null>(null);
  
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [settlementItemsList, setSettlementItemsList] = useState<any[]>([]);
  const [settlementDetailModalOpen, setSettlementDetailModalOpen] = useState(false);
  
  const [settlementEditModalOpen, setSettlementEditModalOpen] = useState(false);
  const [editSettlementTitle, setEditSettlementTitle] = useState('');
  const [editSettlementTotalAmount, setEditSettlementTotalAmount] = useState('');
  const [editSettlementFile, setEditSettlementFile] = useState<File | null>(null);

  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [targetRoomIdForAdd, setTargetRoomIdForAdd] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [autoLogin, setAutoLogin] = useState(() => {
    return localStorage.getItem('keepLoggedIn') !== 'false';
  });

  const handleAutoLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoLogin(e.target.checked);
    localStorage.setItem('keepLoggedIn', e.target.checked.toString());
  };

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomManageModalOpen, setRoomManageModalOpen] = useState(false);
  const [eventAddModalOpen, setEventAddModalOpen] = useState(false);
  
  const [rightSidebarDateStr, setRightSidebarDateStr] = useState('');
  const [rightSidebarEvents, setRightSidebarEvents] = useState<any[]>([]);

  const [eventDetailModalOpen, setEventDetailModalOpen] = useState(false);

  const [rooms, setRooms] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  
  const [adminEditedColors, setAdminEditedColors] = useState<Record<string, string>>({});

  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  
  const [eventEditModalOpen, setEventEditModalOpen] = useState(false);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventContent, setEditEventContent] = useState('');
  const [editEventStartDate, setEditEventStartDate] = useState('');
  const [editEventEndDate, setEditEventEndDate] = useState('');
  const [editEventColor, setEditEventColor] = useState('#339af0');

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
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
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchEndX - touchStartX;
    const minSwipeDistance = 50;

    if (leftSidebarOpen && distance < -minSwipeDistance) {
      setLeftSidebarOpen(false);
    } else if (!leftSidebarOpen && touchStartX < 50 && distance > minSwipeDistance) {
      setLeftSidebarOpen(true);
    } else if (!leftSidebarOpen && currentViewMode === 'calendar' && Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      } else {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      }
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };
  
  const [newEventColor, setNewEventColor] = useState(PRESET_COLORS[0]);
  const [customPickerColor, setCustomPickerColor] = useState('#ff0000');
  const [customColorLabel, setCustomColorLabel] = useState('');

  const [colorLabels, setColorLabels] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('calendar_color_labels');
      if (saved) return JSON.parse(saved);
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
      fetchVotes();
      fetchSettlements();
      if (profile.role === 'admin') {
        fetchPendingProfiles();
        fetchAllProfiles();
      }
    }
  }, [session, profile, selectedRoomIds]);

  useEffect(() => {
    if (currentViewMode === 'chat') {
      fetchMessages();

      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          setChatMessages((prev) => [...prev, payload.new]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentViewMode]);

  useEffect(() => {
    if (currentViewMode === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, currentViewMode]);

  useEffect(() => {
    if (selectedEvent) {
      fetchComments(selectedEvent.id);
    } else {
      setComments([]);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedVote) {
      fetchVoteDetails(selectedVote.id);
    }
  }, [selectedVote]);

  useEffect(() => {
    if (selectedSettlement) {
      fetchSettlementDetails(selectedSettlement.id);
    }
  }, [selectedSettlement]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('프로필 조회 실패:', err);
    }
  };

  const fetchVotes = async () => {
    const { data, error } = await supabase.from('votes').select('*').order('created_at', { ascending: false });
    if (!error && data) setVotes(data);
  };

  const fetchVoteDetails = async (voteId: string) => {
    const { data: options } = await supabase.from('vote_options').select('*').eq('vote_id', voteId);
    const { data: records } = await supabase.from('vote_records').select('*').eq('vote_id', voteId);
    if (options) setVoteOptionsList(options);
    if (records) setVoteRecordsList(records);
  };

  const fetchSettlements = async () => {
    if (selectedRoomIds.length === 0) {
      setSettlements([]);
      return;
    }
    const { data, error } = await supabase.from('settlements').select('*').in('room_id', selectedRoomIds).order('created_at', { ascending: false });
    if (!error && data) setSettlements(data);
  };

  const fetchSettlementDetails = async (settlementId: string) => {
    const { data, error } = await supabase.from('settlement_items').select('*').eq('settlement_id', settlementId);
    if (!error && data) setSettlementItemsList(data);
  };

  const uploadReceiptImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file);
    if (uploadError) throw new Error('영수증 이미지 업로드 실패: ' + uploadError.message);
    const { data: publicURLData } = supabase.storage.from('receipts').getPublicUrl(fileName);
    return publicURLData.publicUrl;
  };

  const createSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSettlementTitle.trim() || !newSettlementTotalAmount || !targetRoomIdForSettlement) {
      alert('방, 제목, 총 금액을 모두 입력해주세요.');
      return;
    }
    const amountNum = parseFloat(newSettlementTotalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('유효한 금액을 입력해주세요.');
      return;
    }

    try {
      let receiptUrl = null;
      if (newSettlementFile) {
        receiptUrl = await uploadReceiptImage(newSettlementFile);
      }

      const { data: settlementData, error: settlementError } = await supabase.from('settlements').insert([{
        room_id: targetRoomIdForSettlement,
        user_id: session.user.id,
        title: newSettlementTitle.trim(),
        total_amount: amountNum,
        receipt_url: receiptUrl
      }]).select().single();

      if (settlementError || !settlementData) throw new Error(settlementError?.message || '알 수 없는 오류');

      const allProfileIds = Object.keys(profilesMap);
      if (allProfileIds.length > 0) {
        const share = parseFloat((amountNum / allProfileIds.length).toFixed(2));
        const itemsToInsert = allProfileIds.map(uid => ({
          settlement_id: settlementData.id,
          user_id: uid,
          amount: share,
          is_paid: uid === session.user.id
        }));
        await supabase.from('settlement_items').insert(itemsToInsert);
      }

      alert('정산이 생성되었습니다!');
      setNewSettlementTitle('');
      setNewSettlementTotalAmount('');
      setNewSettlementFile(null);
      setSettlementModalOpen(false);
      fetchSettlements();
    } catch (err: any) {
      alert('정산 생성 실패: ' + err.message);
    }
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      setRooms(data);
      if (selectedRoomIds.length === 0 && data.length > 0) {
        setSelectedRoomIds([data[0].id]);
        setTargetRoomIdForAdd(data[0].id);
        setTargetRoomIdForSettlement(data[0].id);
      }
    }
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
    if (!error && data) {
      setAllProfiles(data);
      const colorsMap: Record<string, string> = {};
      data.forEach(p => { colorsMap[p.id] = p.color || '#339af0'; });
      setAdminEditedColors(colorsMap);
    }
  };

  const fetchComments = async (eventId: string) => {
    const { data, error } = await supabase.from('comments').select('*').eq('event_id', eventId).order('created_at', { ascending: true });
    if (!error && data) setComments(data);
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

  const updateRoomName = async (roomId: string) => {
    if (!editRoomNameText.trim()) {
      alert('변경할 방 이름을 입력해주세요.');
      return;
    }
    const { error } = await supabase.from('rooms').update({ name: editRoomNameText.trim() }).eq('id', roomId);
    if (error) {
      alert('방 이름 변경 실패: ' + error.message);
      return;
    }
    setRooms(rooms.map(r => r.id === roomId ? { ...r, name: editRoomNameText.trim() } : r));
    setEditingRoomId(null);
    setEditRoomNameText('');
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm('정말 이 방을 삭제하시겠습니까? 관련된 일정과 데이터가 함께 삭제될 수 있습니다.')) return;
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

    const { error } = await supabase.from('events').insert([{
      room_id: targetRoomIdForAdd,
      user_id: session.user.id,
      title: newEventTitle,
      content: newEventContent,
      event_date: newEventStartDate,
      end_date: newEventEndDate || newEventStartDate,
      color: newEventColor
    }]);

    if (error) {
      alert('일정 등록 실패: ' + error.message);
    } else {
      setNewEventTitle('');
      setNewEventContent('');
      setNewEventStartDate('');
      setNewEventEndDate('');
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
      setSelectedEvent({
        ...selectedEvent,
        title: editEventTitle,
        content: editEventContent,
        event_date: editEventStartDate,
        end_date: editEventEndDate || editEventStartDate,
        color: editEventColor
      });
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

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    const { error } = await supabase.from('messages').insert([{
      user_id: session.user.id,
      content: chatInputText.trim()
    }]);
    if (!error) setChatInputText('');
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => { setSelectedEvent(null); setCurrentDate(new Date(year, month - 1, 1)); };
  const nextMonth = () => { setSelectedEvent(null); setCurrentDate(new Date(year, month + 1, 1)); };

  const toggleRoomSelection = (roomId: string) => {
    setSelectedEvent(null);
    if (selectedRoomIds.includes(roomId)) {
      const next = selectedRoomIds.filter(id => id !== roomId);
      setSelectedRoomIds(next);
      if (targetRoomIdForAdd === roomId && next.length > 0) setTargetRoomIdForAdd(next[0]);
      if (targetRoomIdForSettlement === roomId && next.length > 0) setTargetRoomIdForSettlement(next[0]);
    } else {
      const next = [...selectedRoomIds, roomId];
      setSelectedRoomIds(next);
      if (!targetRoomIdForAdd) setTargetRoomIdForAdd(roomId);
      if (!targetRoomIdForSettlement) setTargetRoomIdForSettlement(roomId);
    }
  };

  if (loading && session) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;

  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', fontFamily: 'sans-serif', background: '#fff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isSignUp ? '회원가입' : '로그인'}</h2>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoLogin} onChange={handleAutoLoginChange} /> 자동로그인
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
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '12px', background: '#fff' }}>
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
      {/* 좌측 사이드바 */}
      <div style={{ width: leftSidebarOpen ? '260px' : '0px', minWidth: leftSidebarOpen ? '260px' : '0px', height: '100vh', background: '#f8f9fa', borderRight: leftSidebarOpen ? '1px solid #ddd' : 'none', overflow: 'hidden', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', zIndex: 10 }}>
        <div style={{ width: '260px', height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px', paddingBottom: '75px', overflowY: 'auto' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ textAlign: 'center', color: '#007bff' }}>공유 캘린더</h3>
            <div style={{ margin: '10px 0 15px 0', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #ddd' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{profile?.name}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>{profile?.email}</div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', marginBottom: '15px', padding: '6px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>로그아웃</button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div onClick={() => setCurrentViewMode('calendar')} style={{ padding: '10px', background: currentViewMode === 'calendar' ? '#007bff' : '#fff', color: currentViewMode === 'calendar' ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd' }}>📅 캘린더 보기</div>
              <div onClick={() => setCurrentViewMode('chat')} style={{ padding: '10px', background: currentViewMode === 'chat' ? '#007bff' : '#fff', color: currentViewMode === 'chat' ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd' }}>💬 자유 채팅방</div>
              <div onClick={() => setCurrentViewMode('vote')} style={{ padding: '10px', background: currentViewMode === 'vote' ? '#007bff' : '#fff', color: currentViewMode === 'vote' ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd' }}>📊 투표 목록</div>
              <div onClick={() => setCurrentViewMode('settlement')} style={{ padding: '10px', background: currentViewMode === 'settlement' ? '#007bff' : '#fff', color: currentViewMode === 'settlement' ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd' }}>💰 정산 관리</div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '6px' }}>캘린더 방 목록</div>
              {rooms.map(room => {
                const isSelected = selectedRoomIds.includes(room.id);
                return (
                  <div key={room.id} onClick={() => toggleRoomSelection(room.id)} style={{ padding: '8px 10px', background: isSelected ? '#e7f5ff' : '#fff', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd', marginBottom: '4px', fontSize: '13px' }}>
                    {room.name} {isSelected && '✓'}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => setRoomModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#f1f3f5', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>방 생성하기 +</button>
            <button onClick={() => setRoomManageModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#343a40', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>방 관리하기 ⚙️</button>
          </div>
        </div>
      </div>

      {/* 중앙 메인 영역 */}
      <div style={{ flex: 1, height: '100vh', padding: '20px', paddingBottom: '75px', overflowY: 'auto', background: currentViewMode === 'chat' ? '#abc1de' : '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        {currentViewMode === 'calendar' ? (
          selectedRoomIds.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ margin: 0 }}>{year}년 {month + 1}월</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEventAddModalOpen(true)} style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ 일정 추가</button>
                  <div>
                    <button onClick={prevMonth} style={{ padding: '6px 12px', marginRight: '4px', cursor: 'pointer' }}>이전</button>
                    <button onClick={nextMonth} style={{ padding: '6px 12px', cursor: 'pointer' }}>다음</button>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#dee2e6', borderTop: '1px solid #ced4da', borderLeft: '1px solid #ced4da' }}>
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                  <div key={idx} style={{ background: '#f1f3f5', textAlign: 'center', fontWeight: 'bold', padding: '8px 0', fontSize: '13px', borderRight: '1px solid #ced4da', borderBottom: '1px solid #ced4da' }}>{day}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(90px, 1fr)', background: '#ced4da', borderLeft: '1px solid #ced4da', flex: 1 }}>
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} style={{ background: '#f8f9fa', borderRight: '1px solid #ced4da', borderBottom: '1px solid #ced4da' }} />
                ))}
                {Array.from({ length: lastDateOfMonth }).map((_, index) => {
                  const dayNum = index + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayEvents = events.filter(ev => selectedRoomIds.includes(ev.room_id) && dateStr >= ev.event_date && dateStr <= (ev.end_date || ev.event_date));

                  return (
                    <div key={`day-${dayNum}`} style={{ background: '#fff', borderRight: '1px solid #ced4da', borderBottom: '1px solid #ced4da', padding: '4px', overflowY: 'auto' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{dayNum}</div>
                      {dayEvents.map(ev => (
                        <div key={ev.id} onClick={() => { setSelectedEvent(ev); setEventDetailModalOpen(true); }} style={{ fontSize: '11px', background: ev.color || '#339af0', color: '#fff', padding: '2px 4px', borderRadius: '3px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <h3 style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>좌측 메뉴에서 캘린더에 표시할 방을 선택해주세요.</h3>
          )
        ) : currentViewMode === 'settlement' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2>💰 지출 및 정산 관리</h2>
              <button onClick={() => setSettlementModalOpen(true)} style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ 정산 등록하기</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {settlements.map((st) => (
                <div key={st.id} onClick={() => { setSelectedSettlement(st); setSettlementDetailModalOpen(true); }} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{st.title}</div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>총 금액: {Number(st.total_amount).toLocaleString()}원</div>
                  </div>
                  {st.receipt_url && <span style={{ fontSize: '12px', background: '#e7f5ff', color: '#007bff', padding: '4px 8px', borderRadius: '4px' }}>영수증 첨부됨</span>}
                </div>
              ))}
            </div>
          </div>
        ) : currentViewMode === 'chat' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h2>💬 자유 채팅방</h2>
            <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '10px' }}>
              {chatMessages.map((msg, index) => (
                <div key={msg.id || index} style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#007bff' }}>{profilesMap[msg.user_id]?.name || '멤버'}</div>
                  <div style={{ fontSize: '14px', marginTop: '2px' }}>{msg.content}</div>
                </div>
              ))}
            </div>
            <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input type="text" placeholder="메시지를 입력하세요..." value={chatInputText} onChange={e => setChatInputText(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <button type="submit" style={{ padding: '10px 18px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>전송</button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>투표 목록 화면입니다.</div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100vw', height: '55px', background: '#343a40', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 40 }}>
        <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📁 방 목록 / 메뉴</button>
      </div>

      {/* 모달: 방 생성 */}
      {roomModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={createRoom} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>새 캘린더 방 만들기</h3>
            <input type="text" placeholder="방 이름" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>생성</button>
              <button type="button" onClick={() => setRoomModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 모달: 방 관리 */}
      {roomManageModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '400px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>방 관리하기</h3>
            {rooms.map(room => (
              <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd' }}>
                {editingRoomId === room.id ? (
                  <input type="text" value={editRoomNameText} onChange={e => setEditRoomNameText(e.target.value)} style={{ padding: '4px' }} />
                ) : (
                  <span>{room.name}</span>
                )}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {editingRoomId === room.id ? (
                    <button onClick={() => updateRoomName(room.id)} style={{ padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>저장</button>
                  ) : (
                    <button onClick={() => { setEditingRoomId(room.id); setEditRoomNameText(room.name); }} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '4px' }}>수정</button>
                  )}
                  <button onClick={() => deleteRoom(room.id)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>삭제</button>
                </div>
              </div>
            ))}
            <button onClick={() => setRoomManageModalOpen(false)} style={{ padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>닫기</button>
          </div>
        </div>
      )}

      {/* 모달: 일정 추가 */}
      {eventAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={createEvent} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3>새 일정 추가</h3>
            <select value={targetRoomIdForAdd || ''} onChange={e => setTargetRoomIdForAdd(e.target.value)} style={{ padding: '8px' }}>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input type="text" placeholder="일정 제목" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} required style={{ padding: '8px' }} />
            <textarea placeholder="내용" value={newEventContent} onChange={e => setNewEventContent(e.target.value)} style={{ padding: '8px' }} />
            <div>
              <label style={{ fontSize: '12px' }}>시작일</label>
              <input type="date" value={newEventStartDate} onChange={e => setNewEventStartDate(e.target.value)} required style={{ padding: '8px', width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px' }}>종료일 (선택)</label>
              <input type="date" value={newEventEndDate} onChange={e => setNewEventEndDate(e.target.value)} style={{ padding: '8px', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px' }}>추가</button>
              <button type="button" onClick={() => setEventAddModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 모달: 정산 등록 */}
      {settlementModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={createSettlement} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>새 정산 등록</h3>
            <select value={targetRoomIdForSettlement || ''} onChange={e => setTargetRoomIdForSettlement(e.target.value)} style={{ padding: '8px' }}>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input type="text" placeholder="제목 (예: 저녁 식사비)" value={newSettlementTitle} onChange={e => setNewSettlementTitle(e.target.value)} required style={{ padding: '8px' }} />
            <input type="number" placeholder="총 금액" value={newSettlementTotalAmount} onChange={e => setNewSettlementTotalAmount(e.target.value)} required style={{ padding: '8px' }} />
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>영수증 이미지 첨부</label>
              <input type="file" accept="image/*" onChange={e => { if (e.target.files) setNewSettlementFile(e.target.files[0]); }} />
            </div>
            <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>등록하기</button>
            <button type="button" onClick={() => setSettlementModalOpen(false)} style={{ padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
          </form>
        </div>
      )}

      {/* 모달: 정산 상세 정보 */}
      {settlementDetailModalOpen && selectedSettlement && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '450px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>정산 상세 정보</h3>
            <div><b>제목:</b> {selectedSettlement.title}</div>
            <div><b>총 금액:</b> {Number(selectedSettlement.total_amount).toLocaleString()}원</div>
            {selectedSettlement.receipt_url && (
              <div>
                <b>영수증:</b><br />
                <a href={selectedSettlement.receipt_url} target="_blank" rel="noreferrer">
                  <img src={selectedSettlement.receipt_url} alt="영수증" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '6px', borderRadius: '4px', border: '1px solid #ddd' }} />
                </a>
              </div>
            )}
            <h4>개별 분담금 내역</h4>
            {settlementItemsList.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: '#f8f9fa', borderRadius: '4px' }}>
                <span>{profilesMap[item.user_id]?.name || '멤버'} ({Number(item.amount).toLocaleString()}원)</span>
                <span style={{ color: item.is_paid ? 'green' : 'red', fontWeight: 'bold' }}>{item.is_paid ? '입금완료' : '미입금'}</span>
              </div>
            ))}
            <button onClick={() => setSettlementDetailModalOpen(false)} style={{ padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
