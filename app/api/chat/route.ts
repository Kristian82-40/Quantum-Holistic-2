import { NextRequest, NextResponse } from 'next/server'

const N8N_CHAT_WEBHOOK = process.env.N8N_CHAT_WEBHOOK_URL || 'http://localhost:5678/webhook/chat-holistic'
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://172.17.0.2:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'papu-pro:latest'

const SYSTEM_PROMPT = `Eres el asistente holístico de Quantum Holistic, un servicio de nutrición km0, herbología y bienestar personalizado.
Tu rol: orientar a los usuarios en nutrición de proximidad, plantas medicinales, detox estacional y bienestar integral.
Tono: cálido, experto, breve. Responde siempre en español.
Límite: no des diagnósticos médicos. Para condiciones graves, recomienda consulta médica.
Si el usuario tiene interés en planes personalizados, menciona brevemente los planes Freemium y Quantum Pro.`

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()

    if (!message || typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
    }

    // Intentar via n8n primero (si está disponible)
    try {
      const n8nRes = await fetch(N8N_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: AbortSignal.timeout(8000),
      })
      if (n8nRes.ok) {
        const data = await n8nRes.json()
        if (data.reply) return NextResponse.json({ reply: data.reply })
      }
    } catch {
      // n8n no disponible, fallback a Ollama directo
    }

    // Fallback: Ollama directo
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: message },
    ]

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
      signal: AbortSignal.timeout(30000),
    })

    if (!ollamaRes.ok) throw new Error('Ollama no disponible')

    const data = await ollamaRes.json()
    const reply = data.message?.content || 'No pude generar una respuesta.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json(
      { reply: 'En este momento no puedo responder. Por favor inténtalo en unos minutos.' },
      { status: 200 }
    )
  }
}
