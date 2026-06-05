import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, ChevronDown, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadsView from './components/LeadsView';
import TasksView from './components/TasksView';
import CalendarView from './components/CalendarView';
import ReportsView from './components/ReportsView';
import ContactsView from './components/ContactsView';
import SettingsView from './components/SettingsView';
import LeadModal from './components/LeadModal';
import Toast from './components/Toast';
import AIChatWidget from './components/AIChatWidget';
import { 
  getLeads, 
  createLead, 
  updateLead, 
  deleteLead, 
  getLeadStats,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getEvents,
  createEvent,
  deleteEvent
} from './utils/api';

const App = () => {
  // Navigation & UI Layout State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Notification log state (persisted to localStorage)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('leadcrm_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 1, message: 'Welcome to LeadCRM! Connect your dashboard to get started.', time: '10 mins ago', read: false },
      { id: 2, message: 'System update: Real-time database synchronizations enabled.', time: '1 hour ago', read: true }
    ];
  });
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notifRef = useRef(null);

  // Close notification dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotificationDropdown(false);
      }
    };
    if (showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotificationDropdown]);

  // Toast notifier helper — defined first so addNotification can use it
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Add notification & trigger 5-second popup toast
  const addNotification = (message) => {
    const newNotif = {
      id: Date.now(),
      message,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem('leadcrm_notifications', JSON.stringify(updated));
      return updated;
    });
    addToast(message, 'info');
  };

  // Keep a ref to addNotification so the interval always calls the latest version
  const addNotificationRef = useRef(addNotification);
  useEffect(() => { addNotificationRef.current = addNotification; });

  const handleMarkAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('leadcrm_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkSingleRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('leadcrm_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Real-time notifications map to direct user actions inside the app

  // CSV Export & Import actions
  const handleExportCSV = async () => {
    try {
      const data = await getLeads({ limit: 10000 });
      const exportLeads = data.leads || [];
      if (exportLeads.length === 0) {
        addToast('No leads available to export.', 'info');
        return;
      }
      
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Notes', 'Created Date'];
      const csvRows = [headers.join(',')];
      
      exportLeads.forEach(lead => {
        const values = [
          `"${(lead.name || '').replace(/"/g, '""')}"`,
          `"${(lead.email || '').replace(/"/g, '""')}"`,
          `"${(lead.phone || '').replace(/"/g, '""')}"`,
          `"${(lead.company || '').replace(/"/g, '""')}"`,
          `"${(lead.status || '').replace(/"/g, '""')}"`,
          `"${(lead.source || '').replace(/"/g, '""')}"`,
          `"${(lead.notes || '').replace(/"/g, '""')}"`,
          `"${new Date(lead.createdAt).toISOString()}"`
        ];
        csvRows.push(values.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Leads database successfully exported to CSV!', 'success');
      addNotification(`Leads database exported to CSV: ${exportLeads.length} records exported.`);
    } catch (error) {
      addToast(`CSV Export failed: ${error.message}`, 'error');
    }
  };

  const handleImportCSV = async (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          addToast('CSV file is empty or missing headers.', 'error');
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        
        const nameIdx = headers.indexOf('name');
        const emailIdx = headers.indexOf('email');
        const phoneIdx = headers.indexOf('phone');
        const companyIdx = headers.indexOf('company');
        const statusIdx = headers.indexOf('status');
        const sourceIdx = headers.indexOf('source');
        const notesIdx = headers.indexOf('notes');
        
        if (nameIdx === -1 || emailIdx === -1 || phoneIdx === -1 || companyIdx === -1) {
          addToast('CSV is missing required headers: Name, Email, Phone, Company.', 'error');
          return;
        }
        
        let successCount = 0;
        let failCount = 0;
        let failMessages = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          const columns = matches.map(val => val.trim().replace(/^["']|["']$/g, '').replace(/""/g, '"'));
          
          const name = columns[nameIdx];
          const email = columns[emailIdx];
          const phone = columns[phoneIdx];
          const company = columns[companyIdx];
          const status = statusIdx !== -1 ? (columns[statusIdx] || 'New') : 'New';
          const source = sourceIdx !== -1 ? (columns[sourceIdx] || 'Website') : 'Website';
          const notes = notesIdx !== -1 ? (columns[notesIdx] || '') : '';
          
          if (!name || !email || !phone || !company) {
            failCount++;
            failMessages.push(`Row ${i+1}: Missing required fields`);
            continue;
          }
          
          try {
            await createLead({ name, email, phone, company, status, source, notes });
            successCount++;
          } catch (error) {
            failCount++;
            failMessages.push(`Row ${i+1} (${name}): ${error.message}`);
          }
        }
        
        if (successCount > 0) {
          addToast(`Successfully imported ${successCount} leads!`, 'success');
          addNotification(`Imported ${successCount} leads from CSV file.`);
          fetchDashboardData();
          fetchLeadsData();
        }
        if (failCount > 0) {
          addToast(`Failed to import ${failCount} leads.`, 'error');
        }
      } catch (err) {
        addToast(`CSV parsing error: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Data Loading & Paginated State
  const [leads, setLeads] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Real-time collections state
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: { New: 0, Contacted: 0, Qualified: 0, Converted: 0, Lost: 0 },
    bySource: { Website: 0, Referral: 0, 'Social Media': 0, 'Email Campaign': 0, Others: 0 },
    conversionRate: 0,
    history: [],
    activities: []
  });

  // Filter, Search, Sort states (Shared globally with the top header search)
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');


  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on search
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Dashboard Stats and Recent leads
  const fetchDashboardData = async () => {
    try {
      const statsData = await getLeadStats();
      setStats(statsData);

      const leadsRes = await getLeads({ sortBy: 'createdAt', order: 'desc', limit: 5 });
      setRecentLeads(leadsRes.leads || []);
    } catch (error) {
      addToast(error.message || 'Failed to fetch dashboard metrics', 'error');
    }
  };

  // Fetch Leads List for Table
  const fetchLeadsData = async () => {
    try {
      const data = await getLeads({
        search: debouncedSearch,
        status: statusFilter,
        sortBy,
        order: sortOrder,
        page: currentPage,
        limit: 8 // Show 8 items per page for a compact, neat display
      });
      setLeads(data.leads || []);
      setTotalLeads(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      addToast(error.message || 'Failed to query CRM leads', 'error');
    }
  };

  // Fetch Task records
  const fetchTasksData = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      addToast(error.message || 'Failed to sync tasks dataset', 'error');
    }
  };

  // Fetch Calendar Event records
  const fetchEventsData = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      addToast(error.message || 'Failed to load calendar schedule', 'error');
    }
  };

  // Initial sync
  useEffect(() => {
    fetchDashboardData();
    fetchTasksData();
    fetchEventsData();
  }, []);

  // Fetch table data when parameters change
  useEffect(() => {
    fetchLeadsData();
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, currentPage, activeTab]);

  // Handle Save Lead (Create / Update)
  const handleSaveLead = async (formData) => {
    try {
      if (selectedLead) {
        // Edit Mode
        const updated = await updateLead(selectedLead._id, formData);
        addToast(`Lead "${updated.name}" updated successfully!`, 'success');
        addNotification(`Lead details updated: "${updated.name}" (${updated.company})`);
      } else {
        // Create Mode
        const created = await createLead(formData);
        addToast(`Lead "${created.name}" created successfully!`, 'success');
        addNotification(`New CRM Lead registered: "${created.name}" from ${created.source}`);
      }
      setIsModalOpen(false);
      setSelectedLead(null);
      
      // Refresh datasets
      fetchDashboardData();
      fetchLeadsData();
    } catch (error) {
      addToast(error.message || 'Error occurred while saving lead records', 'error');
      throw error; 
    }
  };

  // Inline Status Change from Table Selector
  const handleStatusChangeInline = async (id, newStatus) => {
    try {
      const updated = await updateLead(id, { status: newStatus });
      addToast(`Lead "${updated.name}" status changed to ${newStatus}!`, 'success');
      addNotification(`Lead status changed: "${updated.name}" is now in ${newStatus}`);
      
      // Refresh datasets
      fetchDashboardData();
      fetchLeadsData();
    } catch (error) {
      addToast(error.message || 'Failed to update lead status', 'error');
    }
  };

  // Handle Delete Lead
  const handleDeleteLead = async (id) => {
    try {
      const targetLead = leads.find(l => l._id === id);
      const leadName = targetLead ? targetLead.name : 'Customer';
      await deleteLead(id);
      addToast('Lead successfully removed from CRM.', 'success');
      addNotification(`Lead removed: "${leadName}" was deleted from CRM records`);
      
      if (leads.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchDashboardData();
        fetchLeadsData();
      }
    } catch (error) {
      addToast(error.message || 'Failed to delete lead records', 'error');
    }
  };

  // Tasks Event Handlers
  const handleAddTask = async (taskData) => {
    try {
      const task = await createTask(taskData);
      addToast(`Task "${task.title}" created successfully!`, 'success');
      addNotification(`New Task added: "${task.title}"`);
      fetchTasksData();
    } catch (error) {
      addToast(error.message || 'Failed to create task', 'error');
      throw error;
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      if (!task) return;
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await updateTask(id, { status: nextStatus });
      addToast(`Task status updated!`, 'success');
      addNotification(`Task updated: "${task.title}" is now marked as ${nextStatus}`);
      fetchTasksData();
    } catch (error) {
      addToast(error.message || 'Failed to toggle task status', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const targetTask = tasks.find(t => t._id === id);
      const taskTitle = targetTask ? targetTask.title : 'Task';
      await deleteTask(id);
      addToast('Task removed.', 'success');
      addNotification(`Task deleted: "${taskTitle}"`);
      fetchTasksData();
    } catch (error) {
      addToast(error.message || 'Failed to delete task', 'error');
    }
  };

  // Calendar Event Handlers
  const handleAddEvent = async (eventData) => {
    try {
      const event = await createEvent(eventData);
      addToast(`Calendar event "${event.title}" saved.`, 'success');
      addNotification(`New Calendar event scheduled: "${event.title}" on day ${event.day}`);
      fetchEventsData();
    } catch (error) {
      addToast(error.message || 'Failed to save calendar event', 'error');
      throw error;
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const targetEvent = events.find(e => e._id === id);
      const eventTitle = targetEvent ? targetEvent.title : 'Event';
      await deleteEvent(id);
      addToast('Calendar event deleted.', 'success');
      addNotification(`Calendar event cancelled: "${eventTitle}"`);
      fetchEventsData();
    } catch (error) {
      addToast(error.message || 'Failed to delete calendar event', 'error');
    }
  };

  // Trigger edit modal
  const handleTriggerEdit = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  // Trigger add modal
  const handleTriggerAdd = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  // Workspace Page Router
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            leads={leads}
            totalLeads={totalLeads}
            currentPage={currentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onPageChange={setCurrentPage}
            onEditLead={handleTriggerEdit}
            onDeleteLead={handleDeleteLead}
            onStatusChangeInline={handleStatusChangeInline}
            onAddLead={handleTriggerAdd}
            stats={stats}
            tasks={tasks}
            onImportCSV={handleImportCSV}
            onExportCSV={handleExportCSV}
          />
        );
      case 'leads':
        return (
          <LeadsView 
            leads={leads}
            totalLeads={totalLeads}
            currentPage={currentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onPageChange={setCurrentPage}
            onEditLead={handleTriggerEdit}
            onDeleteLead={handleDeleteLead}
            onStatusChangeInline={handleStatusChangeInline}
            onAddLead={handleTriggerAdd}
            stats={stats}
          />
        );
      case 'tasks':
        return (
          <TasksView 
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            events={events}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      case 'reports':
        return <ReportsView stats={stats} leads={leads} />;
      case 'contacts':
        return (
          <ContactsView 
            leads={leads} 
            onDeleteContact={handleDeleteLead} 
            onEditContact={handleTriggerEdit} 
            onAddContact={handleTriggerAdd} 
          />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <Dashboard 
            leads={leads}
            totalLeads={totalLeads}
            currentPage={currentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onPageChange={setCurrentPage}
            onEditLead={handleTriggerEdit}
            onDeleteLead={handleDeleteLead}
            onStatusChangeInline={handleStatusChangeInline}
            onAddLead={handleTriggerAdd}
            stats={stats}
            tasks={tasks}
            onImportCSV={handleImportCSV}
            onExportCSV={handleExportCSV}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Navbar Header */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="sidebar-logo" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>LP</div>
          <span className="sidebar-title" style={{ fontSize: '1.1rem' }}>LeadCRM</span>
        </div>
        <button className="menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Main Persistent Sidebar Drawer */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onAddLead={handleTriggerAdd}
      />

      {/* Persistent Top Header Navigator */}
      <div className="top-header">
        <div className="header-search" style={{ position: 'relative' }}>
          <Search size={16} className="header-search-icon" />
          <input 
            type="text" 
            className="header-search-input"
            placeholder="Search leads by name, email or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div className="header-actions">
          {/* Bell + Notification Dropdown wrapper */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button 
              className="notification-bell-btn" 
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            >
              <Bell size={18} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotificationDropdown && (
              <div className="notification-dropdown">
                <div className="notif-dropdown-header">
                  <h4>Notifications</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={handleMarkAllAsRead}>Mark all read</button>
                    <button onClick={() => setShowNotificationDropdown(false)} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
                  </div>
                </div>
                <div className="notif-dropdown-body">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => handleMarkSingleRead(n.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <p style={{ margin: 0, fontWeight: !n.read ? 700 : 500 }}>{n.message}</p>
                        <span>{n.time}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.75rem' }}>
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="header-profile" onClick={() => setActiveTab('settings')}>
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" 
              alt="Alen Miller" 
              className="header-avatar"
            />
            <div className="header-profile-info">
              <span className="header-profile-name">Alen Miller</span>
              <span className="header-profile-role">Admin</span>
            </div>
            <ChevronDown size={14} className="header-profile-chevron" />
          </div>
        </div>
      </div>

      {/* Primary Work Space Pane */}
      <main className="main-content">
        {renderActiveTab()}
      </main>

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <LeadModal 
          lead={selectedLead}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLead(null);
          }}
          onSave={handleSaveLead}
        />
      )}

      {/* Notification Toast Stream */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={5000}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Floating AI Chatbot Widget */}
      <AIChatWidget />
    </div>
  );
};

export default App;
