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
  
  // 정산 수정 모달 상태
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
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);
  
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
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .in('room_id', selectedRoomIds)
      .order('created_at', { ascending: false });
    if (!error && data) setSettlements(data);
  };

  const fetchSettlementDetails = async (settlementId: string) => {
    const { data, error } = await supabase
      .from('settlement_items')
      .select('*')
      .eq('settlement_id', settlementId);
    if (!error && data) setSettlementItemsList(data);
  };

  const uploadReceiptImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('영수증 이미지 업로드 실패: ' + uploadError.message);
    }

    const { data: publicURLData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

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

      const { data: settlementData, error: settlementError } = await supabase
        .from('settlements')
        .insert([{
          room_id: targetRoomIdForSettlement,
          user_id: session.user.id,
          title: newSettlementTitle.trim(),
          total_amount: amountNum,
          receipt_url: receiptUrl
        }])
        .select()
        .single();

      if (settlementError || !settlementData) {
        throw new Error(settlementError?.message || '알 수 없는 오류');
      }

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

  const updateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlement || !editSettlementTitle.trim() || !editSettlementTotalAmount) {
      alert('제목과 총 금액을 입력해주세요.');
      return;
    }
    const amountNum = parseFloat(editSettlementTotalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('유효한 금액을 입력해주세요.');
      return;
    }

    try {
      let receiptUrl = selectedSettlement.receipt_url;
      if (editSettlementFile) {
        receiptUrl = await uploadReceiptImage(editSettlementFile);
      }

      const { error } = await supabase
        .from('settlements')
        .update({
          title: editSettlementTitle.trim(),
          total_amount: amountNum,
          receipt_url: receiptUrl
        })
        .eq('id', selectedSettlement.id);

      if (error) throw error;

      alert('정산 내역이 수정되었습니다.');
      setSettlementEditModalOpen(false);
      setEditSettlementFile(null);
      
      const updated = {
        ...selectedSettlement,
        title: editSettlementTitle.trim(),
        total_amount: amountNum,
        receipt_url: receiptUrl
      };
      setSelectedSettlement(updated);
      fetchSettlements();
    } catch (err: any) {
      alert('정산 수정 실패: ' + err.message);
    }
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
    if (!error && data) setChatMessages(data);
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

  const updateRoomName = async (roomId: string) => {
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
      if (!targetRoomIdForAdd) setTargetRoomIdForAdd(roomId);
      if (!targetRoomIdForSettlement) setTargetRoomIdForSettlement(roomId);
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
              <input type="checkbox" checked={autoLogin} onChange={handleAutoLoginChange} style={{ cursor: 'pointer' }} />
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
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: profile?.color || '#339af0', flexShrink: 0, border: '1px solid rgba(0,0,0,0.2)' }} />
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
                  <span style={{ fontSize: '10px', color: '#888' }}>색상: {profile?.color || '#339af0'}</span>
                  
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
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('초대 링크가 클립보드에 복사되었습니다!');
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
              <button onClick={() => setAdminModalOpen(true)} style={{ width: '100%', marginBottom: '15px', padding: '8px 12px', background: '#343a40', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                ⚙️ 멤버 관리 (관리자)
              </button>
            )}

            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>커뮤니티</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div onClick={() => setCurrentViewMode('chat')} style={{ padding: '10px 12px', background: currentViewMode === 'chat' ? '#228be6' : '#fff', color: currentViewMode === 'chat' ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd', fontSize: '14px', fontWeight: currentViewMode === 'chat' ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>💬 자유 채팅방</span>
                    {currentViewMode === 'chat' && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px' }}>선택됨</span>}
                  </div>

                  <div onClick={() => setCurrentViewMode('vote')} style={{ padding: '10px 12px', background: currentViewMode === 'vote' ? '#228be6' : '#fff', color: currentViewMode === 'vote' ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd', fontSize: '14px', fontWeight: currentViewMode === 'vote' ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📊 투표 목록</span>
                    {currentViewMode === 'vote' && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px' }}>선택됨</span>}
                  </div>

                  <div onClick={() => setCurrentViewMode('settlement')} style={{ padding: '10px 12px', background: currentViewMode === 'settlement' ? '#228be6' : '#fff', color: currentViewMode === 'settlement' ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd', fontSize: '14px', fontWeight: currentViewMode === 'settlement' ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>💰 정산 관리</span>
                    {currentViewMode === 'settlement' && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '4px' }}>선택됨</span>}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>캘린더 방 목록</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rooms.map(room => {
                    const isSelected = currentViewMode === 'calendar' && selectedRoomIds.includes(room.id);
                    return (
                      <div key={room.id} onClick={() => { setCurrentViewMode('calendar'); toggleRoomSelection(room.id); }} style={{ padding: '10px 12px', background: isSelected ? '#007bff' : '#fff', color: isSelected ? '#fff' : '#333', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: isSelected ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <button onClick={() => setRoomModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#f1f3f5', color: '#212529', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>방 생성하기 +</button>
            <button onClick={() => setRoomManageModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#343a40', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>방 관리하기 ⚙️</button>
          </div>
        </div>
      </div>

      {/* 2. 중앙 메인 콘텐츠 뷰 */}
      <div style={{ flex: 1, height: '100vh', padding: '20px', paddingBottom: '75px', overflowY: 'hidden', background: currentViewMode === 'chat' ? '#abc1de' : '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 }}>
        
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

                  return (
                    <div key={msg.id || index} style={{ display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start', margin: '2px 0' }}>
                      {!isMyMessage && <div style={{ fontSize: '12px', color: '#333', marginBottom: '2px', marginLeft: '4px', fontWeight: 'bold' }}>{sender.name}</div>}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexDirection: isMyMessage ? 'row-reverse' : 'row' }}>
                        <div style={{ background: isMyMessage ? '#fee102' : '#ffffff', color: '#111', padding: '8px 12px', borderRadius: '12px', maxWidth: '65%', wordBreak: 'break-all', fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: '8px', marginTop: '10px', background: '#fff', padding: '8px', borderRadius: '8px', boxShadow: '0 -1px 4px rgba(0,0,0,0.05)' }}>
              <input type="text" placeholder="메시지를 입력하세요..." value={chatInputText} onChange={e => setChatInputText(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
              <button type="submit" style={{ padding: '10px 18px', background: '#fee102', color: '#3c1e1e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>전송</button>
            </form>
          </div>
        ) : currentViewMode === 'vote' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid #eee', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#222' }}>📊 커뮤니티 투표 목록</h2>
              </div>
              <button onClick={() => setVoteModalOpen(true)} style={{ padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>+ 투표 만들기</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
              {votes.map((vote) => (
                <div key={vote.id} onClick={() => { setSelectedVote(vote); setVoteDetailModalOpen(true); }} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>{vote.title}</div>
                </div>
              ))}
            </div>
          </div>
        ) : currentViewMode === 'settlement' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid #eee', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#222' }}>💰 지출 및 정산 관리</h2>
              <button onClick={() => setSettlementModalOpen(true)} style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>+ 정산 등록하기</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
              {settlements.map((st) => (
                <div key={st.id} onClick={() => { setSelectedSettlement(st); setSettlementDetailModalOpen(true); }} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{st.title} - {Number(st.total_amount).toLocaleString()}원</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          selectedRoomIds.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '18px' }}>{year}년 {month + 1}월</h2>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={prevMonth} style={{ padding: '4px 8px', cursor: 'pointer' }}>&lt;</button>
                    <button onClick={nextMonth} style={{ padding: '4px 8px', cursor: 'pointer' }}>&gt;</button>
                  </div>
                </div>
                <button onClick={() => setEventAddModalOpen(true)} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>+ 일정 추가</button>
              </div>

              {/* 달력 그리드 구조 완성 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#ddd', border: '1px solid #ddd', flex: 1 }}>
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                  <div key={idx} style={{ background: '#f1f3f5', textAlign: 'center', fontWeight: 'bold', padding: '8px 0', fontSize: '13px' }}>{day}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} style={{ background: '#f8f9fa', minHeight: '80px' }} />
                ))}
                {Array.from({ length: lastDateOfMonth }).map((_, index) => {
                  const dayNum = index + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayEvents = events.filter(ev => {
                    if (!selectedRoomIds.includes(ev.room_id)) return false;
                    return dateStr >= ev.event_date && dateStr <= (ev.end_date || ev.event_date);
                  });

                  return (
                    <div 
                      key={dayNum} 
                      onClick={() => { setRightSidebarDateStr(dateStr); setRightSidebarOpen(true); }}
                      style={{ background: '#fff', minHeight: '80px', padding: '4px', boxSizing: 'border-box', overflowY: 'auto', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>{dayNum}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dayEvents.map(ev => (
                          <div 
                            key={ev.id} 
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setEventDetailModalOpen(true); }}
                            style={{ background: ev.color || '#339af0', color: '#fff', fontSize: '11px', padding: '2px 4px', borderRadius: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <h3 style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>하단 메뉴에서 좌측 바를 열어 캘린더에 표시할 방을 선택해주세요.</h3>
          )
        )}
      </div>

      {/* 3. 우측 사이드바 */}
      <div style={{ width: rightSidebarOpen ? '320px' : '0px', minWidth: rightSidebarOpen ? '320px' : '0px', height: '100vh', background: '#f8f9fa', borderLeft: rightSidebarOpen ? '1px solid #ddd' : 'none', overflow: 'hidden', transition: 'width 0.3s ease, min-width 0.3s ease', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ width: '320px', padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>{rightSidebarDateStr ? `${rightSidebarDateStr} 일정` : '일정 목록'}</h3>
            <button onClick={() => setRightSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>✕ 닫기</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rightSidebarEvents.length === 0 ? (
              <div style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>해당 날짜에 등록된 일정이 없습니다.</div>
            ) : (
              rightSidebarEvents.map(ev => (
                <div key={ev.id} onClick={() => { setSelectedEvent(ev); setEventDetailModalOpen(true); }} style={{ padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', borderLeft: `4px solid ${ev.color || '#339af0'}` }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{ev.title}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{ev.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. 하단 네비게이션 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100vw', height: '55px', background: '#343a40', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 40 }}>
        <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📁 방 목록 / 메뉴</button>
        <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📅 우측 일정 목록</button>
      </div>

      {/* ================= 모달 모음 ================= */}

      {/* 방 생성 모달 */}
      {roomModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={createRoom} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>새 캘린더 방 만들기</h3>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>방 이름</label>
              <input type="text" placeholder="예: 친구들 모임, 회사 일정" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>생성</button>
              <button type="button" onClick={() => setRoomModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 일정 추가 모달 */}
      {eventAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={createEvent} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>새 일정 추가</h3>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>방 선택</label>
              <select value={targetRoomIdForAdd || ''} onChange={e => setTargetRoomIdForAdd(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>제목</label>
              <input type="text" placeholder="일정 제목" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>내용</label>
              <textarea placeholder="상세 내용" value={newEventContent} onChange={e => setNewEventContent(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', height: '60px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>시작일</label>
                <input type="date" value={newEventStartDate} onChange={e => setNewEventStartDate(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>종료일</label>
                <input type="date" value={newEventEndDate} onChange={e => setNewEventEndDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>등록</button>
              <button type="button" onClick={() => setEventAddModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 정산 등록 모달 */}
      {settlementModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={createSettlement} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>새 정산 등록</h3>
            <input type="text" placeholder="제목" value={newSettlementTitle} onChange={e => setNewSettlementTitle(e.target.value)} required style={{ padding: '8px' }} />
            <input type="number" placeholder="총 금액" value={newSettlementTotalAmount} onChange={e => setNewSettlementTotalAmount(e.target.value)} required style={{ padding: '8px' }} />
            <input type="file" accept="image/*" onChange={e => { if (e.target.files) setNewSettlementFile(e.target.files[0]); }} />
            <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px' }}>등록하기</button>
            <button type="button" onClick={() => setSettlementModalOpen(false)} style={{ padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px' }}>취소</button>
          </form>
        </div>
      )}

    </div>
  );
}
