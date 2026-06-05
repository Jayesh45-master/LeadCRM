import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, X, Send } from 'lucide-react';
import { chatAI, getLeads } from '../utils/api';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: "Hi! I'm your LeadCRM AI Assistant. Ask me anything about your leads, stats, or pipeline!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [leadsContext, setLeadsContext] = useState([]);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Load leads context on mount to provide to AI
  useEffect(() => {
    const loadLeadsContext = async () => {
      try {
        const data = await getLeads({ limit: 1000 });
        setLeadsContext(data.leads || []);
      } catch (err) {
        console.error('Failed to pre-fetch leads context for chatbot:', err);
      }
    };
    loadLeadsContext();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const updatedMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const result = await chatAI(updatedMessages, leadsContext);
      setMessages(prev => [...prev, { sender: 'assistant', text: result.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: "Sorry, I ran into an error communicating with the AI server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-widget">
      {/* Floating Sparkles Trigger Button */}
      {!isOpen && (
        <button className="ai-chat-btn" onClick={() => setIsOpen(true)} title="AI Chatbot Assistant">
          <Sparkles size={24} />
        </button>
      )}

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} />
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>CRM AI Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="ai-chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`ai-message ${m.sender}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="ai-message assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div className="ai-spinner" style={{ margin: 0, width: '12px', height: '12px' }} />
                <span>AI is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="ai-chat-input-wrapper">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask about your leads (e.g. who is Rahul?)..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="ai-chat-send-btn" disabled={loading || !input.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
