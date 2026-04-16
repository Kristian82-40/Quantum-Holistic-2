import { NextRequest, NextResponse } from 'next/server';

const VALID_GOALS = ['Energía', 'Depuración', 'Rendimiento', 'Equilibrio'] as const;
type Goal = typeof VALID_GOALS[number];

interface ProfilePayload {
  goal:         Goal;
  location:     string;
  restrictions: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as ProfilePayload;

  if (!VALID_GOALS.includes(body.goal)) {
    return NextResponse.json({ error: 'Objetivo no válido' }, { status: 400 });
  }
  if (!body.location?.trim()) {
    return NextResponse.json({ error: 'Ubicación requerida' }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_PROFILE_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.includes('REEMPLAZA')) {
    // Modo sin n8n: igual respondemos OK para que la UI funcione
    console.log('[Profile API] n8n no configurado — datos recibidos:', body);
    return NextResponse.json({ ok: true, mode: 'local' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        ...body,
        source:    'quantum_web_form',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n respondió ${response.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    console.error('[Profile API] Error enviando a n8n:', message);
    // No fallamos la request al usuario — el dato se logueó al menos
    return NextResponse.json({ ok: true, warning: message });
  }
}
