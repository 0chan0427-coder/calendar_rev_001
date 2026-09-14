import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LoginScreen, PendingApprovalScreen } from '../components/auth/AuthScreens';
import CalendarGrid from '../components/calendar/CalendarGrid';
import ChatView from '../components/chat/ChatView';
import { PRESET_COLORS, DEFAULT_COLOR_LABELS } from '../constants/calendar';
import { getSession, signIn, signUp, signOut, onAuthStateChange } from '../services/auth';
import { listRooms, createRoom as createRoomRecord, updateRoom, deleteRoom as deleteRoomRecord, updateRoomSortOrder, listRoomMembers } from '../services/rooms';
import { listEvents, createEvent as createEventRecord, updateEvent as updateEventRecord, deleteEvent as deleteEventRecord, listComments, createComment } from '../services/events';
import { listMessages, createMessage, subscribeToMessages, removeMessageChannel } from '../services/chat';
import { listVotes, getVoteDetails, createVote as createVoteRecord, createVoteOptions, replaceUserVote, updateVoteStatus, deleteVote as deleteVoteRecord } from '../services/votes';
import { listSettlements, getSettlementItems, createSettlement as createSettlementRecord, createSettlementItems, updateSettlementItemPaid, deleteSettlement as deleteSettlementRecord } from '../services/settlements';
import { getProfile, getProfiles, getPendingProfiles, updateOwnNameRequest, updateProfileColor, approveUser as approveUserRecord, approveNameChange as approveNameChangeRecord, rejectNameChange as rejectNameChangeRecord } from '../services/profiles';
import { ensureWorldProfile, recordWorldActivity } from '../services/world';

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

  // 검색/필터 상태
  const [eventSearchText, setEventSearchText] = useState('');
  const [voteSearchText, setVoteSearchText] = useState('');
  const [voteStatusFilter, setVoteStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [settlementSearchText, setSettlementSearchText] = useState('');

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
  const [settlementMembers, setSettlementMembers] = useState<{ user_id: string }[]>([]);
  const [selectedSettlementParticipantIds, setSelectedSettlementParticipantIds] = useState<string[]>([]);
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
    getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        ensureWorldProfile(session.user.id).catch(() => {});
        recordWorldActivity(session.user.id, 'attendance').catch(() => {});
      }
    });

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        ensureWorldProfile(session.user.id).catch(() => {});
        recordWorldActivity(session.user.id, 'attendance').catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const roomId = new URLSearchParams(window.location.search).get('room');
    if (roomId && rooms.some(room => room.id === roomId)) {
      setSelectedRoomIds([roomId]);
      setTargetRoomIdForAdd(roomId);
      setTargetRoomIdForSettlement(roomId);
    }
  }, [rooms]);

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

      const channel = subscribeToMessages((message) => {
        if (selectedRoomIds.length === 0 || selectedRoomIds.includes(message.room_id)) {
          setChatMessages((prev) => prev.some(item => item.id === message.id) ? prev : [...prev, message]);
        }
      });

      return () => {
        removeMessageChannel(channel);
      };
    }
  }, [currentViewMode, selectedRoomIds]);

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
      const { data, error } = await getProfile(userId);
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('프로필 조회 실패:', err);
    }
  };

  const fetchVotes = async () => {
    const { data, error } = await listVotes(selectedRoomIds);
    if (!error && data) {
      // 마감일이 지난 투표는 목록을 새로 불러올 때 자동으로 마감 처리합니다.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const normalizedVotes = data.map((vote: any) => {
        if (vote.status === 'active' && vote.end_date) {
          const end = new Date(`${vote.end_date}T23:59:59`);
          if (end < today) return { ...vote, status: 'closed' };
        }
        return vote;
      });
      setVotes(normalizedVotes);

      const expired = data.filter((vote: any) => {
        if (vote.status !== 'active' || !vote.end_date) return false;
        return new Date(`${vote.end_date}T23:59:59`) < today;
      });
      if (expired.length) {
        await Promise.all(expired.map((vote: any) => updateVoteStatus(vote.id, 'closed')));
      }
    }
  };

  const fetchVoteDetails = async (voteId: string) => {
    const [{ data: options }, { data: records }] = await getVoteDetails(voteId);
    if (options) setVoteOptionsList(options);
    if (records) setVoteRecordsList(records);
  };

  const fetchSettlements = async () => {
    if (selectedRoomIds.length === 0) {
      setSettlements([]);
      return;
    }
    const { data, error } = await listSettlements(selectedRoomIds);
    if (!error && data) {
      setSettlements(data);
    }
  };

  const fetchSettlementDetails = async (settlementId: string) => {
    const { data, error } = await getSettlementItems(settlementId);
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

  const openSettlementModal = async () => {
    const roomId = targetRoomIdForSettlement || selectedRoomIds[0] || null;
    if (!roomId) {
      alert('정산을 만들 방을 먼저 선택해주세요.');
      return;
    }

    setTargetRoomIdForSettlement(roomId);

    const { data, error } = await listRoomMembers(roomId);
    if (error) {
      alert('정산 참여자 목록을 불러오지 못했습니다: ' + error.message);
      return;
    }

    const members = (data || []).filter((row: any) => row.user_id);
    setSettlementMembers(members);

    // 새 정산은 실수로 앱 전체 회원이 자동 포함되지 않도록
    // 작성자만 기본 선택하고, 실제 참여자는 직접 선택합니다.
    setSelectedSettlementParticipantIds(
      members.some((row: any) => row.user_id === session.user.id)
        ? [session.user.id]
        : []
    );

    setSettlementModalOpen(true);
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

    const { data: settlementData, error: settlementError } = await createSettlementRecord({
      room_id: targetRoomIdForSettlement,
      user_id: session.user.id,
      title: newSettlementTitle.trim(),
      total_amount: totalAmount
    });

    if (settlementError || !settlementData) {
      alert('정산 생성 실패: ' + (settlementError?.message || '알 수 없는 오류'));
      return;
    }

    const memberIds = selectedSettlementParticipantIds.filter((uid, index, arr) => arr.indexOf(uid) === index);
    if (memberIds.length === 0) {
      alert('정산에 참여할 사람을 한 명 이상 선택해주세요.');
      return;
    }

    // 원 단위 정산을 기본으로 하되, 나눠떨어지지 않는 금액은 첫 번째 참여자에게
    // 남는 금액을 더해 총액과 정확히 일치하도록 합니다.
    const totalCents = Math.round(totalAmount * 100);
    const baseCents = Math.floor(totalCents / memberIds.length);
    const remainderCents = totalCents - (baseCents * memberIds.length);

    const itemsToInsert = memberIds.map((uid, index) => ({
      settlement_id: settlementData.id,
      user_id: uid,
      amount: (baseCents + (index === 0 ? remainderCents : 0)) / 100,
      is_paid: uid === session.user.id
    }));

    const { error: itemError } = await createSettlementItems(itemsToInsert);
    if (itemError) {
      alert('정산 참여자 등록 실패: ' + itemError.message);
      return;
    }

    alert('정산이 생성되었습니다!');
    setNewSettlementTitle('');
    setSettlementRows([{ desc: '', amount: '' }]);
    setSelectedSettlementParticipantIds([]);
    setSettlementMembers([]);
    setSettlementModalOpen(false);
    fetchSettlements();
  };

  const toggleItemPaid = async (itemId: string, currentPaid: boolean) => {
    const { error } = await updateSettlementItemPaid(itemId, !currentPaid);
    if (!error && selectedSettlement) {
      fetchSettlementDetails(selectedSettlement.id);
    }
  };

  const deleteSettlement = async (settlementId: string) => {
    if (!confirm('정말 이 정산을 삭제하시겠습니까?')) return;
    const { error } = await deleteSettlementRecord(settlementId);
    if (!error) {
      alert('정산이 삭제되었습니다.');
      setSettlementDetailModalOpen(false);
      setSelectedSettlement(null);
      fetchSettlements();
    }
  };

  const createVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomIds[0]) {
      alert('투표를 만들 방을 먼저 선택해주세요.');
      return;
    }
    if (!newVoteTitle.trim()) {
      alert('투표 제목을 입력해주세요.');
      return;
    }
    const validOptions = newVoteOptions.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('투표 항목은 최소 2개 이상 입력해야 합니다.');
      return;
    }

    const { data: voteData, error: voteError } = await createVoteRecord({
      room_id: selectedRoomIds[0] || null,
      title: newVoteTitle.trim(),
      user_id: session.user.id,
      end_date: newVoteEndDate || null,
      status: 'active',
      is_multiple: newVoteIsMultiple,
      is_anonymous: newVoteIsAnonymous
    });

    if (voteError || !voteData) {
      alert('투표 생성 실패: ' + (voteError?.message || '알 수 없는 오류'));
      return;
    }

    const optionInserts = validOptions.map(opt => ({
      vote_id: voteData.id,
      content: opt.trim()
    }));

    const { error: optionError } = await createVoteOptions(optionInserts);
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

    const { error } = await replaceUserVote(selectedVote.id, session.user.id, selectedOptionIds);

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
    const { error } = await updateVoteStatus(voteId, nextStatus);
    if (!error) {
      fetchVotes();
      if (selectedVote && selectedVote.id === voteId) {
        setSelectedVote({ ...selectedVote, status: nextStatus });
      }
    }
  };

  const deleteVote = async (voteId: string) => {
    if (!confirm('정말 이 투표를 삭제하시겠습니까?')) return;
    const { error } = await deleteVoteRecord(voteId);
    if (!error) {
      alert('투표가 삭제되었습니다.');
      setVoteDetailModalOpen(false);
      setSelectedVote(null);
      fetchVotes();
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await listMessages(selectedRoomIds);
    if (!error && data) {
      setChatMessages(data);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const roomId = selectedRoomIds[0];
    if (!roomId) return;
    const { error } = await createMessage(roomId, session.user.id, chatInputText.trim());
    if (!error) { recordWorldActivity(session.user.id, 'chat').catch(() => {}); }

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

    const { error } = await updateOwnNameRequest(session.user.id, newNameRequestText.trim());

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
    const { data, error } = await listRooms();
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

    const { error } = await updateRoom(roomId, editRoomNameText.trim());

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
      return updateRoomSortOrder(room.id, idx);
    });

    await Promise.all(updates);
    setRooms([...newRooms]);
  };
  
  const fetchEvents = async () => {
    const { data, error } = await listEvents(selectedRoomIds);
    if (!error && data) setEvents(data);
  };

  const fetchProfilesMap = async () => {
    const { data, error } = await getProfiles();
    if (!error && data) {
      const map: Record<string, any> = {};
      data.forEach(p => { map[p.id] = p; });
      setProfilesMap(map);
    }
  };

  const fetchPendingProfiles = async () => {
    const { data, error } = await getPendingProfiles();
    if (!error && data) setPendingProfiles(data);
  };

  const fetchAllProfiles = async () => {
    const { data, error } = await getProfiles();
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

    const { error } = await updateProfileColor(userId, newColor);

    if (error) {
      alert('멤버 색상 변경 실패: ' + error.message);
    } else {
      alert('멤버의 프로필 색상이 변경되었습니다.');
      fetchAllProfiles();
      fetchProfilesMap();
    }
  };

  const fetchComments = async (eventId: string) => {
    const { data, error } = await listComments(eventId);
    if (!error && data) setComments(data);
  };

  const approveNameChange = async (userId: string, requestedName: string) => {
    const { error } = await approveNameChangeRecord(userId, requestedName);

    if (error) {
      alert('승인 실패: ' + error.message);
    } else {
      alert('이름 변경이 승인되었습니다.');
      fetchAllProfiles();
      fetchProfilesMap();
    }
  };

  const rejectNameChange = async (userId: string) => {
    const { error } = await rejectNameChangeRecord(userId);

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
        const { error } = await signUp(email, password, signupName, signupColor);
        if (error) throw error;
        alert('가입 신청 완료. 관리자 승인을 기다려주세요.');
        setIsSignUp(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setProfile(null);
  };

  const approveUser = async (userId: string) => {
    const { error } = await approveUserRecord(userId);
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
    const { error } = await createRoomRecord(newRoomName);
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
    const { error } = await deleteRoomRecord(roomId);
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

    const { error } = await createEventRecord({
      room_id: targetRoomIdForAdd,
      user_id: session.user.id,
      title: newEventTitle,
      content: newEventContent,
      event_date: newEventStartDate,
      end_date: newEventEndDate || newEventStartDate,
      color: finalColor
    });

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

    const { error } = await updateEventRecord(selectedEvent.id, {
      title: editEventTitle,
      content: editEventContent,
      event_date: editEventStartDate,
      end_date: editEventEndDate || editEventStartDate,
      color: editEventColor
    });

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
    const { error } = await deleteEventRecord(eventId);
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
    const { error } = await createComment(selectedEvent.id, session.user.id, newCommentText);
    if (error) {
      alert('댓글 등록 실패: ' + error.message);
    } else {
      setNewCommentText('');
      fetchComments(selectedEvent.id);
    }
  };

  const filteredEvents = useMemo(() => {
    const keyword = eventSearchText.trim().toLowerCase();
    if (!keyword) return events;
    return events.filter((event: any) =>
      String(event.title || '').toLowerCase().includes(keyword) ||
      String(event.content || '').toLowerCase().includes(keyword)
    );
  }, [events, eventSearchText]);

  const filteredVotes = useMemo(() => {
    const keyword = voteSearchText.trim().toLowerCase();
    return votes.filter((vote: any) => {
      const matchesKeyword = !keyword || String(vote.title || '').toLowerCase().includes(keyword);
      const matchesStatus = voteStatusFilter === 'all' || vote.status === voteStatusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [votes, voteSearchText, voteStatusFilter]);

  const filteredSettlements = useMemo(() => {
    const keyword = settlementSearchText.trim().toLowerCase();
    if (!keyword) return settlements;
    return settlements.filter((item: any) =>
      String(item.title || '').toLowerCase().includes(keyword)
    );
  }, [settlements, settlementSearchText]);

  useEffect(() => {
    if (rightSidebarOpen && rightSidebarDateStr) {
      const updatedEvents = filteredEvents.filter((ev: any) => {
        if (!selectedRoomIds.includes(ev.room_id)) return false;
        return rightSidebarDateStr >= ev.event_date && rightSidebarDateStr <= (ev.end_date || ev.event_date);
      });
      setRightSidebarEvents(updatedEvents);
    }
  }, [filteredEvents, selectedRoomIds, rightSidebarOpen, rightSidebarDateStr]);

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
      <LoginScreen
        isSignUp={isSignUp}
        email={email}
        password={password}
        signupName={signupName}
        signupColor={signupColor}
        autoLogin={autoLogin}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSignupNameChange={setSignupName}
        onSignupColorChange={setSignupColor}
        onAutoLoginChange={handleAutoLoginChange}
        onSubmit={handleAuth}
        onToggleMode={() => setIsSignUp(!isSignUp)}
      />
    );
  }

  if (profile && profile.status === 'pending') {
    return <PendingApprovalScreen onLogout={handleLogout} />;
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
                  const roomId = selectedRoomIds[0];
                  const inviteUrl = roomId ? `${window.location.origin}${window.location.pathname}?room=${roomId}` : window.location.href;
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

            <button
              onClick={() => { window.location.href = `${window.location.pathname}?world=1`; }}
              style={{ width: '100%', marginBottom: '5px', padding: '11px 12px', background: '#8d70bd', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              🌐 씩씩이 월드
            </button>

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
          <ChatView
            chatMessages={chatMessages}
            session={session}
            profilesMap={profilesMap}
            chatScrollRef={chatScrollRef}
            chatInputText={chatInputText}
            onChatInputChange={setChatInputText}
            onSendMessage={sendChatMessage}
          />
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

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input
                value={voteSearchText}
                onChange={e => setVoteSearchText(e.target.value)}
                placeholder="🔎 투표 제목 검색"
                style={{ flex: 1, minWidth: '180px', padding: '9px 11px', border: '1px solid #ced4da', borderRadius: '6px', boxSizing: 'border-box' }}
              />
              <select
                value={voteStatusFilter}
                onChange={e => setVoteStatusFilter(e.target.value as 'all' | 'active' | 'closed')}
                style={{ padding: '9px 10px', border: '1px solid #ced4da', borderRadius: '6px', background: '#fff' }}
              >
                <option value="all">전체 상태</option>
                <option value="active">진행 중</option>
                <option value="closed">마감됨</option>
              </select>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
              {filteredVotes.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>등록된 투표가 없습니다. 상단의 '투표 만들기'를 눌러 시작해보세요!</div>
              ) : (
                filteredVotes.map((vote) => {
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
                onClick={openSettlementModal}
                style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                + 정산 등록하기
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <input
                value={settlementSearchText}
                onChange={e => setSettlementSearchText(e.target.value)}
                placeholder="🔎 정산 제목 검색"
                style={{ width: '100%', padding: '9px 11px', border: '1px solid #ced4da', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
              {filteredSettlements.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>등록된 정산 내역이 없습니다. 우측 상단의 '정산 등록하기'를 눌러 시작해보세요!</div>
              ) : (
                filteredSettlements.map((st) => {
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

              <div style={{ margin: '4px 0 8px' }}>
                <input
                  value={eventSearchText}
                  onChange={e => setEventSearchText(e.target.value)}
                  placeholder="🔎 일정 제목/내용 검색 (비우면 전체 일정)"
                  style={{ width: '100%', padding: '9px 11px', border: '1px solid #ced4da', borderRadius: '6px', boxSizing: 'border-box' }}
                />
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
              
              <CalendarGrid
                year={year}
                month={month}
                firstDayOfMonth={firstDayOfMonth}
                lastDateOfMonth={lastDateOfMonth}
                totalWeeks={totalWeeks}
                events={filteredEvents}
                selectedRoomIds={selectedRoomIds}
                profilesMap={profilesMap}
                getRoomOrderIndex={getRoomOrderIndex}
                onDateClick={(formattedDate, dayEvents) => {
                  setRightSidebarDateStr(formattedDate);
                  setRightSidebarEvents(dayEvents);
                  setRightSidebarOpen(true);
                  if (selectedRoomIds.length > 0) setTargetRoomIdForAdd(selectedRoomIds[0]);
                }}
              />
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

            {/* 정산 참여자 선택 */}
            <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block' }}>정산 참여자</label>
                  <span style={{ fontSize: '11px', color: '#666' }}>
                    선택한 사람에게만 총 금액이 균등하게 분담됩니다.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedSettlementParticipantIds(settlementMembers.map(m => m.user_id))}
                    style={{ padding: '4px 7px', border: '1px solid #ced4da', background: '#fff', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    전체 선택
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSettlementParticipantIds([session.user.id].filter(id => settlementMembers.some(m => m.user_id === id)))}
                    style={{ padding: '4px 7px', border: '1px solid #ced4da', background: '#fff', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    나만 선택
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {settlementMembers.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#888', padding: '8px 0' }}>
                    이 방에 참여할 수 있는 회원이 없습니다.
                  </div>
                ) : (
                  settlementMembers.map(member => {
                    const memberProfile = profilesMap[member.user_id] || { name: '알 수 없음', color: '#339af0' };
                    const checked = selectedSettlementParticipantIds.includes(member.user_id);
                    return (
                      <label
                        key={member.user_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          background: checked ? '#e7f5ff' : '#fff',
                          border: checked ? '1px solid #74c0fc' : '1px solid #e9ecef',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            setSelectedSettlementParticipantIds(prev =>
                              e.target.checked
                                ? [...prev, member.user_id]
                                : prev.filter(id => id !== member.user_id)
                            );
                          }}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: memberProfile.color || '#339af0' }} />
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                          {memberProfile.name || '알 수 없음'}
                          {member.user_id === session.user.id ? ' (나)' : ''}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>
                선택 인원: {selectedSettlementParticipantIds.length}명
                {selectedSettlementParticipantIds.length > 0 && calculateTotalAmount() > 0
                  ? ` · 1인 약 ${Math.floor(calculateTotalAmount() / selectedSettlementParticipantIds.length).toLocaleString()}원`
                  : ''}
              </div>
            </div>

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
