import React, { useState, useEffect, useRef } from 'react';
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
  const [voteStatusModalOpen, setVoteStatusModalOpen] = useState(false);

  // 정산 관련 상태 (수정됨)
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [newSettlementTitle, setNewSettlementTitle] = useState('');
  const [settlementRows, setSettlementRows] = useState<{ desc: string; amount: string }[]>([
    { desc: '', amount: '' }
  ]);
  const [targetRoomIdForSettlement, setTargetRoomIdForSettlement] = useState<string | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [settlementItemsList, setSettlementItemsList] = useState<any[]>([]);
  const [settlementDetailModalOpen, setSettlementDetailModalOpen] = useState(false);

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

  const fetchVotes = async () => {
    const { data, error } = await supabase.from('votes').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setVotes(data);
    }
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
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .in('room_id', selectedRoomIds)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setSettlements(data);
    }
  };

  const fetchSettlementDetails = async (settlementId: string) => {
    const { data, error } = await supabase
      .from('settlement_items')
      .select('*')
      .eq('settlement_id', settlementId);
    if (!error && data) {
      setSettlementItemsList(data);
    }
  };

  // 총 합계 계산 함수
  const calculateTotalAmount = () => {
    return settlementRows.reduce((sum, row) => {
      const amt = parseFloat(row.amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  };

  const createSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSettlementTitle.trim() || !targetRoomIdForSettlement) {
      alert('제목을 입력해주세요.');
      return;
    }
    const totalAmount = calculateTotalAmount();
    if (totalAmount <= 0) {
      alert('유효한 금액을 입력해주세요.');
      return;
    }

    const { data: settlementData, error: settlementError } = await supabase
      .from('settlements')
      .insert([{
        room_id: targetRoomIdForSettlement,
        user_id: session.user.id,
        title: newSettlementTitle.trim(),
        total_amount: totalAmount
      }])
      .select()
      .single();

    if (settlementError || !settlementData) {
      alert('정산 생성 실패: ' + (settlementError?.message || '알 수 없는 오류'));
      return;
    }

    const allProfileIds = Object.keys(profilesMap);
    if (allProfileIds.length > 0) {
      const share = parseFloat((totalAmount / allProfileIds.length).toFixed(2));
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
    setSettlementRows([{ desc: '', amount: '' }]);
    setSettlementModalOpen(false);
    fetchSettlements();
  };

  const toggleItemPaid = async (itemId: string, currentPaid: boolean) => {
    const { error } = await supabase
      .from('settlement_items')
      .update({ is_paid: !currentPaid })
      .eq('id', itemId);
    if (!error && selectedSettlement) {
      fetchSettlementDetails(selectedSettlement.id);
    }
  };

  const deleteSettlement = async (settlementId: string) => {
    if (!confirm('정말 이 정산을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('settlements').delete().eq('id', settlementId);
    if (!error) {
      alert('정산이 삭제되었습니다.');
      setSettlementDetailModalOpen(false);
      setSelectedSettlement(null);
      fetchSettlements();
    }
  };

  const createVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoteTitle.trim()) {
      alert('투표 제목을 입력해주세요.');
      return;
    }
    const validOptions = newVoteOptions.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('투표 항목은 최소 2개 이상 입력해야 합니다.');
      return;
    }

    const { data: voteData, error: voteError } = await supabase.from('votes').insert([{
      title: newVoteTitle.trim(),
      user_id: session.user.id,
      end_date: newVoteEndDate || null,
      status: 'active',
      is_multiple: newVoteIsMultiple,
      is_anonymous: newVoteIsAnonymous
    }]).select().single();

    if (voteError || !voteData) {
      alert('투표 생성 실패: ' + (voteError?.message || '알 수 없는 오류'));
      return;
    }

    const optionInserts = validOptions.map(opt => ({
      vote_id: voteData.id,
      content: opt.trim()
    }));

    const { error: optionError } = await supabase.from('vote_options').insert(optionInserts);
    if (optionError) {
      alert('투표 항목 등록 실패: ' + optionError.message);
    } else {
      alert('새로운 투표가 생성되었습니다!');
      setNewVoteTitle('');
      setNewVoteEndDate('');
      setNewVoteOptions(['', '']);
      setNewVoteIsMultiple(false);
      setNewVoteIsAnonymous(true);
      setVoteModalOpen(false);
      fetchVotes();
    }
  };

  const castVote = async () => {
    if (selectedOptionIds.length === 0) {
      alert('항목을 하나 이상 선택해주세요.');
      return;
    }

    await supabase.from('vote_records').delete().match({ vote_id: selectedVote.id, user_id: session.user.id });

    const inserts = selectedOptionIds.map(optId => ({
      vote_id: selectedVote.id,
      option_id: optId,
      user_id: session.user.id
    }));

    const { error } = await supabase.from('vote_records').insert(inserts);

    if (error) {
      alert('투표 참여 실패: ' + error.message);
    } else {
      alert('투표가 완료되었습니다!');
      fetchVoteDetails(selectedVote.id);
      fetchVotes();
    }
  };

  const toggleVoteStatus = async (voteId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
    const { error } = await supabase.from('votes').update({ status: nextStatus }).eq('id', voteId);
    if (!error) {
      fetchVotes();
      if (selectedVote && selectedVote.id === voteId) {
        setSelectedVote({ ...selectedVote, status: nextStatus });
      }
    }
  };

  const deleteVote = async (voteId: string) => {
    if (!confirm('정말 이 투표를 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('votes').delete().eq('id', voteId);
    if (!error) {
      alert('투표가 삭제되었습니다.');
      setVoteDetailModalOpen(false);
      setSelectedVote(null);
      fetchVotes();
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) {
      setChatMessages(data);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const { error } = await supabase.from('messages').insert([
      {
        user_id: session.user.id,
        content: chatInputText.trim()
      }
    ]);

    if (error) {
      alert('메시지 전송 실패: ' + error.message);
    } else {
      setChatInputText('');
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
    } else if (!leftSidebarOpen && !rightSidebarOpen && currentViewMode === 'calendar' && Math.abs(distance) > minSwipeDistance) {
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
        setTargetRoomIdForSettlement(data[0].id);
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
    if (!error && data) {
      setAllProfiles(data);
      const colorsMap: Record<string, string> = {};
      data.forEach(p => {
        colorsMap[p.id] = p.color || '#339af0';
      });
      setAdminEditedColors(colorsMap);
    }
  };

  const adminUpdateUserColor = async (userId: string) => {
    const newColor = adminEditedColors[userId];
    if (!newColor) return;

    const { error } = await supabase
      .from('profiles')
      .update({ color: newColor })
      .eq('id', userId);

    if (error) {
      alert('멤버 색상 변경 실패: ' + error.message);
    } else {
      alert('멤버의 프로필 색상이 변경되었습니다.');
      fetchAllProfiles();
      fetchProfilesMap();
    }
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
      if (targetRoomIdForSettlement === roomId && next.length > 0) {
        setTargetRoomIdForSettlement(next[0]);
      }
    } else {
      const next = [...selectedRoomIds, roomId];
      setSelectedRoomIds(next);
      if (!targetRoomIdForAdd) {
        setTargetRoomIdForAdd(roomId);
      }
      if (!targetRoomIdForSettlement) {
        setTargetRoomIdForSettlement(roomId);
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
                  style={{ width: '20px', height: '20px', borderRadius: '50%', background: profile?.color || '#339af0', flexShrink: 0, border: '1px solid rgba(0,0,0,0.2)' }}
                />
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

            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* [커뮤니티 카테고리] */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>커뮤니티</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div 
                    onClick={() => setCurrentViewMode('chat')}
                    style={{ 
                      padding: '10px 12px', 
                      background: currentViewMode === 'chat' ? '#228be6' : '#fff', 
                      color: currentViewMode === 'chat' ? '#fff' : '#333', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      border: '1px solid #ddd', 
                      fontSize: '14px', 
                      fontWeight: currentViewMode === 'chat' ? 'bold' : 'normal', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      boxShadow: currentViewMode === 'chat' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span>💬 자유 채팅방</span>
                    {currentViewMode === 'chat' && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px' }}>선택됨</span>}
                  </div>

                  <div 
                    onClick={() => setCurrentViewMode('vote')}
                    style={{ 
                      padding: '10px 12px', 
                      background: currentViewMode === 'vote' ? '#228be6' : '#fff', 
                      color: currentViewMode === 'vote' ? '#fff' : '#333', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      border: '1px solid #ddd', 
                      fontSize: '14px', 
                      fontWeight: currentViewMode === 'vote' ? 'bold' : 'normal', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      boxShadow: currentViewMode === 'vote' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span>📊 투표 목록</span>
                    {currentViewMode === 'vote' && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px' }}>선택됨</span>}
                  </div>

                  <div 
                    onClick={() => {
                      setCurrentViewMode('settlement');
                      fetchSettlements();
                    }}
                    style={{ 
                      padding: '10px 12px', 
                      background: currentViewMode === 'settlement' ? '#228be6' : '#fff', 
                      color: currentViewMode === 'settlement' ? '#fff' : '#333', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      border: '1px solid #ddd', 
                      fontSize: '14px', 
                      fontWeight: currentViewMode === 'settlement' ? 'bold' : 'normal', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      boxShadow: currentViewMode === 'settlement' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span>💰 정산 관리</span>
                    {currentViewMode === 'settlement' && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px' }}>선택됨</span>}
                  </div>
                </div>
              </div>

              {/* [캘린더 방 목록 카테고리] */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>캘린더 방 목록</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rooms.map(room => {
                    const isSelected = currentViewMode === 'calendar' && selectedRoomIds.includes(room.id);
                    return (
                      <div 
                        key={room.id} 
                        onClick={() => {
                          setCurrentViewMode('calendar');
                          toggleRoomSelection(room.id);
                        }}
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
          </div>

          <div style={{ paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setRoomModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#f1f3f5', color: '#212529', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>방 생성하기 +</button>
            <button onClick={() => setRoomManageModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#343a40', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>방 관리하기 ⚙️</button>
          </div>
        </div>
      </div>

      {/* 2. 중앙 메인 콘텐츠 뷰 */}
      <div style={{ flex: 1, height: '100vh', padding: '20px', paddingBottom: '75px', overflowY: 'hidden', background: currentViewMode === 'chat' ? '#abc1de' : '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 }}>
        
        {/* [자유 채팅방 화면] */}
        {currentViewMode === 'chat' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#222' }}>💬 자유 채팅방</h2>
              <span style={{ fontSize: '12px', color: '#444' }}>실시간 소통 공간</span>
            </div>

            <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px', paddingBottom: '10px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#555', marginTop: '40px', fontSize: '14px' }}>첫 메시지를 남겨보세요!</div>
              ) : (
                chatMessages.map((msg, index) => {
                  const isMyMessage = msg.user_id === session?.user?.id;
                  const sender = profilesMap[msg.user_id] || { name: '알 수 없음', color: '#339af0' };

                  const msgDateObj = new Date(msg.created_at);
                  const dateString = `${msgDateObj.getFullYear()}년 ${msgDateObj.getMonth() + 1}월 ${msgDateObj.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][msgDateObj.getDay()]}요일`;
                  
                  const prevMsg = index > 0 ? chatMessages[index - 1] : null;
                  const prevDateString = prevMsg ? `${new Date(prevMsg.created_at).getFullYear()}년 ${new Date(prevMsg.created_at).getMonth() + 1}월 ${new Date(prevMsg.created_at).getDate()}일` : null;
                  const currentDateStringOnly = `${msgDateObj.getFullYear()}년 ${msgDateObj.getMonth() + 1}월 ${msgDateObj.getDate()}일`;

                  const showDateDivider = !prevMsg || prevDateString !== currentDateStringOnly;

                  let hours = msgDateObj.getHours();
                  const minutes = String(msgDateObj.getMinutes()).padStart(2, '0');
                  const ampm = hours >= 12 ? '오후' : '오전';
                  hours = hours % 12;
                  hours = hours ? hours : 12;
                  const timeString = `${ampm} ${hours}:${minutes}`;

                  return (
                    <React.Fragment key={msg.id || index}>
                      {showDateDivider && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0 10px 0' }}>
                          <span style={{ background: 'rgba(0,0,0,0.15)', color: '#fff', fontSize: '11px', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                            📅 {dateString}
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start', margin: '2px 0' }}>
                        {!isMyMessage && (
                          <div style={{ fontSize: '12px', color: '#333', marginBottom: '2px', marginLeft: '4px', fontWeight: 'bold' }}>
                            {sender.name}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexDirection: isMyMessage ? 'row-reverse' : 'row' }}>
                          <div style={{
                            background: isMyMessage ? '#fee102' : '#ffffff',
                            color: '#111',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            maxWidth: '65%',
                            wordBreak: 'break-all',
                            fontSize: '14px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            borderTopRightRadius: isMyMessage ? '2px' : '12px',
                            borderTopLeftRadius: isMyMessage ? '12px' : '2px',
                          }}>
                            {msg.content}
                          </div>
                          <span style={{ fontSize: '10px', color: '#555', minWidth: '45px', textAlign: isMyMessage ? 'right' : 'left' }}>
                            {timeString}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: '8px', marginTop: '10px', background: '#fff', padding: '8px', borderRadius: '8px', boxShadow: '0 -1px 4px rgba(0,0,0,0.05)' }}>
              <input 
                type="text" 
                placeholder="메시지를 입력하세요..." 
                value={chatInputText} 
                onChange={e => setChatInputText(e.target.value)} 
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} 
              />
              <button type="submit" style={{ padding: '10px 18px', background: '#fee102', color: '#3c1e1e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>전송</button>
            </form>
          </div>
        ) : currentViewMode === 'vote' ? (
          /* [투표 목록 화면] */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid #eee', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#222' }}>📊 커뮤니티 투표 목록</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>진행 중이거나 완료된 투표 목록을 확인하고 참여할 수 있습니다.</p>
              </div>
              <button 
                onClick={() => setVoteModalOpen(true)}
                style={{ padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                + 투표 만들기
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
              {votes.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>등록된 투표가 없습니다. 상단의 '투표 만들기'를 눌러 시작해보세요!</div>
              ) : (
                votes.map((vote) => {
                  const author = profilesMap[vote.user_id]?.name || '관리자';
                  return (
                    <div 
                      key={vote.id}
                      onClick={() => {
                        setSelectedVote(vote);
                        const myRecords = voteRecordsList.filter(r => r.vote_id === vote.id && r.user_id === session?.user?.id);
                        setSelectedOptionIds(myRecords.map(r => r.option_id));
                        setVoteDetailModalOpen(true);
                      }}
                      style={{ 
                        background: '#fff', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 'bold', 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            background: vote.status === 'active' ? '#e7f5ff' : '#f1f3f5',
                            color: vote.status === 'active' ? '#1c7ed6' : '#495057'
                          }}>
                            {vote.status === 'active' ? '🟢 진행 중' : '⚪ 마감됨'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: '#f8f9fa', color: '#495057', border: '1px solid #ddd' }}>
                            {vote.is_multiple ? '중복선택 가능' : '단일선택'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: '#f8f9fa', color: '#495057', border: '1px solid #ddd' }}>
                            {vote.is_anonymous ? '익명' : '실명확인'}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#888' }}>마감일: {vote.end_date || '기한 없음'}</span>
                      </div>

                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>
                        {vote.title}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '12px', color: '#666' }}>
                        <span>작성자: {author}</span>
                        <span style={{ fontWeight: 'bold', color: '#007bff' }}>참여하기 &gt;</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : currentViewMode === 'settlement' ? (
          /* [정산 관리 화면] */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid #eee', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#222' }}>💰 지출 및 정산 관리</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>전체 정산 내역을 확인하고 송금 상태를 관리할 수 있습니다.</p>
              </div>
              <button 
                onClick={() => setSettlementModalOpen(true)}
                style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                + 정산 등록하기
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
              {settlements.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>등록된 정산 내역이 없습니다. 우측 상단의 '정산 등록하기'를 눌러 시작해보세요!</div>
              ) : (
                settlements.map((st) => {
                  const author = profilesMap[st.user_id]?.name || '알 수 없음';
                  return (
                    <div 
                      key={st.id}
                      onClick={() => {
                        setSelectedSettlement(st);
                        setSettlementDetailModalOpen(true);
                      }}
                      style={{ 
                        background: '#fff', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>{new Date(st.created_at).toLocaleDateString()}</span>
                      </div>

                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                        {st.title}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#666' }}>등록자: {author}</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#e03131' }}>
                          총 {Number(st.total_amount).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* [캘린더 모드 화면] */
          selectedRoomIds.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
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
          )
        )}
      </div>

      {/* 3. 우측 사이드바 컨테이너 */}
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
                      setEventDetailModalOpen(true);
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

      {/* 정산 등록 모달 (수정됨) */}
      {settlementModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={createSettlement} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '480px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>새 정산 등록</h3>
            
            {/* 제목 */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>정산 내용 (제목)</label>
              <input 
                type="text" 
                placeholder="예: 부산 여행 첫째 날 저녁" 
                value={newSettlementTitle} 
                onChange={e => setNewSettlementTitle(e.target.value)} 
                required 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
              />
            </div>

            {/* 숨겨진 대상 방 자동 처리용 (첫 번째 방 지정) */}
            <input type="hidden" value={targetRoomIdForSettlement || ''} />

            {/* 좌우 나눔 내역 및 금액 입력 영역 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>지출 세부 내역 및 금액</label>
                <button 
                  type="button"
                  onClick={() => setSettlementRows([...settlementRows, { desc: '', amount: '' }])}
                  style={{ padding: '4px 8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + 내역 추가
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto', paddingRight: '2px' }}>
                {settlementRows.map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      placeholder="내역 (예: 삼겹살)" 
                      value={row.desc} 
                      onChange={e => {
                        const nextRows = [...settlementRows];
                        nextRows[idx].desc = e.target.value;
                        setSettlementRows(nextRows);
                      }}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                    <input 
                      type="number" 
                      placeholder="금액" 
                      value={row.amount} 
                      onChange={e => {
                        const nextRows = [...settlementRows];
                        nextRows[idx].amount = e.target.value;
                        setSettlementRows(nextRows);
                      }}
                      style={{ width: '110px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                    {settlementRows.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setSettlementRows(settlementRows.filter((_, i) => i !== idx))}
                        style={{ padding: '0 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 총 금액 합계 표시 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>총 금액 합계</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#e03131' }}>
                {calculateTotalAmount().toLocaleString()}원
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>등록하기</button>
              <button type="button" onClick={() => setSettlementModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 정산 상세 및 송금 체크 모달 */}
      {settlementDetailModalOpen && selectedSettlement && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '450px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#222' }}>💰 정산 상세 및 송금 현황</h3>
              <button onClick={() => setSettlementDetailModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}>✕</button>
            </div>

            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{selectedSettlement.title}</div>
              <div style={{ fontSize: '13px', color: '#e03131', fontWeight: 'bold', marginTop: '4px' }}>
                총 금액: {Number(selectedSettlement.total_amount).toLocaleString()}원
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>참여자별 분담금 (체크박스로 송금완료 토글)</span>
              {settlementItemsList.map(item => {
                const member = profilesMap[item.user_id] || { name: '알 수 없음' };
                return (
                  <div 
                    key={item.id}
                    style={{ 
                      padding: '10px 12px', 
                      background: item.is_paid ? '#ebfbee' : '#f8f9fa', 
                      border: item.is_paid ? '1px solid #b2f2bb' : '1px solid #ddd', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                      <input 
                        type="checkbox" 
                        checked={item.is_paid} 
                        onChange={() => toggleItemPaid(item.id, item.is_paid)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{member.name}</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{Number(item.amount).toLocaleString()}원</span>
                      <span style={{ fontSize: '12px', color: item.is_paid ? '#2b8a3e' : '#c92a2a', fontWeight: 'bold' }}>
                        {item.is_paid ? '송금완료' : '미송금'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {(selectedSettlement.user_id === session?.user?.id || profile?.role === 'admin') && (
              <button 
                onClick={() => deleteSettlement(selectedSettlement.id)}
                style={{ width: '100%', padding: '8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                정산 내역 삭제
              </button>
            )}

            <button 
              onClick={() => setSettlementDetailModalOpen(false)} 
              style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 투표 만들기 모달 */}
      {voteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={createVote} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>새 투표 만들기</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={newVoteIsMultiple} 
                  onChange={e => setNewVoteIsMultiple(e.target.checked)} 
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                중복 선택 가능 (여러 항목 투표 허용)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={newVoteIsAnonymous} 
                  onChange={e => setNewVoteIsAnonymous(e.target.checked)} 
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                익명 투표로 만들기 (체크 해제 시 실명 및 투표 현황 확인 가능)
              </label>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>투표 제목</label>
              <input type="text" placeholder="예: 다음 주 회식 장소 추천" value={newVoteTitle} onChange={e => setNewVoteTitle(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>마감일 (선택)</label>
              <input type="date" value={newVoteEndDate} onChange={e => setNewVoteEndDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>투표 항목</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {newVoteOptions.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      placeholder={`항목 ${idx + 1}`} 
                      value={opt} 
                      onChange={e => {
                        const nextOpts = [...newVoteOptions];
                        nextOpts[idx] = e.target.value;
                        setNewVoteOptions(nextOpts);
                      }} 
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} 
                    />
                    {newVoteOptions.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => setNewVoteOptions(newVoteOptions.filter((_, i) => i !== idx))}
                        style={{ padding: '0 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => setNewVoteOptions([...newVoteOptions, ''])}
                style={{ marginTop: '8px', padding: '6px 10px', background: '#f1f3f5', color: '#333', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
              >
                + 항목 추가
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>생성하기</button>
              <button type="button" onClick={() => setVoteModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 투표 상세 및 참여 모달 */}
      {voteDetailModalOpen && selectedVote && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '480px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: selectedVote.status === 'active' ? '#e7f5ff' : '#f1f3f5', color: selectedVote.status === 'active' ? '#1c7ed6' : '#495057' }}>
                  {selectedVote.status === 'active' ? '🟢 진행 중' : '⚪ 마감됨'}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: '#f8f9fa', color: '#495057', border: '1px solid #ddd' }}>
                  {selectedVote.is_multiple ? '중복선택 가능' : '단일선택'}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: '#f8f9fa', color: '#495057', border: '1px solid #ddd' }}>
                  {selectedVote.is_anonymous ? '익명 투표' : '실명 투표'}
                </span>
              </div>
              <button onClick={() => setVoteDetailModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}>✕</button>
            </div>

            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#222' }}>{selectedVote.title}</h3>
              <div style={{ fontSize: '12px', color: '#888' }}>마감일: {selectedVote.end_date || '기한 없음'}</div>
            </div>

            {!selectedVote.is_anonymous && (
              <button 
                onClick={() => setVoteStatusModalOpen(true)}
                style={{ width: '100%', padding: '8px', background: '#e7f5ff', color: '#007bff', border: '1px solid #b2f2bb', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                👥 누가 누구에게 투표했는지 보기 (투표 현황)
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>투표 항목 및 현황</span>
              {voteOptionsList.map(opt => {
                const matchedRecords = voteRecordsList.filter(r => r.option_id === opt.id);
                const count = matchedRecords.length;
                const totalCount = voteRecordsList.length;
                const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                const isSelectedByMe = selectedOptionIds.includes(opt.id);
                const voterNames = matchedRecords.map(r => profilesMap[r.user_id]?.name || '알 수 없음').join(', ');

                return (
                  <div 
                    key={opt.id}
                    onClick={() => {
                      if (selectedVote.status === 'active') {
                        if (selectedVote.is_multiple) {
                          if (selectedOptionIds.includes(opt.id)) {
                            setSelectedOptionIds(selectedOptionIds.filter(id => id !== opt.id));
                          } else {
                            setSelectedOptionIds([...selectedOptionIds, opt.id]);
                          }
                        } else {
                          setSelectedOptionIds([opt.id]);
                        }
                      }
                    }}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: isSelectedByMe ? '2px solid #007bff' : '1px solid #ddd',
                      background: isSelectedByMe ? '#e7f5ff' : '#f8f9fa',
                      cursor: selectedVote.status === 'active' ? 'pointer' : 'default',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`, background: 'rgba(0, 123, 255, 0.08)', zIndex: 1 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2, fontSize: '14px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type={selectedVote.is_multiple ? "checkbox" : "radio"} 
                          checked={isSelectedByMe} 
                          onChange={() => {}} 
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: isSelectedByMe ? 'bold' : 'normal', color: '#333' }}>
                          {opt.content}
                        </span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#007bff' }}>{count}표</span>
                    </div>

                    {!selectedVote.is_anonymous && count > 0 && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#555', position: 'relative', zIndex: 2, paddingLeft: '22px' }}>
                        투표자: <b>{voterNames}</b>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedVote.status === 'active' && (
              <button 
                onClick={castVote}
                style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                투표하기 / 변경하기
              </button>
            )}

            {(selectedVote.user_id === session?.user?.id || profile?.role === 'admin') && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                <button 
                  onClick={() => toggleVoteStatus(selectedVote.id, selectedVote.status)}
                  style={{ flex: 1, padding: '8px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  {selectedVote.status === 'active' ? '투표 마감하기' : '투표 재개하기'}
                </button>
                <button 
                  onClick={() => deleteVote(selectedVote.id)}
                  style={{ flex: 1, padding: '8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  투표 삭제
                </button>
              </div>
            )}

            <button 
              onClick={() => setVoteDetailModalOpen(false)} 
              style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 투표 현황 상세 보기 모달 */}
      {voteStatusModalOpen && selectedVote && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '420px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>👥 전체 투표 현황 (실명)</h3>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>각 유저가 어떤 항목에 투표했는지 확인할 수 있습니다.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {(() => {
                const userVotedMap: Record<string, string[]> = {};
                voteRecordsList.forEach(r => {
                  if (!userVotedMap[r.user_id]) userVotedMap[r.user_id] = [];
                  const opt = voteOptionsList.find(o => o.id === r.option_id);
                  if (opt) userVotedMap[r.user_id].push(opt.content);
                });

                const userIds = Object.keys(userVotedMap);
                if (userIds.length === 0) {
                  return <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>아직 투표한 참여자가 없습니다.</div>;
                }

                return userIds.map(uid => {
                  const userName = profilesMap[uid]?.name || '알 수 없음';
                  const choices = userVotedMap[uid].join(', ');
                  return (
                    <div key={uid} style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#333' }}>{userName}</span>
                      <span style={{ fontSize: '13px', color: '#007bff' }}>{choices}</span>
                    </div>
                  );
                });
              })()}
            </div>

            <button 
              onClick={() => setVoteStatusModalOpen(false)} 
              style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 일정 상세 정보 및 댓글 모달 */}
      {eventDetailModalOpen && selectedEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '450px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#222' }}>{selectedEvent.title}</h3>
              <button onClick={() => setEventDetailModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}>✕</button>
            </div>

            <div style={{ fontSize: '13px', color: '#666', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>📅 일정: {selectedEvent.event_date} {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.event_date ? `~ ${selectedEvent.end_date}` : ''}</div>
              <div>👤 작성자: {profilesMap[selectedEvent.user_id]?.name || '익명'}</div>
              {selectedEvent.content && <div style={{ marginTop: '8px', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee', color: '#333' }}>{selectedEvent.content}</div>}
            </div>

            {/* 댓글 영역 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>댓글 ({comments.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {comments.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '10px' }}>첫 댓글을 남겨보세요!</div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} style={{ background: '#f8f9fa', padding: '8px 10px', borderRadius: '6px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>{profilesMap[c.user_id]?.name || '익명'}</span>
                        <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#333', wordBreak: 'break-all' }}>{c.content}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={addComment} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input 
                  type="text" 
                  placeholder="댓글을 입력하세요..." 
                  value={newCommentText} 
                  onChange={e => setNewCommentText(e.target.value)} 
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }} 
                />
                <button type="submit" style={{ padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>등록</button>
              </form>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
              {(selectedEvent.user_id === session?.user?.id || profile?.role === 'admin') && (
                <>
                  <button 
                    onClick={() => {
                      setEditEventTitle(selectedEvent.title);
                      setEditEventContent(selectedEvent.content || '');
                      setEditEventStartDate(selectedEvent.event_date);
                      setEditEventEndDate(selectedEvent.end_date || selectedEvent.event_date);
                      setEditEventColor(selectedEvent.color || profilesMap[selectedEvent.user_id]?.color || '#339af0');
                      setEventDetailModalOpen(false);
                      setEventEditModalOpen(true);
                    }}
                    style={{ flex: 1, padding: '8px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    일정 수정
                  </button>
                  <button 
                    onClick={() => deleteEvent(selectedEvent.id)}
                    style={{ flex: 1, padding: '8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>

            <button 
              onClick={() => setEventDetailModalOpen(false)} 
              style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 일정 수정 모달 */}
      {eventEditModalOpen && selectedEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <form onSubmit={updateEvent} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>일정 수정하기</h3>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>제목</label>
              <input type="text" value={editEventTitle} onChange={e => setEditEventTitle(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>내용 (선택)</label>
              <textarea value={editEventContent} onChange={e => setEditEventContent(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', height: '60px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>시작일</label>
                <input type="date" value={editEventStartDate} onChange={e => setEditEventStartDate(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>종료일</label>
                <input type="date" value={editEventEndDate} onChange={e => setEditEventEndDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>색상 선택</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(color => (
                  <div 
                    key={color} 
                    onClick={() => setEditEventColor(color)}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', background: color, cursor: 'pointer', border: editEventColor === color ? '3px solid #000' : '1px solid #ddd' }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>수정완료</button>
              <button type="button" onClick={() => setEventEditModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 일정 추가 모달 */}
      {eventAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={createEvent} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '400px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>새 일정 등록</h3>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>대상 방</label>
              <select value={targetRoomIdForAdd || ''} onChange={e => setTargetRoomIdForAdd(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>제목</label>
              <input type="text" placeholder="예: 바베큐 파티" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>내용 (선택)</label>
              <textarea placeholder="상세 내용..." value={newEventContent} onChange={e => setNewEventContent(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', height: '60px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>시작일</label>
                <input type="date" value={newEventStartDate} onChange={e => setNewEventStartDate(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>종료일 (선택)</label>
                <input type="date" value={newEventEndDate} onChange={e => setNewEventEndDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>일정 색상 선택</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {PRESET_COLORS.map(color => {
                  const label = colorLabels[color] || DEFAULT_COLOR_LABELS[color];
                  return (
                    <div 
                      key={color} 
                      onClick={() => setNewEventColor(color)}
                      title={label}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', background: color, cursor: 'pointer', border: newEventColor === color ? '3px solid #000' : '1px solid #ddd' }}
                    />
                  );
                })}
              </div>
              <div style={{ fontSize: '12px', color: '#555', background: '#f8f9fa', padding: '6px 8px', borderRadius: '4px', border: '1px solid #eee' }}>
                선택된 색상 용도: <b>{colorLabels[newEventColor] || DEFAULT_COLOR_LABELS[newEventColor] || '일반 일정'}</b>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>등록하기</button>
              <button type="button" onClick={() => setEventAddModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 방 생성 모달 */}
      {roomModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={createRoom} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>새 캘린더 방 생성</h3>
            <input type="text" placeholder="방 이름 (예: 제주도 여행)" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>생성</button>
              <button type="button" onClick={() => setRoomModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 방 관리 모달 */}
      {roomManageModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '420px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>⚙️ 방 관리 및 순서 변경</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
              {rooms.map((room, index) => (
                <div key={room.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd' }}>
                  {editingRoomId === room.id ? (
                    <div style={{ display: 'flex', gap: '6px', flex: 1, marginRight: '8px' }}>
                      <input 
                        type="text" 
                        value={editRoomNameText} 
                        onChange={e => setEditRoomNameText(e.target.value)} 
                        style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }} 
                      />
                      <button onClick={() => updateRoomName(room.id)} style={{ padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>저장</button>
                      <button onClick={() => setEditingRoomId(null)} style={{ padding: '4px 8px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>취소</button>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
                  )}

                  {editingRoomId !== room.id && (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button onClick={() => moveRoomOrder(index, 'up')} disabled={index === 0} style={{ padding: '4px 6px', background: '#e9ecef', border: '1px solid #ced4da', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '11px' }}>▲</button>
                      <button onClick={() => moveRoomOrder(index, 'down')} disabled={index === rooms.length - 1} style={{ padding: '4px 6px', background: '#e9ecef', border: '1px solid #ced4da', borderRadius: '4px', cursor: index === rooms.length - 1 ? 'not-allowed' : 'pointer', fontSize: '11px' }}>▼</button>
                      <button onClick={() => { setEditingRoomId(room.id); setEditRoomNameText(room.name); }} style={{ padding: '4px 8px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>수정</button>
                      <button onClick={() => deleteRoom(room.id)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>삭제</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setRoomManageModalOpen(false)} style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>닫기</button>
          </div>
        </div>
      )}

      {/* 관리자 멤버 관리 모달 */}
      {adminModalOpen && profile?.role === 'admin' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '500px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>⚙️ 관리자 멤버 및 가입 승인 관리</h3>

            {/* 가입 대기 목록 */}
            <div>
              <h4 style={{ fontSize: '14px', margin: '0 0 8px 0', color: '#007bff' }}>가입 대기 중인 멤버 ({pendingProfiles.length})</h4>
              {pendingProfiles.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#888', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>대기 중인 멤버가 없습니다.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pendingProfiles.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeeba' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{p.email}</div>
                      </div>
                      <button onClick={() => approveUser(p.id)} style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>승인하기</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 이름 변경 요청 목록 */}
            <div>
              <h4 style={{ fontSize: '14px', margin: '10px 0 8px 0', color: '#fd7e14' }}>이름 변경 신청 목록</h4>
              {allProfiles.filter(p => p.name_status === 'pending').length === 0 ? (
                <div style={{ fontSize: '13px', color: '#888', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>이름 변경 신청한 멤버가 없습니다.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {allProfiles.filter(p => p.name_status === 'pending').map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff8db', borderRadius: '6px', border: '1px solid #ffe066' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>기존: <b>{p.name}</b></div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#d9480f' }}>변경 요청: <b>{p.requested_name}</b></div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => approveNameChange(p.id, p.requested_name)} style={{ padding: '6px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>승인</button>
                        <button onClick={() => rejectNameChange(p.id)} style={{ padding: '6px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>거절</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 전체 멤버 색상 관리 */}
            <div>
              <h4 style={{ fontSize: '14px', margin: '10px 0 8px 0', color: '#333' }}>전체 멤버 프로필 색상 관리</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {allProfiles.filter(p => p.status === 'approved').map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{p.name}</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>({p.email})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="color" 
                        value={adminEditedColors[p.id] || p.color || '#339af0'} 
                        onChange={e => setAdminEditedColors({ ...adminEditedColors, [p.id]: e.target.value })}
                        style={{ width: '32px', height: '26px', border: 'none', cursor: 'pointer', background: 'none' }}
                      />
                      <button onClick={() => adminUpdateUserColor(p.id)} style={{ padding: '4px 8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>변경</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setAdminModalOpen(false)} style={{ width: '100%', padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>닫기</button>
          </div>
        </div>
      )}

      {/* 이름 변경 신청 모달 */}
      {nameChangeModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={requestNameChange} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>본인 이름 변경 신청</h3>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>관리자 승인 후 닉네임이 변경됩니다.</p>
            <input type="text" placeholder="변경할 이름 입력" value={newNameRequestText} onChange={e => setNewNameRequestText(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>신청하기</button>
              <button type="button" onClick={() => setNameChangeModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
