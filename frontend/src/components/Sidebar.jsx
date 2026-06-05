import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Contact, 
  Settings, 
  ChevronDown 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen, onAddLead }) => {
  const handleNavClick = (tab) => {
    if (tab === 'add-lead') {
      onAddLead();
    } else {
      setActiveTab(tab);
    }
    setMobileOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'leads', label: 'Leads', icon: <Users size={16} /> },
    { id: 'add-lead', label: 'Add Lead', icon: <UserPlus size={16} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={16} /> },
    { id: 'contacts', label: 'Contacts', icon: <Contact size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
  ];

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand logo matching mockup */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round" />
            <path d="M12 6a6 6 0 1 0 6 6" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="sidebar-title">LeadCRM</h2>
      </div>

      {/* Navigation menu matching mockup */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Upgrade to Pro Card widget matching mockup */}
      <div className="sidebar-upgrade-card">
        <div className="upgrade-illustration">
          {/* Custom SVG Rocket */}
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--primary)" strokeWidth="2">
            <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h6c0-2.31-1-4.24-2.5-5.5z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2C9 5 9 9 9 13h6c0-4 0-8-3-11z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 13v3a3 3 0 0 0 6 0v-3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="8" r="1.5" fill="var(--primary)" />
          </svg>
        </div>
        <h4 className="upgrade-title">Upgrade to <span>Pro</span></h4>
        <p className="upgrade-desc">Unlock advanced analytics, custom reports and much more.</p>
        <button 
          className="btn-upgrade"
          onClick={() => alert("Upgrade Premium checkout coming soon!")}
        >
          Upgrade Now
        </button>
      </div>

      {/* User profile footer section matching mockup */}
      <div className="sidebar-footer">
        <div className="sidebar-user-details">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" 
            alt="Alen Miller" 
            className="sidebar-avatar" 
          />
          <div className="sidebar-user-text">
            <span className="sidebar-user-name">Alen Miller</span>
            <span className="sidebar-user-role">Admin</span>
          </div>
        </div>
        <ChevronDown size={14} className="sidebar-user-chevron" />
      </div>
    </aside>
  );
};

export default Sidebar;
