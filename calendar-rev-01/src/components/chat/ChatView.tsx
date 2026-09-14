import React from 'react';

type ChatMessage = {
  id?: string;
  user_id: string;
  content: string;
  created_at: string;
};

type ChatProfile = {
  name?: string;
  color?: string;
};

interface ChatViewProps {
  chatMessages: ChatMessage[];
  session: any;
  profilesMap: Record<string, ChatProfile>;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  chatInputText: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function ChatView({
  chatMessages,
  session,
  profilesMap,
  chatScrollRef,
  chatInputText,
  onChatInputChange,
  onSendMessage,
}: ChatViewProps) {
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

  <form onSubmit={onSendMessage} style={{ display: 'flex', gap: '8px', marginTop: '10px', background: '#fff', padding: '8px', borderRadius: '8px', boxShadow: '0 -1px 4px rgba(0,0,0,0.05)' }}>
    <input 
      type="text" 
      placeholder="메시지를 입력하세요..." 
      value={chatInputText} 
      onChange={e => onChatInputChange(e.target.value)} 
      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} 
    />
    <button type="submit" style={{ padding: '10px 18px', background: '#fee102', color: '#3c1e1e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>전송</button>
  </form>
</div>
}
