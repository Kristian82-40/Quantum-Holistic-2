import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const geminiModel = genai.getGenerativeModel({ model: 'gemini-2.0-flash' })

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
4. 2 hábitos clave

Formato claro, práctico y motivador.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = message.content[0]
    return block.type === 'text' ? block.text : ''
  } catch {
    // Fallback a Gemini si Anthropic falla
    const result = await geminiModel.generateContent(prompt)
    return result.response.text()
  }
}
