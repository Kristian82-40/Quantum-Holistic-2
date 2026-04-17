'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const WELCOME = '¡Hola! Soy tu asistente holístico de Quantum. Puedo ayudarte con nutrición km0, plantas medicinales y bienestar personalizado. ¿En qué te puedo orientar hoy?'

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', text: data.reply || 'No pude procesar tu consulta. Inténtalo de nuevo.' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: 'Error de conexión. Comprueba tu red e inténtalo de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      <style>{`
        .qh-chat-btn {
          position: fixed; bottom: 28px; left: 28px; z-index: 99970;
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #1E2B1A, #2d3d26);
          border: 1px solid rgba(168,184,154,0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.35);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .qh-chat-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,0.45); }
        .qh-chat-btn svg { transition: transform 0.3s; }
        .qh-chat-btn.open svg { transform: rotate(90deg); }

        .qh-chat-panel {
          position: fixed; bottom: 96px; left: 28px; z-index: 99970;
          width: 340px; max-width: calc(100vw - 56px);
          background: linear-gradient(160deg, #1a2314 0%, #101810 100%);
          border: 1px solid rgba(168,184,154,0.18);
          border-radius: 20px;
          box-shadow: 0 16px 60px rgba(0,0,0,0.5);
          display: flex; flex-direction: column;
          overflow: hidden;
          animation: chatIn 0.35s cubic-bezier(0.16,1,0.3,1);
          transform-origin: bottom left;
        }
        @keyframes chatIn {
          from { opacity:0; transform: scale(0.85) translateY(12px); }
          to   { opacity:1; transform: none; }
        }

        .qh-chat-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(168,184,154,0.12);
          display: flex; align-items: center; gap: 10px;
        }
        .qh-chat-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #6B7C5E, #A8B89A);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .qh-chat-header-info { flex: 1; min-width: 0; }
        .qh-chat-header-name {
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          font-size: 0.875rem; color: #F0E4C0; margin: 0;
        }
        .qh-chat-header-status {
          font-size: 0.72rem; color: #6B7C5E; margin: 0;
        }
        .qh-chat-header-status span {
          display: inline-block; width: 6px; height: 6px;
          background: #6B7C5E; border-radius: 50%; margin-right: 4px;
          vertical-align: middle; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .qh-chat-messages {
          flex: 1; overflow-y: auto; padding: 1rem;
          display: flex; flex-direction: column; gap: 0.75rem;
          max-height: 320px; min-height: 200px;
          scrollbar-width: thin; scrollbar-color: rgba(107,124,94,0.3) transparent;
        }
        .qh-msg {
          max-width: 88%;
          font-family: 'DM Sans', sans-serif; font-size: 0.83rem; line-height: 1.55;
          padding: 0.65rem 0.9rem; border-radius: 14px;
          animation: msgIn 0.25s ease;
        }
        @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .qh-msg-assistant {
          background: rgba(107,124,94,0.15); color: #C8D4BE;
          border-radius: 4px 14px 14px 14px; align-self: flex-start;
        }
        .qh-msg-user {
          background: linear-gradient(135deg, #6B7C5E, #4d5c43);
          color: #F0E4C0; border-radius: 14px 14px 4px 14px;
          align-self: flex-end;
        }
        .qh-typing {
          align-self: flex-start;
          background: rgba(107,124,94,0.15);
          border-radius: 4px 14px 14px 14px;
          padding: 0.65rem 0.9rem;
          display: flex; gap: 4px; align-items: center;
        }
        .qh-typing span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #6B7C5E; animation: dot 1.2s infinite;
        }
        .qh-typing span:nth-child(2) { animation-delay: 0.2s; }
        .qh-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

        .qh-chat-input-row {
          padding: 0.75rem;
          border-top: 1px solid rgba(168,184,154,0.12);
          display: flex; gap: 0.5rem; align-items: flex-end;
        }
        .qh-chat-input {
          flex: 1; background: rgba(168,184,154,0.08);
          border: 1px solid rgba(168,184,154,0.15); border-radius: 12px;
          color: #F0E4C0; font-family: 'DM Sans', sans-serif; font-size: 0.83rem;
          padding: 0.6rem 0.85rem; resize: none; outline: none;
          line-height: 1.4; max-height: 80px;
          transition: border-color 0.2s;
        }
        .qh-chat-input::placeholder { color: rgba(168,184,154,0.4); }
        .qh-chat-input:focus { border-color: rgba(168,184,154,0.35); }
        .qh-chat-send {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #6B7C5E, #A8B89A);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
        }
        .qh-chat-send:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
        .qh-chat-send:disabled { opacity: 0.4; cursor: default; }
      `}</style>

      {/* Botón flotante */}
      <button
        className={`qh-chat-btn${open ? ' open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Cerrar chat' : 'Abrir asistente holístico'}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="#A8B89A" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8 2 4 5 4 9C4 11.5 5.5 13.7 7.8 15L7 18L10.5 16.3C11 16.4 11.5 16.5 12 16.5C16 16.5 20 13.5 20 9C20 5 16 2 12 2Z" stroke="#A8B89A" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 9H16M8 12H13" stroke="#A8B89A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Panel de chat */}
      {open && (
        <div className="qh-chat-panel" role="dialog" aria-label="Asistente holístico">
          <div className="qh-chat-header">
            <div className="qh-chat-avatar">🌿</div>
            <div className="qh-chat-header-info">
              <p className="qh-chat-header-name">Asistente Holístico</p>
              <p className="qh-chat-header-status"><span/>En línea · IA local</p>
            </div>
          </div>

          <div className="qh-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`qh-msg qh-msg-${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="qh-typing">
                <span/><span/><span/>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div className="qh-chat-input-row">
            <textarea
              ref={inputRef}
              className="qh-chat-input"
              placeholder="Pregúntame sobre nutrición, plantas..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
            />
            <button
              className="qh-chat-send"
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2L5 8L2 14L14 8Z" fill="#1a2314"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
