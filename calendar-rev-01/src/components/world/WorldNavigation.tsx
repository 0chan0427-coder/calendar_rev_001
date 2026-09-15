import type { WorldView } from '../../types/world';

export default function WorldNavigation({ view, onChange, onCalendar }: { view: WorldView; onChange: (v: WorldView) => void; onCalendar: () => void; isAdmin?: boolean }) {
  const items: [WorldView,string][] = [
    ['home','미니홈피'],
    ['friends','1촌 / 친구'],
    ['plaza','광장'],
    ['shop','포인트샵'],
    ['ranking','주간랭킹'],
    ['guestbook','방명록'],
  ];
  return <nav className="world-nav cyworld-side-nav" aria-label="월드 메뉴">
    {items.map(([key,label]) => <button key={key} className={view===key?'active':''} onClick={()=>onChange(key)}>{label}</button>)}
    <button onClick={onCalendar}>공유캘린더</button>
    <button onClick={()=>alert('자유채팅은 공유캘린더의 자유 채팅방에서 이용할 수 있어요.')}>자유채팅</button>
  </nav>;
}
