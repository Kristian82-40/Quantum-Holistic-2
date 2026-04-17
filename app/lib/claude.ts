interface HealthPlanInput {
  goal: string;
  diet: string;
  lifestyle: string;
}

export async function generateHealthPlan(input: HealthPlanInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return 'Plan no disponible: falta ANTHROPIC_API_KEY';

  const prompt = `Eres un especialista en nutrición holística km0 e inteligencia cuántica aplicada al bienestar.
Crea un plan nutricional semanal personalizado para:
- Objetivo: ${input.goal}
- Alimentación actual: ${input.diet}
- Estilo de vida: ${input.lifestyle}

Incluye: plan semanal de comidas, plantas medicinales recomendadas, ritual matinal y una nota cuántica. Responde en español, en formato estructurado y conciso.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? 'Sin respuesta';
}
