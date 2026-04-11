import { NextRequest, NextResponse } from 'next/server'
import { generateHealthPlan } from '@/lib/claude'
import { supabase } from '@/lib/supabase'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function analyzeQuantum(goal: string, diet: string, lifestyle: string) {
  try {
    const script = `python3 /Volumes/PapuExt/agent/quantum_health.py`
    const env = {
      ...process.env,
      QUANTUM_GOAL: goal,
      QUANTUM_DIET: diet,
      QUANTUM_LIFESTYLE: lifestyle,
    }
    const { stdout } = await execAsync(script, { env })
    const lines = stdout.trim().split('\n')
    return {
      estado: lines[1]?.split(': ')[1] || 'unknown',
      probabilidad: lines[2]?.split(': ')[1] || 'unknown',
      recomendacion: lines[3]?.split(': ')[1] || 'unknown',
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { goal, diet, lifestyle, email } = body

    if (!goal || !diet || !lifestyle) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const [plan, quantum] = await Promise.all([
      generateHealthPlan({ goal, diet, lifestyle }),
      analyzeQuantum(goal, diet, lifestyle),
    ])

    if (email) {
      await supabase.from('nutrition_plans').insert({
        user_id: null,
        title: `Plan personalizado — ${goal}`,
        description: `Generado para perfil: ${diet} / ${lifestyle}`,
        plan_data: { goal, diet, lifestyle, plan, quantum, email },
        generated_by: 'claude-api+quantum',
      })
    }

    return NextResponse.json({ plan, quantum }, { status: 200 })

  } catch (error) {
    console.error('Error en /api/profile:', error)
    return NextResponse.json(
      { error: 'Error generando el plan' },
      { status: 500 }
    )
  }
}
