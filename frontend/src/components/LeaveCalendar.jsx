import React, { useState } from 'react';

function LeaveCalendar({ data, onLeaveClick }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const getLeaveForDay = (day) => {
    if (!day || !Array.isArray(data)) return null;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.find(l => {
      try {
        const start = new Date(l.start_date).toISOString().split('T')[0];
        const end = new Date(l.end_date).toISOString().split('T')[0];
        return dateStr >= start && dateStr <= end && l.status === 'approved';
      } catch { return false; }
    });
  };

  const isToday = (day) => day && viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

  return (
    <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>{monthNames[viewMonth]} {viewYear}</h4>
        <div>
          <button onClick={prevMonth} style={{ padding: '4px 10px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>&lt;</button>
          <button onClick={nextMonth} style={{ padding: '4px 10px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }}>&gt;</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: '600', fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={{ padding: '4px' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {calendarDays.map((day, idx) => {
          const leave = getLeaveForDay(day);
          const todayCell = isToday(day);
          return (
            <div 
              key={idx} 
              onClick={() => leave && onLeaveClick && onLeaveClick(leave)}
              title={leave ? `${leave.subject}` : ''} 
              style={{
                height: '38px',
                border: todayCell ? '2px solid var(--primary-blue)' : '1px solid #eee',
                borderRadius: '4px',
                backgroundColor: leave ? 'var(--primary-blue)' : 'white',
                color: leave ? 'white' : todayCell ? 'var(--primary-blue)' : 'black',
                fontSize: '0.8rem',
                fontWeight: todayCell ? 'bold' : 'normal',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: leave ? 'pointer' : 'default',
                transition: 'all 0.2s',
                overflow: 'hidden'
              }}
            >
              {day}
              {leave && <div style={{ fontSize: '0.4rem', width: '90%', overflow: 'hidden', textAlign: 'center', whiteSpace: 'nowrap' }}>{leave.subject}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#888' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--primary-blue)', display: 'inline-block', borderRadius: '2px' }}></span> Approved
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '12px', border: '2px solid var(--primary-blue)', display: 'inline-block', borderRadius: '2px' }}></span> Today
        </span>
      </div>
    </div>
  );
}

export default LeaveCalendar;
