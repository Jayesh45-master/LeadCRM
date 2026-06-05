import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Star, 
  Eye, 
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';

const ContactsView = ({ leads = [], onDeleteContact, onEditContact, onAddContact }) => {
  const [activeTab, setActiveTab] = useState('All Contacts');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Manage starred contacts locally using lead IDs in localStorage
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const saved = localStorage.getItem('starred_contact_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('starred_contact_ids', JSON.stringify(starredIds));
  }, [starredIds]);

  const handleToggleStar = (id) => {
    setStarredIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter contacts by search and tab
  const filteredContacts = leads.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'Starred') {
      return matchesSearch && starredIds.includes(contact._id);
    }
    return matchesSearch;
  });

  return (
    <div>
      {/* Header Panel */}
      <div className="greeting-row">
        <div className="greeting-text">
          <h2>Contacts</h2>
          <p>All your contacts in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddContact}>
          <Plus size={16} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Quick Avatars row mapped to live leads */}
      <div className="contacts-avatars-row">
        {leads.slice(0, 4).map(contact => {
          const initial = contact.name ? contact.name.charAt(0).toUpperCase() : 'C';
          return (
            <div 
              className="contact-avatar-card" 
              key={contact._id} 
              onClick={() => onEditContact(contact)}
            >
              <div className="lead-table-avatar" style={{ width: '32px', height: '32px' }}>
                {initial}
              </div>
              <div className="contact-avatar-text">
                <span className="contact-avatar-name">{contact.name}</span>
                <span className="contact-avatar-company">{contact.company}</span>
              </div>
            </div>
          );
        })}
        <div 
          className="contact-avatar-card" 
          style={{ borderStyle: 'dashed', backgroundColor: 'transparent', justifyContent: 'center' }} 
          onClick={onAddContact}
        >
          <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
            All Contacts ({leads.length})
          </span>
        </div>
      </div>

      {/* Address Directory Table */}
      <div className="leads-table-card">
        <div className="table-header-panel">
          <div className="view-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {['All Contacts', 'Starred'].map(tab => (
              <button
                key={tab}
                className={`view-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{ padding: '0.5rem 0' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="table-panel-search-wrapper">
            <Search size={14} className="table-panel-search-icon" />
            <input 
              type="text" 
              className="table-panel-search-input"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '30px' }} />
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Direct Links</th>
                <th>Last Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => {
                  const initial = contact.name ? contact.name.charAt(0).toUpperCase() : 'C';
                  const isStarred = starredIds.includes(contact._id);
                  return (
                    <tr key={contact._id}>
                      <td>
                        <button 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isStarred ? 'var(--warning)' : 'var(--text-light)' }}
                          onClick={() => handleToggleStar(contact._id)}
                        >
                          <Star size={14} fill={isStarred ? 'var(--warning)' : 'transparent'} />
                        </button>
                      </td>
                      <td>
                        <div className="lead-identity-cell">
                          <div className="lead-table-avatar">{initial}</div>
                          <span className="lead-table-name">{contact.name}</span>
                        </div>
                      </td>
                      <td>{contact.company}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{contact.email}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{contact.phone}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          {/* Direct Call Link */}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                              title={`Call ${contact.name}: ${contact.phone}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'var(--success-light)',
                                color: 'var(--success)',
                                border: '1px solid #bbf7d0',
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                                flexShrink: 0
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--success)';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--success-light)';
                                e.currentTarget.style.color = 'var(--success)';
                              }}
                            >
                              <Phone size={12} />
                            </a>
                          )}
                          {/* Direct Email Link */}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              title={`Email ${contact.name}: ${contact.email}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                border: '1px solid #c7d2fe',
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                                flexShrink: 0
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--primary)';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--primary-light)';
                                e.currentTarget.style.color = 'var(--primary)';
                              }}
                            >
                              <Mail size={12} />
                            </a>
                          )}
                          {!contact.phone && !contact.email && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {new Date(contact.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <button className="table-action-btn" title="View details" onClick={() => onEditContact(contact)}>
                          <Eye size={12} />
                        </button>
                        <button className="table-action-btn" title="Edit contact" onClick={() => onEditContact(contact)}>
                          <Edit3 size={12} />
                        </button>
                        <button 
                          className="table-action-btn delete" 
                          title="Delete contact" 
                          onClick={() => { 
                            if (window.confirm('Delete contact?')) {
                              onDeleteContact(contact._id);
                            } 
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No contacts found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactsView;
