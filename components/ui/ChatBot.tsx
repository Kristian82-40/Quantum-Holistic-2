'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './ChatBot.module.css'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const WELCOME = 'Bienvenido a Quantum Holistic. Soy tu asistente especializado en nutrición km0, herbología y bienestar personalizado. ¿En qué puedo orientarte hoy?'

const SUGGESTIONS = [
  'Plantas para la digestión',
  'Detox de primavera',
  'Plan nutricional km0',
  'Romero y memoria',
]

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [showDot, setShowDot] = useState(true)
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      setShowDot(false)
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [open])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setShowSuggestions(false)
    setMessages(m => [...m, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', text: data.reply || 'No pude procesar tu consulta. Inténtalo de nuevo.' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: 'Error de conexión. Por favor inténtalo en unos momentos.' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Trigger */}
      <button
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente holístico'}
      >
        {showDot && !open && <span className={styles.dot} />}
        <span className={`${styles.triggerIcon} ${open ? styles.triggerIconOpen : ''}`}>
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3L15 15M15 3L3 15" stroke="#A8B89A" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#A8B89A" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 9H16M8 13H13" stroke="#A8B89A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Asistente holístico Quantum">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.avatar}>🌿</div>
            <div className={styles.headerInfo}>
              <p className={styles.headerName}>Asistente Quantum Holistic</p>
              <p className={styles.headerStatus}>
                <span className={styles.statusDot} />
                IA local · papu-pro · Nutrición & Herbología
              </p>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAssistant}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className={styles.typing}>
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && messages.length === 1 && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map(s => (
                <button key={s} className={styles.suggestion} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
            />
            <button
              className={styles.sendBtn}
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Enviar"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13.5 7.5L1.5 1.5L4.5 7.5L1.5 13.5L13.5 7.5Z" fill="#1a2314" strokeWidth="0"/>
              </svg>
            </button>
          </div>

          <p className={styles.panelFooter}>QUANTUM HOLISTIC · IA LOCAL · PRIVACIDAD GARANTIZADA</p>
        </div>
      )}
    </>
  )
}
