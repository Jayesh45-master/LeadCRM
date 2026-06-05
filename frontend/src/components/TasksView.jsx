import React, { useState } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Trash2
} from 'lucide-react';

const TasksView = ({ tasks = [], onAddTask, onToggleTask, onDeleteTask }) => {
  const [activeFilter, setActiveFilter] = useState('All'); // All, Pending, In Progress, Completed, Overdue
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [hoveredTaskPoint, setHoveredTaskPoint] = useState(null);

  // Group completed tasks by date for the last 7 calendar days
  const getProductivityData = () => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); // e.g., "Jun 05, 2025"
      const simpleLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayCompleted = tasks.filter(t => {
        try {
          return t.status === 'Completed' && t.date === dateStr;
        } catch {
          return false;
        }
      }).length;
      
      data.push({
        dateStr,
        label: simpleLabel,
        count: dayCompleted
      });
    }
    return data;
  };

  const productivityData = getProductivityData();
  const counts = productivityData.map(d => d.count);
  const maxCount = Math.max(...counts, 2);
  
  const svgWidth = 150;
  const svgHeight = 40;
  const padX = 10;
  const padY = 5;
  
  const points = productivityData.map((d, i) => {
    const x = padX + i * ((svgWidth - 2 * padX) / 6);
    const y = svgHeight - padY - (d.count / maxCount) * (svgHeight - 2 * padY);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x},${svgHeight} L ${points[0].x},${svgHeight} Z`
    : '';

  // Counting calculations
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const progressCount = tasks.filter(t => t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const overdueCount = tasks.filter(t => t.status === 'Overdue').length;

  const handleAddNewTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await onAddTask({
        title: newTaskTitle,
        desc: 'Added task via Task Manager interface',
        status: 'Pending',
        priority: 'Medium',
        time: '04:00 PM',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      });
      setNewTaskTitle('');
      setShowAddTaskModal(false);
    } catch (err) {
      alert('Failed to save task: ' + err.message);
    }
  };

  const getFilteredTasks = (list) => {
    if (activeFilter === 'All') return list;
    return list.filter(t => t.status === activeFilter);
  };

  // Divide tasks based on Today and Upcoming
  const todayTasks = getFilteredTasks(tasks.filter(t => t.priority === 'High' || t.status === 'In Progress'));
  const upcomingTasks = getFilteredTasks(tasks.filter(t => t.priority !== 'High' && t.status !== 'In Progress'));

  // Radial Donut percentage math
  const r = 35;
  const circ = 2 * Math.PI * r;
  const completedPct = totalCount > 0 ? completedCount / totalCount : 0;
  const progressPct = totalCount > 0 ? progressCount / totalCount : 0;
  const pendingPct = totalCount > 0 ? pendingCount / totalCount : 0;
  const overduePct = totalCount > 0 ? overdueCount / totalCount : 0;

  return (
    <div>
      {/* Header Row */}
      <div className="greeting-row">
        <div className="greeting-text">
          <h2>Tasks</h2>
          <p>Stay on top of your tasks and never miss a follow-up.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddTaskModal(true)}>
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="tasks-layout-grid">
        {/* Left Column: Summary statistics */}
        <div className="card-panel">
          <h3 className="panel-title" style={{ marginBottom: '1.25rem' }}>Task Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div className="donut-chart-container" style={{ width: '130px', height: '130px' }}>
              <svg width="110" height="110" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="var(--success)"
                  strokeWidth="10"
                  strokeDasharray={`${completedPct * circ} ${circ}`}
                  strokeDashoffset={0}
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="var(--accent)"
                  strokeWidth="10"
                  strokeDasharray={`${progressPct * circ} ${circ}`}
                  strokeDashoffset={-completedPct * circ}
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="var(--pink)"
                  strokeWidth="10"
                  strokeDasharray={`${pendingPct * circ} ${circ}`}
                  strokeDashoffset={-(completedPct + progressPct) * circ}
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="var(--danger)"
                  strokeWidth="10"
                  strokeDasharray={`${overduePct * circ} ${circ}`}
                  strokeDashoffset={-(completedPct + progressPct + pendingPct) * circ}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="donut-center-text">
                <span className="donut-center-val">{totalCount}</span>
                <span className="donut-center-lbl" style={{ fontSize: '0.6rem' }}>Total Tasks</span>
              </div>
            </div>

            <div className="donut-legend" style={{ width: '100%' }}>
              <div className="legend-item" style={{ padding: '0.25rem 0' }}>
                <div className="legend-label-col">
                  <span className="legend-dot success" />
                  <span>Completed</span>
                </div>
                <span className="legend-value-col">{completedCount} ({Math.round(completedPct * 100)}%)</span>
              </div>
              <div className="legend-item" style={{ padding: '0.25rem 0' }}>
                <div className="legend-label-col">
                  <span className="legend-dot blue" />
                  <span>In Progress</span>
                </div>
                <span className="legend-value-col">{progressCount} ({Math.round(progressPct * 100)}%)</span>
              </div>
              <div className="legend-item" style={{ padding: '0.25rem 0' }}>
                <div className="legend-label-col">
                  <span className="legend-dot pink" />
                  <span>Pending</span>
                </div>
                <span className="legend-value-col">{pendingCount} ({Math.round(pendingPct * 100)}%)</span>
              </div>
              <div className="legend-item" style={{ padding: '0.25rem 0' }}>
                <div className="legend-label-col">
                  <span className="legend-dot danger" />
                  <span>Overdue</span>
                </div>
                <span className="legend-value-col">{overdueCount} ({Math.round(overduePct * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Tasks and Upcoming Lists */}
        <div>
          {/* Status Pills */}
          <div className="tasks-filter-pills">
            <button className={`tasks-filter-pill ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>
              <span>All Tasks</span>
              <span className="tasks-pill-count all">{totalCount}</span>
            </button>
            <button className={`tasks-filter-pill ${activeFilter === 'Pending' ? 'active' : ''}`} onClick={() => setActiveFilter('Pending')}>
              <span>Pending</span>
              <span className="tasks-pill-count pending">{pendingCount}</span>
            </button>
            <button className={`tasks-filter-pill ${activeFilter === 'In Progress' ? 'active' : ''}`} onClick={() => setActiveFilter('In Progress')}>
              <span>In Progress</span>
              <span className="tasks-pill-count in-progress">{progressCount}</span>
            </button>
            <button className={`tasks-filter-pill ${activeFilter === 'Completed' ? 'active' : ''}`} onClick={() => setActiveFilter('Completed')}>
              <span>Completed</span>
              <span className="tasks-pill-count completed">{completedCount}</span>
            </button>
            <button className={`tasks-filter-pill ${activeFilter === 'Overdue' ? 'active' : ''}`} onClick={() => setActiveFilter('Overdue')}>
              <span>Overdue</span>
              <span className="tasks-pill-count overdue">{overdueCount}</span>
            </button>
          </div>

          {/* Today list */}
          <h4 className="task-list-section-header">Today's Tasks</h4>
          <div className="tasks-card-list">
            {todayTasks.length > 0 ? (
              todayTasks.map(t => (
                <div className="task-card-item" key={t._id}>
                  <div className="task-card-checkbox-col">
                    <input 
                      type="checkbox" 
                      className="task-checkbox-input"
                      checked={t.status === 'Completed'}
                      onChange={() => onToggleTask(t._id)}
                    />
                    <div className="task-card-text">
                      <span className="task-card-title" style={{ textDecoration: t.status === 'Completed' ? 'line-through' : 'none', opacity: t.status === 'Completed' ? 0.6 : 1 }}>
                        {t.title}
                      </span>
                      <span className="task-card-subtitle">{t.desc}</span>
                    </div>
                  </div>

                  <div className="task-card-meta-col">
                    <span className={`task-priority-badge ${t.priority.toLowerCase()}`}>
                      ◆ {t.priority}
                    </span>
                    <span className="task-card-time">{t.time}</span>
                    <button className="table-action-btn delete" onClick={() => onDeleteTask(t._id)} style={{ border: 'none' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                No active tasks found matching filter.
              </div>
            )}
          </div>

          {/* Upcoming list */}
          <h4 className="task-list-section-header">Upcoming Tasks</h4>
          <div className="tasks-card-list">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(t => (
                <div className="task-card-item" key={t._id}>
                  <div className="task-card-checkbox-col">
                    <input 
                      type="checkbox" 
                      className="task-checkbox-input"
                      checked={t.status === 'Completed'}
                      onChange={() => onToggleTask(t._id)}
                    />
                    <div className="task-card-text">
                      <span className="task-card-title" style={{ textDecoration: t.status === 'Completed' ? 'line-through' : 'none', opacity: t.status === 'Completed' ? 0.6 : 1 }}>
                        {t.title}
                      </span>
                      <span className="task-card-subtitle">{t.desc}</span>
                    </div>
                  </div>

                  <div className="task-card-meta-col">
                    <span className="task-card-time" style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                      {t.date}
                    </span>
                    <span className={`task-priority-badge ${t.priority.toLowerCase()}`}>
                      ◆ {t.priority}
                    </span>
                    <span className="task-card-time">{t.time}</span>
                    <button className="table-action-btn delete" onClick={() => onDeleteTask(t._id)} style={{ border: 'none' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                No upcoming tasks found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Filters and Productivity graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-panel">
            <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Filters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <select className="form-input" style={{ backgroundColor: '#FFFFFF' }} defaultValue="all">
                  <option value="all">All Priority</option>
                  <option value="high">High Only</option>
                  <option value="medium">Medium Only</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-input" style={{ backgroundColor: '#FFFFFF' }} defaultValue="all">
                  <option value="all">All Status</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>
              <div className="form-group">
                <select className="form-input" style={{ backgroundColor: '#FFFFFF' }} defaultValue="all">
                  <option value="all">All Assignees</option>
                  <option value="me">Assignee: Alen</option>
                </select>
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <input type="text" className="form-input" placeholder="Select Date" style={{ backgroundColor: '#FFFFFF' }} />
                <Calendar size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Apply Filter
              </button>
            </div>
          </div>

          <div className="card-panel" style={{ position: 'relative' }}>
            <div className="panel-header">
              <h3 className="panel-title">Productivity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tasks Completed</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{completedCount}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>▲ 20%</span>
              </div>
              <div style={{ height: '40px', marginTop: '0.5rem', position: 'relative' }}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {points.length > 0 && (
                    <>
                      <path d={areaD} fill="url(#prodGradient)" />
                      <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" />
                    </>
                  )}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="6"
                        fill="transparent"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredTaskPoint(p)}
                        onMouseLeave={() => setHoveredTaskPoint(null)}
                      />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredTaskPoint && hoveredTaskPoint.dateStr === p.dateStr ? "4" : "2.5"}
                        fill={hoveredTaskPoint && hoveredTaskPoint.dateStr === p.dateStr ? "var(--primary)" : "#FFFFFF"}
                        stroke="var(--primary)"
                        strokeWidth="1.5"
                        style={{ pointerEvents: 'none', transition: 'all 0.15s' }}
                      />
                    </g>
                  ))}
                </svg>
                {hoveredTaskPoint && (
                  <div 
                    className="chart-tooltip-box"
                    style={{
                      position: 'absolute',
                      left: `${(hoveredTaskPoint.x / svgWidth) * 100}%`,
                      top: '-25px',
                      transform: 'translateX(-50%)',
                      zIndex: 10,
                      backgroundColor: 'var(--bg-sidebar)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {hoveredTaskPoint.count} done ({hoveredTaskPoint.label})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Task</h2>
            </div>
            <form onSubmit={handleAddNewTaskSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Follow up on design contract" 
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
