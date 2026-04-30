'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type Message = { role: 'user' | 'assistant'; text: string };

const FREE_LIMIT = 5;

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('qh_session_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('qh_session_id', id);
  }
  return id;
}

function getDailyCount(): number {
  if (typeof window === 'undefined') return 0;
  const today = new Date().toISOString().split('T')[0];
  try {
    const stored = localStorage.getItem('qh_chat_usage');
    if (!stored) return 0;
    const { date, count } = JSON.parse(stored) as { date: string; count: number };
    return date === today ? count : 0;
  } catch { return 0; }
}

function incrementDailyCount() {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('qh_chat_usage', JSON.stringify({ date: today, count: getDailyCount() + 1 }));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '¡Hola! Soy papu-pro, tu asistente holístico. ¿En qué te puedo ayudar hoy?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMsgCount(getDailyCount()); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isBlocked = msgCount >= FREE_LIMIT;
  const remaining = Math.max(0, FREE_LIMIT - msgCount);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || isBlocked) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    incrementDailyCount();
    setMsgCount(getDailyCount());

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': getSessionId() },
        body: JSON.stringify({ message: text, history: messages.slice(-10) }),
      });
      const data = await res.json() as { reply?: string };
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'Sin respuesta.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error de conexión. Inténtalo de nuevo.' }]);
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

      {/* Aviso de límite próximo */}
      {!isBlocked && remaining <= 2 && (
        <div style={s.warnBanner}>
          <span>Te quedan {remaining} mensaje{remaining !== 1 ? 's' : ''} gratuitos hoy.</span>
          <Link href="/#pricing" style={{ color: 'var(--sage)', fontWeight: 500, textDecoration: 'none', marginLeft: '8px' }}>
            Hazte Pro →
          </Link>
        </div>
      )}

      {/* Messages */}
      <div style={s.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
            <div style={m.role === 'user' ? s.bubbleUser : s.bubbleBot}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div style={s.bubbleBot}>...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Paywall bloqueado */}
      {isBlocked ? (
        <div style={s.paywallBlock}>
          <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.1rem', marginBottom: '8px' }}>
            Has usado tus {FREE_LIMIT} mensajes gratuitos de hoy
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 300 }}>
            Vuelve mañana o hazte Pro para conversaciones ilimitadas.
          </p>
          <Link href="/#pricing" style={{ padding: '12px 28px', background: 'var(--sage)', color: '#fff', textDecoration: 'none', fontSize: '13px', letterSpacing: '0.1em', fontFamily: 'var(--font-serif)' }}>
            Ver planes Pro
          </Link>
        </div>
      ) : (
        <form onSubmit={send} style={s.form}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pregunta sobre nutrición, plantas, bienestar..."
            style={s.input}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !input.trim()} style={s.sendBtn}>
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-secondary)', fontFamily: 'var(--font-sans)' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' },
  back: { fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.05em', marginRight: 'auto' },
  headerTitle: { fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '0.1em' },
  headerSub: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  warnBanner: { padding: '10px 24px', background: '#fffbf0', borderBottom: '1px solid #f0e080', fontSize: '13px', color: '#8a6e00', display: 'flex', alignItems: 'center' },
  messages: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' },
  bubbleUser: { background: 'var(--sage)', color: '#fff', padding: '10px 16px', maxWidth: '72%', fontSize: '14px', lineHeight: 1.6, borderRadius: '2px', fontWeight: 300 },
  bubbleBot: { background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 16px', maxWidth: '72%', fontSize: '14px', lineHeight: 1.6, borderRadius: '2px', fontWeight: 300 },
  paywallBlock: { padding: '32px 24px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', textAlign: 'center' },
  form: { display: 'flex', gap: '12px', padding: '16px 24px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' },
  input: { flex: 1, padding: '12px 16px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' },
  sendBtn: { padding: '12px 24px', background: 'var(--sage)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' },
};
