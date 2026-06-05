import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart2, FileText, Compass, ClipboardList, RefreshCw } from 'lucide-react';
import { scoreLeadAI, summarizeLeadAI, notesLeadAI, nextActionAI } from '../utils/api';

const AIPanel = ({ lead, onNotesUpdate }) => {
  const [activeTab, setActiveTab] = useState('score');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI Outputs State
  const [scoreData, setScoreData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [actionData, setActionData] = useState(null);

  // Smart Notes inputs/outputs
  const [rawNotesInput, setRawNotesInput] = useState('');
  const [structuredNotesOutput, setStructuredNotesOutput] = useState('');

  // Automatically trigger score and next action load when component mounts or lead changes
  useEffect(() => {
    if (lead) {
      handleLoadScore();
      handleLoadAction();
      handleLoadSummary();
    }
  }, [lead]);

  const handleLoadScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await scoreLeadAI(lead);
      setScoreData(res);
    } catch (err) {
      setError(err.message || 'Failed to calculate AI score');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await summarizeLeadAI(lead);
      setSummaryData(res);
    } catch (err) {
      setError(err.message || 'Failed to summarize notes');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await nextActionAI(lead);
      setActionData(res);
    } catch (err) {
      setError(err.message || 'Failed to query next action');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSmartNotes = async () => {
    if (!rawNotesInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await notesLeadAI(rawNotesInput);
      setStructuredNotesOutput(res.summary);
    } catch (err) {
      setError(err.message || 'Failed to generate smart notes');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySmartNotes = () => {
    if (structuredNotesOutput && onNotesUpdate) {
      onNotesUpdate(structuredNotesOutput);
      alert('Smart notes copied to lead details notes panel!');
    }
  };

  const renderScoreStatusBadge = (score) => {
    if (score >= 80) return <span className="badge badge-converted" style={{ marginTop: '0.5rem' }}>High Chance Customer</span>;
    if (score >= 50) return <span className="badge badge-qualified" style={{ marginTop: '0.5rem' }}>Medium Chance</span>;
    return <span className="badge badge-lost" style={{ marginTop: '0.5rem' }}>Low Chance</span>;
  };

  const getStrokeDashoffset = (score = 0) => {
    const circ = 2 * Math.PI * 35; // r=35 -> 219.9
    return circ - (score / 100) * circ;
  };

  return (
    <div className="ai-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles size={16} style={{ color: 'var(--primary)' }} />
        <h3 className="panel-title" style={{ margin: 0, fontSize: '0.95rem' }}>AI Assistant Insights</h3>
        {(scoreData?.isDemo || summaryData?.isDemo || actionData?.isDemo) && (
          <span style={{ fontSize: '0.65rem', padding: '1px 6px', background: '#e0e7ff', color: 'var(--primary)', borderRadius: '4px', fontWeight: 'bold' }}>Demo Mode AI</span>
        )}
      </div>

      <div className="ai-tab-header">
        <button 
          type="button"
          className={`ai-tab-btn ${activeTab === 'score' ? 'active' : ''}`}
          onClick={() => setActiveTab('score')}
        >
          <BarChart2 size={12} style={{ marginRight: '4px' }} />
          Score Predictor
        </button>
        <button 
          type="button"
          className={`ai-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <FileText size={12} style={{ marginRight: '4px' }} />
          Notes Summary
        </button>
        <button 
          type="button"
          className={`ai-tab-btn ${activeTab === 'action' ? 'active' : ''}`}
          onClick={() => setActiveTab('action')}
        >
          <Compass size={12} style={{ marginRight: '4px' }} />
          Next Action
        </button>
        <button 
          type="button"
          className={`ai-tab-btn ${activeTab === 'smart-notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('smart-notes')}
        >
          <ClipboardList size={12} style={{ marginRight: '4px' }} />
          Smart Note Builder
        </button>
      </div>

      <div className="ai-content-box">
        {loading && <div className="ai-spinner" />}

        {!loading && error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center' }}>
            <p>{error}</p>
            <button 
              type="button" 
              onClick={() => {
                if (activeTab === 'score') handleLoadScore();
                if (activeTab === 'action') handleLoadAction();
                if (activeTab === 'summary') handleLoadSummary();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', marginTop: '0.5rem' }}
            >
              Retry Call
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === 'score' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="ai-score-ring">
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      fill="transparent" 
                      stroke="var(--primary)" 
                      strokeWidth="6" 
                      strokeDasharray={2 * Math.PI * 35}
                      strokeDashoffset={getStrokeDashoffset(scoreData?.score)}
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                    />
                  </svg>
                  <span className="ai-score-value">{scoreData?.score || 0}%</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, margin: 0 }}>AI Conversion Probability</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.3 }}>
                    {scoreData?.reason || 'Predicting conversion likelihood based on CRM pipeline data...'}
                  </p>
                  {scoreData?.score != null && renderScoreStatusBadge(scoreData.score)}
                </div>
                <button type="button" onClick={handleLoadScore} title="Recalculate Score" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                  <RefreshCw size={14} />
                </button>
              </div>
            )}

            {activeTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>AI Generated Notes Summary</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                    {summaryData?.summary || 'Generating summary of existing customer notes...'}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleLoadSummary}
                  style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
                >
                  <RefreshCw size={10} /> Regenerate
                </button>
              </div>
            )}

            {activeTab === 'action' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>AI Recommended Action</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 700 }}>
                    {actionData?.action || 'Determining next best action...'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.3 }}>
                    <strong>Reason:</strong> {actionData?.reason || 'Context-aware reasoning will appear here.'}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleLoadAction}
                  style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
                >
                  <RefreshCw size={10} /> Refresh Recommender
                </button>
              </div>
            )}

            {activeTab === 'smart-notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                {!structuredNotesOutput ? (
                  <>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scribble raw meeting/call notes below to format them:</span>
                    <textarea 
                      className="form-input"
                      placeholder="e.g. Call with Rahul today. Discussed site redesign. Budget around 1 lakh. Proposal needed by Friday."
                      value={rawNotesInput}
                      onChange={e => setRawNotesInput(e.target.value)}
                      style={{ height: '70px', fontSize: '0.75rem', backgroundColor: '#fff' }}
                    />
                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGenerateSmartNotes}
                      disabled={!rawNotesInput.trim()}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', alignSelf: 'flex-end' }}
                    >
                      Generate Structured Notes
                    </button>
                  </>
                ) : (
                  <>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, margin: 0 }}>Structured Note Summary</h4>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: '#fff', border: '1px solid #E2E8F0', padding: '0.5rem', borderRadius: '6px', whiteSpace: 'pre-line' }}>
                      {structuredNotesOutput}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifySelf: 'flex-end', alignSelf: 'flex-end' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setStructuredNotesOutput('')}
                        style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem' }}
                      >
                        Reset notes
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handleApplySmartNotes}
                        style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem' }}
                      >
                        Apply to Lead Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIPanel;
