import { z } from 'zod'
export const PlantSchema = z.object({
  id: z.number(),
  // regex ASCII: caza la clase de bug ñ/tildes que rompe en Linux/Vercel
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug debe ser ASCII minúsculas/guiones'),
  categoria: z.enum(['Maestras', 'Sagradas', 'Magicas']),
})
export const PlantsSchema = z.array(PlantSchema)
export type Plant = z.infer<typeof PlantSchema>
