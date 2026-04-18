'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '¡Hola! Soy papu-pro, tu asistente holístico. ¿En qué te puedo ayudar hoy?' },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply || 'Sin respuesta.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error de conexión. Inténtalo de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <a href="/" style={s.back}>← Inicio</a>
        <div>
          <p style={s.headerTitle}>papu-pro</p>
          <p style={s.headerSub}>Asistente holístico · Quantum Holistic</p>
        </div>
        <div style={{ ...s.dot, background: loading ? 'var(--gold)' : '#4caf50' }} />
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
            <div style={m.role === 'user' ? s.bubbleUser : s.bubbleBot}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div style={s.bubbleBot}>...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={s.form}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre nutrición, plantas, bienestar..."
          style={s.input}
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()} style={s.sendBtn}>
          Enviar
        </button>
      </form>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--bg-secondary)',
    fontFamily: 'var(--font-sans)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border)',
  },
  back: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    letterSpacing: '0.05em',
    marginRight: 'auto',
  },
  headerTitle: {
    fontFamily: 'var(--font-serif)',
    fontWeight: 300,
    fontSize: '18px',
    color: 'var(--text-primary)',
    letterSpacing: '0.1em',
  },
  headerSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  bubbleUser: {
    background: 'var(--sage)',
    color: '#fff',
    padding: '10px 16px',
    maxWidth: '72%',
    fontSize: '14px',
    lineHeight: 1.6,
    borderRadius: '2px',
    fontWeight: 300,
  },
  bubbleBot: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    padding: '10px 16px',
    maxWidth: '72%',
    fontSize: '14px',
    lineHeight: 1.6,
    borderRadius: '2px',
    fontWeight: 300,
  },
  form: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    background: 'var(--bg-primary)',
    borderTop: '1px solid var(--border)',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    outline: 'none',
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
  },
  sendBtn: {
    padding: '12px 24px',
    background: 'var(--sage)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-serif)',
    fontSize: '13px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
};
