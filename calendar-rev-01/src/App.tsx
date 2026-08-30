import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 본인의 Supabase 프로젝트 URL과 Anon Key를 입력해주세요
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export default function CalendarApp() {
  // 상태 관리 (기존에 선언되어 있는 상태들)
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupColor, setSignupColor] = useState('#339af0');
  const [autoLogin, setAutoLogin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [targetRoomIdForAdd, setTargetRoomIdForAdd] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomManageModalOpen, setRoomManageModalOpen] = useState(false);

  // 더미 데이터 및 함수들 (실제 코드에 맞게 연결되어 있다고 가정)
  const rooms: any[] = [];
  const events: any[] = [];
  const profilesMap: Record<string, any> = {};

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

        // Supabase 회원가입 로직
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: signupName,
              color: signupColor,
            }
          }
        });

        if (error) throw error;

        alert('가입 신청 완료. 관리자 승인을 기다려주세요.');
        setIsSignUp(false);

      } else {
        // Supabase 로그인 로직
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // 로그인 성공 시 세션은 Supabase의 onAuthStateChange 등에서 자동으로 감지되거나 처리됩니다.
      }
    } catch (error: any) {
      alert(error.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setSession(null);
    setProfile(null);
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
    if (window.innerWidth <= 768) setLeftSidebarOpen(false);
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
          <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          
          {isSignUp && (
            <>
              <input type="text" placeholder="본인 이름 (닉네임)" value={signupName} onChange={e => setSignupName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <span>내 색상 선택:</span>
                <input type="color" value={signupColor} onChange={e => setSignupColor(e.target.value)} style={{ width: '40px', height: '35px', border: 'none', cursor: 'pointer', background: 'none' }} />
              </div>
            </>
          )}

          {!isSignUp && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)} />
              자동 로그인 유지
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* 모바일 백드롭 */}
      {((leftSidebarOpen || rightSidebarOpen)) && (
        <div 
          onClick={() => { setLeftSidebarOpen(false); setRightSidebarOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 20 }}
        />
      )}

      {/* 1. 좌측 바 */}
      <div style={{ 
        position: 'relative',
        zIndex: 30,
        height: '100vh',
        width: leftSidebarOpen ? '260px' : '0px', 
        transition: 'width 0.3s', 
        background: '#f8f9fa', 
        borderRight: '1px solid #ddd', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        display: 'flex', 
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div style={{ padding: '20px', width: '260px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '15px', lineHeight: '1.2', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#555' }}>씩씩이들의</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>공유캘린더</div>
            </div>
            
            {/* 프로필 카드 */}
            <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', margin: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: profile?.color || '#339af0', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.name}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.email}
              </div>
            </div>

            {/* 친구 초대 링크 복사 */}
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
                style={{ 
                  width: '100%', background: '#007bff', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
              >
                🔗 초대 링크 복사하기
              </button>
            </div>

            {/* 로그아웃 */}
            <button onClick={handleLogout} style={{ width: '100%', margin: '5px 0 10px 0', padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>로그아웃</button>
            
            {profile?.role === 'admin' && (
              <button 
                onClick={() => setAdminModalOpen(true)} 
                style={{ width: '100%', marginBottom: '15px', padding: '8px 12px', background: '#343a40', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ⚙️ 멤버 관리 (관리자)
              </button>
            )}

            {/* 방 목록 */}
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

          {/* 하단 방 관리 */}
          <div style={{ paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setRoomModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#f1f3f5', color: '#212529', border: '1px solid #ced4da', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>방 생성하기 +</button>
            <button onClick={() => setRoomManageModalOpen(true)} style={{ width: '100%', padding: '10px', background: '#343a40', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>방 관리하기 ⚙️</button>
          </div>

        </div>
      </div>

      {/* 2. 중앙 메인: 달력 그리드 뷰 */}
      <div style={{ flex: 1, padding: '70px 20px 20px 20px', overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', minWidth: 0 }}>
        {selectedRoomIds.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2>
              통합 캘린더 보기 
              <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
                ({selectedRoomIds.map(id => rooms.find(r => r.id === id)?.name).filter(Boolean).join(', ')})
              </span>
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
              <button onClick={prevMonth} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>&lt; 이전 달</button>
              <h3>{year}년 {month + 1}월</h3>
              <button onClick={nextMonth} style={{ padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>다음 달 &gt;</button>
            </div>

            {/* 달력 그리드 컨테이너 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#ddd', border: '1px solid #ddd', flex: 1, minHeight: '500px' }}>
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                <div key={idx} style={{ background: '#f1f3f5', textAlign: 'center', fontWeight: 'bold', padding: '8px 0', fontSize: '13px' }}>
                  {day}
                </div>
              ))}

              {/* 이전 달 남은 날짜 채우기 */}
              {(() => {
                const prevMonthLastDate = new Date(year, month, 0).getDate();
                return Array.from({ length: firstDayOfMonth }).map((_, idx) => {
                  const dayNum = prevMonthLastDate - firstDayOfMonth + idx + 1;
                  return (
                    <div key={`prev-${idx}`} style={{ background: '#f8f9fa', minHeight: '100px', padding: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#adb5bd', fontWeight: 'bold' }}>{dayNum}</span>
                    </div>
                  );
                });
              })()}

              {/* 이번 달 날짜 렌더링 */}
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
                    onClick={() => setRightSidebarOpen(true)}
                    style={{ background: '#fff', minHeight: '100px', padding: '5px', overflowY: 'auto', border: '1px solid #eee', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>{dayNum}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
                      {dayEvents.map(ev => {
                        const authorColor = profilesMap[ev.user_id]?.color || '#339af0';
                        const start = ev.event_date;
                        const isStartDay = formattedDate === start;

                        return (
                          <div 
                            key={ev.id} 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedEvent(ev); 
                              setRightSidebarOpen(true); 
                            }}
                            style={{ background: authorColor, color: '#fff', padding: '2px 4px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            {isStartDay || formattedDate.endsWith('-01') ? ev.title : '\u00A0'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* 다음 달 빈 칸 채우기 */}
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
          <h3 style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>좌측 메뉴에서 캘린더에 표시할 방을 하나 이상 선택해주세요.</h3>
        )}
      </div>

      {/* 3. 우측 사이드바 토글 버튼 (우측 상단 고정) */}
      <button 
        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        style={{ 
          position: 'absolute', 
          right: rightSidebarOpen ? '335px' : '15px', 
          top: '15px', 
          zIndex: 35, 
          background: '#343a40', 
          color: '#fff', 
          border: 'none', 
          padding: '8px 12px', 
          cursor: 'pointer', 
          borderRadius: '4px', 
          transition: 'right 0.3s',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {rightSidebarOpen ? '상세 닫기 ▲' : '상세/댓글 ▶'}
      </button>

      {/* 4. 우측 상세 패널 (오른쪽 끝에 고정형으로 배치) */}
      <div style={{
        position: 'relative',
        zIndex: 30,
        height: '100vh',
        width: rightSidebarOpen ? '320px' : '0px',
        transition: 'width 0.3s',
        background: '#f8f9fa',
        borderLeft: rightSidebarOpen ? '1px solid #ddd' : 'none',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        {/* 우측 패널 내부 콘텐츠 영역 */}
        <div style={{ padding: '20px', width: '320px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ marginTop: '0', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>일정 상세 / 댓글</h3>
          
          <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px' }}>
            {selectedEvent ? (
              <div>
                <p><strong>제목:</strong> {selectedEvent.title}</p>
                <p><strong>기간:</strong> {selectedEvent.event_date} {selectedEvent.end_date ? `~ ${selectedEvent.end_date}` : ''}</p>
                {/* 상세 내용 및 댓글 컴포넌트가 들어가는 자리 */}
              </div>
            ) : (
              <div>
                <p style={{ color: '#666', fontSize: '13px' }}>
                  달력에서 일정을 클릭하거나 날짜를 선택하여 상세 내용을 확인하고 댓글을 남겨보세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}