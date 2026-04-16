const GEMINI_KEY = process.env.GEMINI_API_KEY

async function tryOllama(prompt: string): Promise<string> {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'phi4-mini', prompt, stream: false }),
    signal: AbortSignal.timeout(30000),
  })
  const data = await res.json()
  if (!data.response) throw new Error('Ollama sin respuesta')
  return data.response
}

async function tryGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(15000),
    }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini sin respuesta')
  return text
}

async function tryFallbackPlan(answers: { goal: string; diet: string; lifestyle: string }): Promise<string> {
  return `Plan nutricional para perfil ${answers.goal} / ${answers.diet} / ${answers.lifestyle}:

1. Resumen: Perfil activo orientado al ${answers.goal} con alimentación ${answers.diet}.

2. Plan semanal básico:
- Lunes: Desayuno nutritivo / Comida equilibrada / Cena ligera
- Martes a Domingo: Variedad de legumbres, verduras km0 y cereales integrales

3. Plantas medicinales: Romero, ortiga, jengibre

4. Hábitos clave: Hidratación constante y descanso reparador

(Plan generado en modo offline — IA en mantenimiento)`
}

export async function generateHealthPlan(answers: {
  goal: string
  diet: string
  lifestyle: string
}): Promise<string> {
  const prompt = `Eres un experto en nutrición holística km0. Genera un plan nutricional personalizado en español:
- Objetivo: ${answers.goal}
- Alimentación: ${answers.diet}
- Estilo de vida: ${answers.lifestyle}

Responde con:
1. Resumen del perfil (2 líneas)
2. Plan semanal (lunes a domingo, desayuno/comida/cena)
3. 3 plantas medicinales km0
4. 2 hábitos clave`

  const engines = [
    { name: 'Ollama', fn: () => tryOllama(prompt) },
    { name: 'Gemini', fn: () => tryGemini(prompt) },
    { name: 'Fallback', fn: () => tryFallbackPlan(answers) },
  ]

  for (const engine of engines) {
    try {
      console.log(`Intentando con ${engine.name}...`)
      const result = await engine.fn()
      console.log(`✅ ${engine.name} respondió`)
      return result
    } catch (e) {
      console.log(`❌ ${engine.name} falló: ${e}`)
    }
  }

  return 'Error generando el plan'
}
