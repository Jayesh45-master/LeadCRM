import React from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  UserX
} from 'lucide-react';

const LeadTable = ({ 
  leads, 
  totalLeads, 
  currentPage, 
  totalPages, 
  searchQuery, 
  setSearchQuery,
  statusFilter, 
  setStatusFilter,
  sortBy, 
  setSortBy,
  sortOrder, 
  setSortOrder,
  onPageChange, 
  onEditLead, 
  onDeleteLead, 
  onStatusChangeInline,
  onAddLead
}) => {

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={12} className="sort-icon" style={{ opacity: 0.3 }} />;
    return sortOrder === 'asc' 
      ? <span className="sort-icon" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>▲</span>
      : <span className="sort-icon" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>▼</span>;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="header-title-section">
          <h1>Leads Manager</h1>
          <p>Search, sort, filter, and modify customer pipeline entries.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddLead}>
          Add New Lead
        </button>
      </div>

      <div className="leads-table-container">
        {/* Search, Filter controls */}
        <div className="table-controls">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="search-input"
              placeholder="Search by name, email, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select 
              className="select-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>

            <select 
              className="select-control"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="createdAt-desc">Newest Added</option>
              <option value="createdAt-asc">Oldest Added</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="company-asc">Company (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Table representation */}
        <div className="table-wrapper">
          {leads && leads.length > 0 ? (
            <table className="leads-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Lead Name {renderSortIndicator('name')}
                  </th>
                  <th>Contact Details</th>
                  <th onClick={() => handleSort('company')}>
                    Company {renderSortIndicator('company')}
                  </th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th onClick={() => handleSort('createdAt')}>
                    Created Date {renderSortIndicator('createdAt')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <span className="lead-name-text" style={{ fontSize: '0.95rem' }}>{lead.name}</span>
                    </td>
                    <td>
                      <div className="lead-info-cell">
                        <span className="lead-contact-email">{lead.email}</span>
                        <span className="lead-contact-phone">{lead.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="lead-company-text" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {lead.company}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span className={`badge badge-${lead.status.toLowerCase()}`} style={{ width: 'fit-content' }}>
                          {lead.status}
                        </span>
                        {/* Inline status update shortcut */}
                        <select 
                          value={lead.status}
                          onChange={(e) => onStatusChangeInline(lead._id, e.target.value)}
                          style={{ 
                            fontSize: '0.75rem', 
                            border: 'none', 
                            background: 'none', 
                            color: 'var(--text-muted)', 
                            cursor: 'pointer',
                            padding: '2px 0'
                          }}
                        >
                          <option value="New">Move to New</option>
                          <option value="Contacted">Move to Contacted</option>
                          <option value="Qualified">Move to Qualified</option>
                          <option value="Converted">Move to Converted</option>
                          <option value="Lost">Move to Lost</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <p className="lead-note-text" title={lead.notes}>
                        {lead.notes || <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No notes</span>}
                      </p>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(lead.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-icon" 
                          title="Edit Lead"
                          onClick={() => onEditLead(lead)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-icon-danger" 
                          title="Delete Lead"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete lead: ${lead.name}?`)) {
                              onDeleteLead(lead._id);
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="table-empty-state">
              <UserX size={48} className="table-empty-icon" />
              <h3>No leads found</h3>
              <p>Try refining your search query or filters, or add a new lead.</p>
            </div>
          )}
        </div>

        {/* Pagination wrapper */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <span className="pagination-info">
              Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalLeads}</strong> leads)
            </span>
            <div className="pagination-buttons">
              <button 
                className="pagination-btn pagination-btn-arrow"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                className="pagination-btn pagination-btn-arrow"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadTable;
