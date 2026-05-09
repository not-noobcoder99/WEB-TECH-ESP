import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const BotIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2zM7.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM3 21v-1a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v1H3z"/>
  </svg>
);

const SUGGESTED = [
  'What does a high risk score mean?',
  'Explain ST depression',
  'What is chest pain type 3?',
  'When should I escalate an alert?',
];

const ChatBot = ({ patientContext }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m CardioSentinel\'s clinical assistant. Ask me about risk scores, patient vitals, cardiac terminology, or how to use the platform.' }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || thinking) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const next = [...messages, userMsg];
    setMessages(next);
    setThinking(true);

    try {
      const history = next.slice(1, -1); // exclude greeting + latest user msg
      const { data } = await apiClient.post('/api/chat', {
        message: msg,
        patientContext: patientContext || null,
        history,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reach the assistant. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
    } finally {
      setThinking(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Clinical Assistant"
        style={{
          position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 900,
          width: 54, height: 54, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: open ? '#0f766e' : 'linear-gradient(135deg,#0f4c81,#0f766e)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(15,76,129,0.4)',
          transition: 'all 0.25s ease',
        }}
      >
        {open ? '✕' : <BotIcon />}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '1.75rem', zIndex: 900,
          width: 360, height: 500, background: 'white', borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(15,40,64,0.22)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid #d6e3ee',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#0f4c81,#0f766e)', padding: '1rem 1.25rem', color: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BotIcon /> Clinical Assistant
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.15rem' }}>
              {patientContext?.name ? `Context: ${patientContext.name}` : 'Powered by Gemini AI'}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '0.6rem 0.875rem', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? '#0f4c81' : '#f3f8fb',
                  color: m.role === 'user' ? 'white' : '#1f2937',
                  fontSize: '0.85rem', lineHeight: 1.55, whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.6rem 0.875rem', background: '#f3f8fb', borderRadius: '14px 14px 14px 4px', fontSize: '0.85rem', color: '#9ca3af' }}>
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions (only if just greeting) */}
          {messages.length === 1 && (
            <div style={{ padding: '0 1rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => send(s)} style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', borderRadius: '20px', border: '1px solid #d6e3ee', background: 'white', color: '#0f4c81', cursor: 'pointer', fontWeight: 600 }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '0.5rem' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a clinical question…"
              rows={1}
              style={{ flex: 1, border: '1px solid #d6e3ee', borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || thinking}
              style={{ background: '#0f4c81', color: 'white', border: 'none', borderRadius: '10px', padding: '0 0.875rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', opacity: !input.trim() || thinking ? 0.5 : 1 }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
