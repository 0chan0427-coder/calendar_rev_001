import React from 'react';

interface CalendarGridProps {
  year: number;
  month: number;
  firstDayOfMonth: number;
  lastDateOfMonth: number;
  totalWeeks: number;
  events: any[];
  selectedRoomIds: string[];
  profilesMap: Record<string, any>;
  getRoomOrderIndex: (roomId: string) => number;
  onDateClick: (date: string, dayEvents: any[]) => void;
}

export default function CalendarGrid({
  year,
  month,
  firstDayOfMonth,
  lastDateOfMonth,
  totalWeeks,
  events,
  selectedRoomIds,
  profilesMap,
  getRoomOrderIndex,
  onDateClick,
}: CalendarGridProps) {
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  const totalCellsSoFar = firstDayOfMonth + lastDateOfMonth;
  const totalGridCells = totalCellsSoFar <= 35 ? 35 : 42;
  const nextMonthDaysCount = totalGridCells - totalCellsSoFar;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `auto repeat(${totalWeeks}, 1fr)`, gap: '1px', background: '#ddd', border: '1px solid #ddd', flex: 1, minHeight: 0 }}>
      {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
        <div key={idx} style={{ background: '#f1f3f5', textAlign: 'center', fontWeight: 'bold', padding: '8px 0', fontSize: '13px' }}>
          {day}
        </div>
      ))}

      {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
        const dayNum = prevMonthLastDate - firstDayOfMonth + idx + 1;
        return (
          <div key={`prev-${idx}`} style={{ background: '#f8f9fa', minHeight: '0', padding: '6px' }}>
            <span style={{ fontSize: '12px', color: '#adb5bd', fontWeight: 'bold' }}>{dayNum}</span>
          </div>
        );
      })}

      {Array.from({ length: lastDateOfMonth }).map((_, idx) => {
        const dayNum = idx + 1;
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        const dayEvents = events
          .filter(ev => {
            if (!selectedRoomIds.includes(ev.room_id)) return false;
            const start = ev.event_date;
            const end = ev.end_date || ev.event_date;
            return formattedDate >= start && formattedDate <= end;
          })
          .sort((a, b) => getRoomOrderIndex(a.room_id) - getRoomOrderIndex(b.room_id));

        return (
          <div
            key={`day-${dayNum}`}
            onClick={(e) => {
              e.stopPropagation();
              onDateClick(formattedDate, dayEvents);
            }}
            style={{
              background: '#fff', minHeight: '0', padding: '5px 0', overflowY: 'auto',
              border: '1px solid #eee', display: 'flex', flexDirection: 'column', cursor: 'pointer',
              userSelect: 'none', WebkitUserSelect: 'none'
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
                      background: eventColor, color: '#fff', padding: '3px 6px', fontSize: '11px',
                      fontWeight: 'bold', cursor: 'pointer', wordBreak: 'keep-all',
                      marginLeft: isStart ? '4px' : '-2px', marginRight: isEnd ? '4px' : '-2px',
                      borderTopLeftRadius: isStart ? '4px' : '0px', borderBottomLeftRadius: isStart ? '4px' : '0px',
                      borderTopRightRadius: isEnd ? '4px' : '0px', borderBottomRightRadius: isEnd ? '4px' : '0px',
                      zIndex: 2, position: 'relative', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
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

      {Array.from({ length: nextMonthDaysCount }).map((_, idx) => {
        const dayNum = idx + 1;
        return (
          <div key={`next-${idx}`} style={{ background: '#f8f9fa', minHeight: '100px', padding: '6px' }}>
            <span style={{ fontSize: '12px', color: '#adb5bd', fontWeight: 'bold' }}>{dayNum}</span>
          </div>
        );
      })}
    </div>
  );
}
