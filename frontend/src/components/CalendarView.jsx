import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Trash2
} from 'lucide-react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const CalendarView = ({ events = [], onAddEvent, onDeleteEvent }) => {
  const todayObj = new Date();
  
  // Track which month/year is displayed (default to current)
  const [displayYear, setDisplayYear] = useState(todayObj.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(todayObj.getMonth()); // 0-indexed

  const [activeTab, setActiveTab] = useState('Month');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDay, setNewEventDay] = useState(todayObj.getDate());
  const [newEventColor, setNewEventColor] = useState('purple');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Navigation
  const goToPrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(y => y - 1);
    } else {
      setDisplayMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(y => y + 1);
    } else {
      setDisplayMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setDisplayMonth(todayObj.getMonth());
    setDisplayYear(todayObj.getFullYear());
  };

  // Compute days in displayed month
  const daysInDisplayedMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  // What day-of-week does the 1st fall on? (0=Sun)
  const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay();
  // Previous month fill
  const prevMonthDays = new Date(displayYear, displayMonth, 0).getDate();
  const prevMonthPad = Array.from({ length: firstDayOfWeek }, (_, i) => prevMonthDays - firstDayOfWeek + i + 1);
  // Current month days
  const currentDays = Array.from({ length: daysInDisplayedMonth }, (_, i) => i + 1);
  // Next month fill (to complete 6 rows = 42 cells total)
  const totalCells = 42;
  const usedCells = prevMonthPad.length + currentDays.length;
  const nextMonthPad = Array.from({ length: totalCells - usedCells }, (_, i) => i + 1);

  // Is the display month the current real month?
  const isCurrentMonth = displayMonth === todayObj.getMonth() && displayYear === todayObj.getFullYear();
  const todayDate = todayObj.getDate();

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    try {
      await onAddEvent({
        title: newEventTitle,
        day: parseInt(newEventDay, 10),
        month: displayMonth + 1, // store 1-indexed
        year: displayYear,
        type: newEventColor
      });
      setNewEventTitle('');
      setShowAddEventModal(false);
    } catch (err) {
      alert('Failed to save event: ' + err.message);
    }
  };

  // Match events that belong to displayed month/year, OR events without month/year stored (legacy)
  const getEventsForDay = (day) => {
    return events.filter(e => {
      if (e.day !== day) return false;
      // If event has month/year, check them; otherwise show in current displayed view
      if (e.month != null && e.year != null) {
        return e.month === displayMonth + 1 && e.year === displayYear;
      }
      return true; // legacy events without month/year shown in current view
    });
  };

  // Today's schedule (events on today's date in real month)
  const todayScheduleItems = events.filter(e => {
    if (!isCurrentMonth) return false;
    if (e.day !== todayDate) return false;
    if (e.month != null && e.year != null) {
      return e.month === displayMonth + 1 && e.year === displayYear;
    }
    return true;
  });

  const monthLabel = `${MONTH_NAMES[displayMonth]} ${displayYear}`;

  // Format today label for sidebar
  const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const todayLabel = `${weekDays[todayObj.getDay()]}, ${MONTH_NAMES[todayObj.getMonth()].slice(0,3)} ${String(todayObj.getDate()).padStart(2,'0')}, ${todayObj.getFullYear()}`;

  return (
    <div>
      {/* Header section */}
      <div className="greeting-row">
        <div className="greeting-text">
          <h2>Calendar</h2>
          <p>View your schedule and manage your meetings.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={goToToday} style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}>
            Today
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddEventModal(true)}>
            <Plus size={16} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      <div className="calendar-layout-grid">
        {/* Left Side: Monthly Grid */}
        <div className="calendar-table-card">
          <div className="calendar-header-actions">
            <div className="calendar-month-selector">
              <button className="calendar-month-btn" onClick={goToPrevMonth}><ChevronLeft size={14} /></button>
              <span className="calendar-month-title">{monthLabel}</span>
              <button className="calendar-month-btn" onClick={goToNextMonth}><ChevronRight size={14} /></button>
            </div>

            <div className="calendar-view-toggles">
              {['Month', 'Week', 'Day', 'Agenda'].map(tab => (
                <button
                  key={tab}
                  className={`calendar-toggle-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-days-header-row">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="calendar-days-grid">
            {/* Previous month padding */}
            {prevMonthPad.map(dayNum => (
              <div className="calendar-day-cell other-month" key={`prev-${dayNum}`}>
                <span className="day-number">{dayNum}</span>
              </div>
            ))}

            {/* Current month days */}
            {currentDays.map(dayNum => {
              const dayEvents = getEventsForDay(dayNum);
              const isToday = isCurrentMonth && dayNum === todayDate;
              return (
                <div className="calendar-day-cell" key={`curr-${dayNum}`}>
                  <span className={`day-number ${isToday ? 'today' : ''}`}>
                    {dayNum}
                  </span>
                  
                  <div className="calendar-cell-events">
                    {dayEvents.map((ev, i) => (
                      <div 
                        key={ev._id || i} 
                        className={`calendar-event-tag ${ev.type || 'purple'}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete calendar event: ${ev.title}?`)) {
                              onDeleteEvent(ev._id);
                            }
                          }}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '8px', color: 'inherit', padding: '0 2px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Next month padding */}
            {nextMonthPad.map(dayNum => (
              <div className="calendar-day-cell other-month" key={`next-${dayNum}`}>
                <span className="day-number">{dayNum}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Today's Schedule timeline */}
        <div className="card-panel">
          <h3 className="panel-title" style={{ marginBottom: '0.25rem' }}>Today's Schedule</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '1.25rem' }}>
            {todayLabel}
          </span>

          <div className="task-list">
            {todayScheduleItems.length > 0 ? (
              todayScheduleItems.slice(0, 5).map((schedule, i) => {
                const colors = ['purple', 'pink', 'blue', 'warning', 'success'];
                const tagColor = schedule.type || colors[i % colors.length];
                return (
                  <div key={schedule._id || i} className="task-item">
                    <div className="task-icon-col" style={{ backgroundColor: `var(--${tagColor}-light)`, color: `var(--${tagColor})` }}>
                      <Clock size={12} />
                    </div>
                    <div className="task-text-col">
                      <span className="task-title">{schedule.title}</span>
                      <span className="task-date">Today · {MONTH_NAMES[displayMonth].slice(0,3)} {schedule.day}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.75rem' }}>
                No events scheduled for today.
              </div>
            )}
          </div>

          <button 
            className="panel-header-btn" 
            style={{ marginTop: 'auto', textAlign: 'center', display: 'block', width: '100%', paddingTop: '1.5rem', fontWeight: 800 }}
            onClick={goToToday}
          >
            Go to Today
          </button>
        </div>
      </div>

      {/* Add Event Modal overlay */}
      {showAddEventModal && (
        <div className="modal-overlay" onClick={() => setShowAddEventModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Calendar Event</h2>
            </div>
            <form onSubmit={handleCreateEvent}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Event Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Sales Briefing" 
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Day of {MONTH_NAMES[displayMonth]}</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="1" 
                      max={daysInDisplayedMonth}
                      value={newEventDay}
                      onChange={e => setNewEventDay(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color Tag</label>
                    <select 
                      className="form-input" 
                      value={newEventColor}
                      onChange={e => setNewEventColor(e.target.value)}
                    >
                      <option value="purple">Purple</option>
                      <option value="blue">Blue</option>
                      <option value="pink">Pink</option>
                      <option value="warning">Yellow</option>
                      <option value="success">Green</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEventModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
