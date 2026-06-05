import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Sparkles, 
  CheckSquare, 
  Calendar, 
  Lock, 
  Cpu, 
  CreditCard 
} from 'lucide-react';

const SettingsView = () => {
  const [activeSubTab, setActiveSubTab] = useState('Profile Settings');

  // 1. Profile settings
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('crm_profile_settings');
    return saved ? JSON.parse(saved) : {
      name: 'Alen Miller',
      email: 'alen.miller@example.com',
      phone: '9876543210',
      designation: 'Admin',
      company: 'LeadCRM',
      timezone: '(GMT+05:30) Asia/Kolkata'
    };
  });

  // 2. Notification settings
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('crm_notification_settings');
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      weeklySummary: true,
      systemUpdates: false
    };
  });

  // 3. Lead settings
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('crm_lead_settings');
    return saved ? JSON.parse(saved) : {
      defaultSource: 'Website',
      conversionThreshold: '80',
      archiveConverted: false,
      newStageName: 'New Opportunity',
      qualifiedStageName: 'Qualified Lead'
    };
  });

  // 4. Task settings
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('crm_task_settings');
    return saved ? JSON.parse(saved) : {
      reminderBuffer: '1 Hour',
      defaultPriority: 'Medium',
      autoArchiveTasks: true,
      showOverdueBadge: true
    };
  });

  // 5. Calendar settings
  const [calendar, setCalendar] = useState(() => {
    const saved = localStorage.getItem('crm_calendar_settings');
    return saved ? JSON.parse(saved) : {
      startOfWeek: 'Monday',
      defaultView: 'Month',
      showHolidayCal: true,
      workHoursStart: '09:00 AM',
      workHoursEnd: '06:00 PM'
    };
  });

  // 6. Security settings
  const [security, setSecurity] = useState(() => {
    const saved = localStorage.getItem('crm_security_settings');
    return saved ? JSON.parse(saved) : {
      twoFactorEnabled: false,
      sessionTimeout: '30 Minutes',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  });

  // 7. Integrations settings
  const [integrations, setIntegrations] = useState(() => {
    const saved = localStorage.getItem('crm_integrations_settings');
    return saved ? JSON.parse(saved) : {
      slack: true,
      googleCalendar: false,
      hubspot: false,
      zapier: true
    };
  });

  // 8. Billing Plan settings
  const [billingPlan, setBillingPlan] = useState(() => {
    const saved = localStorage.getItem('crm_billing_plan');
    return saved ? JSON.parse(saved) : 'Professional';
  });

  // Input change handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLeadChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLeads(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTaskChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTasks(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCalendarChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCalendar(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecurity(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleIntegration = (key) => {
    setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Submit and save configuration
  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('crm_profile_settings', JSON.stringify(profile));
    localStorage.setItem('crm_notification_settings', JSON.stringify(notifications));
    localStorage.setItem('crm_lead_settings', JSON.stringify(leads));
    localStorage.setItem('crm_task_settings', JSON.stringify(tasks));
    localStorage.setItem('crm_calendar_settings', JSON.stringify(calendar));
    localStorage.setItem('crm_security_settings', JSON.stringify(security));
    localStorage.setItem('crm_integrations_settings', JSON.stringify(integrations));
    localStorage.setItem('crm_billing_plan', JSON.stringify(billingPlan));
    
    alert(`${activeSubTab} saved successfully!`);
  };

  const menuItems = [
    { label: 'Profile Settings', icon: <User size={14} /> },
    { label: 'Notification Settings', icon: <Bell size={14} /> },
    { label: 'Lead Settings', icon: <Sparkles size={14} /> },
    { label: 'Task Settings', icon: <CheckSquare size={14} /> },
    { label: 'Calendar Settings', icon: <Calendar size={14} /> },
    { label: 'Security Settings', icon: <Lock size={14} /> },
    { label: 'Integrations', icon: <Cpu size={14} /> },
    { label: 'Billing & Plan', icon: <CreditCard size={14} /> }
  ];

  return (
    <div>
      {/* Header section */}
      <div className="greeting-row">
        <div className="greeting-text">
          <h2>Settings</h2>
          <p>Manage your preferences and account settings.</p>
        </div>
      </div>

      <div className="settings-container">
        {/* Left Subnav */}
        <div className="settings-sub-menu">
          {menuItems.map(item => (
            <button
              key={item.label}
              className={`settings-sub-link ${activeSubTab === item.label ? 'active' : ''}`}
              onClick={() => setActiveSubTab(item.label)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Central Forms Panel */}
        <div className="card-panel">
          <h3 className="panel-title" style={{ marginBottom: '1.5rem' }}>{activeSubTab}</h3>
          
          <form onSubmit={handleSave}>
            {activeSubTab === 'Profile Settings' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" 
                    alt="Alen Miller" 
                    style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid var(--primary-light)', objectFit: 'cover' }}
                  />
                  <div>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => alert("Upload dialog opened")}>
                      Change Photo
                    </button>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
                      JPG, GIF or PNG. Max size of 800K
                    </span>
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      className="form-input" 
                      style={{ backgroundColor: '#FFFFFF' }}
                      value={profile.name} 
                      onChange={handleProfileChange} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      className="form-input" 
                      style={{ backgroundColor: '#FFFFFF' }}
                      value={profile.email} 
                      onChange={handleProfileChange} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone" 
                      className="form-input" 
                      style={{ backgroundColor: '#FFFFFF' }}
                      value={profile.phone} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input 
                      type="text" 
                      name="designation" 
                      className="form-input" 
                      style={{ backgroundColor: '#FFFFFF' }}
                      value={profile.designation} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input 
                      type="text" 
                      name="company" 
                      className="form-input" 
                      style={{ backgroundColor: '#FFFFFF' }}
                      value={profile.company} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select 
                      name="timezone" 
                      className="form-input" 
                      style={{ backgroundColor: '#FFFFFF' }}
                      value={profile.timezone} 
                      onChange={handleProfileChange}
                    >
                      <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                      <option value="(GMT-05:00) EST/New York">(GMT-05:00) EST/New York</option>
                      <option value="(GMT+00:00) GMT/London">(GMT+00:00) GMT/London</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'Notification Settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <label className="switch-container">
                  <input 
                    type="checkbox" 
                    className="switch-input" 
                    checked={notifications.emailAlerts}
                    onChange={() => handleNotificationToggle('emailAlerts')}
                  />
                  <span className="switch-slider" />
                  <span className="form-label" style={{ fontWeight: 500 }}>Email Alerts for lead generation</span>
                </label>

                <label className="switch-container">
                  <input 
                    type="checkbox" 
                    className="switch-input" 
                    checked={notifications.smsAlerts}
                    onChange={() => handleNotificationToggle('smsAlerts')}
                  />
                  <span className="switch-slider" />
                  <span className="form-label" style={{ fontWeight: 500 }}>SMS Text updates on task deadlines</span>
                </label>

                <label className="switch-container">
                  <input 
                    type="checkbox" 
                    className="switch-input" 
                    checked={notifications.pushNotifications}
                    onChange={() => handleNotificationToggle('pushNotifications')}
                  />
                  <span className="switch-slider" />
                  <span className="form-label" style={{ fontWeight: 500 }}>Browser Push notifications for calendar events</span>
                </label>

                <label className="switch-container">
                  <input 
                    type="checkbox" 
                    className="switch-input" 
                    checked={notifications.weeklySummary}
                    onChange={() => handleNotificationToggle('weeklySummary')}
                  />
                  <span className="switch-slider" />
                  <span className="form-label" style={{ fontWeight: 500 }}>Receive Weekly Summary Reports</span>
                </label>

                <label className="switch-container">
                  <input 
                    type="checkbox" 
                    className="switch-input" 
                    checked={notifications.systemUpdates}
                    onChange={() => handleNotificationToggle('systemUpdates')}
                  />
                  <span className="switch-slider" />
                  <span className="form-label" style={{ fontWeight: 500 }}>System Maintenance and update alerts</span>
                </label>
              </div>
            )}

            {activeSubTab === 'Lead Settings' && (
              <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Default Acquisition Channel</label>
                  <select 
                    name="defaultSource" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={leads.defaultSource} 
                    onChange={handleLeadChange}
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lead Score Conversion Threshold (%)</label>
                  <input 
                    type="number" 
                    name="conversionThreshold" 
                    min="1" 
                    max="100"
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={leads.conversionThreshold} 
                    onChange={handleLeadChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Title: New Stage</label>
                  <input 
                    type="text" 
                    name="newStageName" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={leads.newStageName} 
                    onChange={handleLeadChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Title: Qualified Stage</label>
                  <input 
                    type="text" 
                    name="qualifiedStageName" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={leads.qualifiedStageName} 
                    onChange={handleLeadChange}
                  />
                </div>
                <div className="form-group form-grid-full">
                  <label className="switch-container">
                    <input 
                      type="checkbox" 
                      className="switch-input" 
                      name="archiveConverted"
                      checked={leads.archiveConverted}
                      onChange={handleLeadChange}
                    />
                    <span className="switch-slider" />
                    <span className="form-label" style={{ fontWeight: 500 }}>Auto-archive leads once converted</span>
                  </label>
                </div>
              </div>
            )}

            {activeSubTab === 'Task Settings' && (
              <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Default Task Reminder</label>
                  <select 
                    name="reminderBuffer" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={tasks.reminderBuffer} 
                    onChange={handleTaskChange}
                  >
                    <option value="15 Minutes">15 Minutes Before</option>
                    <option value="30 Minutes">30 Minutes Before</option>
                    <option value="1 Hour">1 Hour Before</option>
                    <option value="1 Day">1 Day Before</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Default Task Priority</label>
                  <select 
                    name="defaultPriority" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={tasks.defaultPriority} 
                    onChange={handleTaskChange}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group form-grid-full" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="switch-container">
                    <input 
                      type="checkbox" 
                      className="switch-input" 
                      name="autoArchiveTasks"
                      checked={tasks.autoArchiveTasks}
                      onChange={handleTaskChange}
                    />
                    <span className="switch-slider" />
                    <span className="form-label" style={{ fontWeight: 500 }}>Auto-delete/archive completed tasks</span>
                  </label>
                  <label className="switch-container">
                    <input 
                      type="checkbox" 
                      className="switch-input" 
                      name="showOverdueBadge"
                      checked={tasks.showOverdueBadge}
                      onChange={handleTaskChange}
                    />
                    <span className="switch-slider" />
                    <span className="form-label" style={{ fontWeight: 500 }}>Highlight overdue tasks in red badge alerts</span>
                  </label>
                </div>
              </div>
            )}

            {activeSubTab === 'Calendar Settings' && (
              <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Day of Week</label>
                  <select 
                    name="startOfWeek" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={calendar.startOfWeek} 
                    onChange={handleCalendarChange}
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Default Calendar View Mode</label>
                  <select 
                    name="defaultView" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={calendar.defaultView} 
                    onChange={handleCalendarChange}
                  >
                    <option value="Month">Month Grid</option>
                    <option value="Week">Weekly Timeline</option>
                    <option value="Day">Daily Agenda</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Work Hours Start</label>
                  <input 
                    type="text" 
                    name="workHoursStart" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    placeholder="e.g. 09:00 AM"
                    value={calendar.workHoursStart} 
                    onChange={handleCalendarChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Hours End</label>
                  <input 
                    type="text" 
                    name="workHoursEnd" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    placeholder="e.g. 06:00 PM"
                    value={calendar.workHoursEnd} 
                    onChange={handleCalendarChange}
                  />
                </div>
                <div className="form-group form-grid-full">
                  <label className="switch-container">
                    <input 
                      type="checkbox" 
                      className="switch-input" 
                      name="showHolidayCal"
                      checked={calendar.showHolidayCal}
                      onChange={handleCalendarChange}
                    />
                    <span className="switch-slider" />
                    <span className="form-label" style={{ fontWeight: 500 }}>Show Public Holidays in calendar grid</span>
                  </label>
                </div>
              </div>
            )}

            {activeSubTab === 'Security Settings' && (
              <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={security.currentPassword} 
                    onChange={handleSecurityChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={security.newPassword} 
                    onChange={handleSecurityChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={security.confirmPassword} 
                    onChange={handleSecurityChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Session Idle Timeout</label>
                  <select 
                    name="sessionTimeout" 
                    className="form-input" 
                    style={{ backgroundColor: '#FFFFFF' }}
                    value={security.sessionTimeout} 
                    onChange={handleSecurityChange}
                  >
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                  </select>
                </div>
                <div className="form-group form-grid-full">
                  <label className="switch-container">
                    <input 
                      type="checkbox" 
                      className="switch-input" 
                      name="twoFactorEnabled"
                      checked={security.twoFactorEnabled}
                      onChange={handleSecurityChange}
                    />
                    <span className="switch-slider" />
                    <span className="form-label" style={{ fontWeight: 500 }}>Enable Multi-factor Authentication (MFA)</span>
                  </label>
                </div>
              </div>
            )}

            {activeSubTab === 'Integrations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="integration-card">
                  <div className="integration-info">
                    <span style={{ fontSize: '1.25rem' }}>💬</span>
                    <div className="integration-text">
                      <h4>Slack Channel</h4>
                      <p>Send lead generation summaries straight to your chat channels.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`settings-badge ${integrations.slack ? '' : 'danger'}`} style={{ backgroundColor: integrations.slack ? 'var(--success-light)' : 'var(--danger-light)', color: integrations.slack ? 'var(--success)' : 'var(--danger)' }}>
                      {integrations.slack ? 'Connected' : 'Disconnected'}
                    </span>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => toggleIntegration('slack')}>
                      {integrations.slack ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                <div className="integration-card">
                  <div className="integration-info">
                    <span style={{ fontSize: '1.25rem' }}>📅</span>
                    <div className="integration-text">
                      <h4>Google Calendar</h4>
                      <p>Synchronize lead meetings and follow-up activities to your Google Calendar.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`settings-badge ${integrations.googleCalendar ? '' : 'danger'}`} style={{ backgroundColor: integrations.googleCalendar ? 'var(--success-light)' : 'var(--danger-light)', color: integrations.googleCalendar ? 'var(--success)' : 'var(--danger)' }}>
                      {integrations.googleCalendar ? 'Connected' : 'Disconnected'}
                    </span>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => toggleIntegration('googleCalendar')}>
                      {integrations.googleCalendar ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                <div className="integration-card">
                  <div className="integration-info">
                    <span style={{ fontSize: '1.25rem' }}>🟠</span>
                    <div className="integration-text">
                      <h4>HubSpot API Link</h4>
                      <p>Push qualified CRM leads directly to HubSpot sales deals pipeline.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`settings-badge ${integrations.hubspot ? '' : 'danger'}`} style={{ backgroundColor: integrations.hubspot ? 'var(--success-light)' : 'var(--danger-light)', color: integrations.hubspot ? 'var(--success)' : 'var(--danger)' }}>
                      {integrations.hubspot ? 'Connected' : 'Disconnected'}
                    </span>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => toggleIntegration('hubspot')}>
                      {integrations.hubspot ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                <div className="integration-card">
                  <div className="integration-info">
                    <span style={{ fontSize: '1.25rem' }}>⚡</span>
                    <div className="integration-text">
                      <h4>Zapier Automation</h4>
                      <p>Connect over 5,000+ web applications through custom lead triggers.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`settings-badge ${integrations.zapier ? '' : 'danger'}`} style={{ backgroundColor: integrations.zapier ? 'var(--success-light)' : 'var(--danger-light)', color: integrations.zapier ? 'var(--success)' : 'var(--danger)' }}>
                      {integrations.zapier ? 'Connected' : 'Disconnected'}
                    </span>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => toggleIntegration('zapier')}>
                      {integrations.zapier ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'Billing & Plan' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Manage subscriptions, card payments, and corporate receipts.
                </p>
                
                <div className="billing-grid">
                  <div 
                    className={`plan-card ${billingPlan === 'Free' ? 'active' : ''}`}
                    onClick={() => setBillingPlan('Free')}
                  >
                    <span className="plan-title">Free Starter</span>
                    <span className="plan-price">$0</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>forever</span>
                    <ul className="plan-features">
                      <li>Up to 100 Leads</li>
                      <li>Standard Pipeline</li>
                      <li>Email Support</li>
                    </ul>
                  </div>

                  <div 
                    className={`plan-card ${billingPlan === 'Professional' ? 'active' : ''}`}
                    onClick={() => setBillingPlan('Professional')}
                  >
                    <span className="plan-title">Professional</span>
                    <span className="plan-price">$19</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>per user / month</span>
                    <ul className="plan-features">
                      <li>Unlimited Leads</li>
                      <li>Advanced Analytics</li>
                      <li>MFA Security</li>
                      <li>Zapier Integrations</li>
                    </ul>
                  </div>

                  <div 
                    className={`plan-card ${billingPlan === 'Enterprise' ? 'active' : ''}`}
                    onClick={() => setBillingPlan('Enterprise')}
                  >
                    <span className="plan-title">Enterprise</span>
                    <span className="plan-price">Custom</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>contract basis</span>
                    <ul className="plan-features">
                      <li>Dedicated Database</li>
                      <li>SAML Single Sign-On</li>
                      <li>API Access Hooks</li>
                      <li>24/7 SLA Support</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab !== 'Integrations' && (
              <button type="submit" className="btn btn-primary" style={{ minWidth: '130px' }}>
                Save Changes
              </button>
            )}
          </form>
        </div>

        {/* Right Status & Storage panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account status info card */}
          <div className="card-panel">
            <h3 className="panel-title" style={{ marginBottom: '0.75rem' }}>Account Status</h3>
            <span className="settings-badge" style={{ marginBottom: '0.5rem' }}>Active</span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
              Your account is active and all systems are running smoothly.
            </p>
          </div>

          {/* Storage usage meter card */}
          <div className="card-panel">
            <h3 className="panel-title">Storage Usage</h3>
            <div className="storage-usage-bar-container">
              <div className="storage-usage-bar-bg">
                <div className="storage-usage-bar-fill" style={{ width: '24%' }} />
              </div>
              <div className="storage-details">
                <span>2.4 GB / 10 GB</span>
                <span>24%</span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', padding: '0.4rem' }} onClick={() => alert("Redirecting to cloud storage planner...")}>
              Manage Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
