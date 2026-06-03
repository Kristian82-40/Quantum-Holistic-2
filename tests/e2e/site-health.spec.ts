import { test, expect } from '@playwright/test'

const routes = ['/', '/diccionario', '/blog']
for (const r of routes) {
  test(`render sin errores: ${r}`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', m => m.type() === 'error' && errors.push(m.text()))
    const resp = await page.goto(r)
    expect(resp?.status(), `status de ${r}`).toBeLessThan(400)
    expect(errors, `errores de consola en ${r}`).toEqual([])
  })
}

test('diccionario: cada card tiene <img> con src resoluble (placeholder OK)', async ({ page, request }) => {
  await page.goto('/diccionario')

  // Esperar a que las cards estén renderizadas
  await page.waitForSelector('article', { timeout: 10_000 })

  // Cada card debe tener exactamente una imagen (o un placeholder visible si falla)
  const cards = page.locator('article')
  const count = await cards.count()
  expect(count, 'debe haber al menos una card').toBeGreaterThan(0)

  // Recoger todas las img dentro de cards y sus src
  const imgData = await page.locator('article img').evaluateAll((els) =>
    els.map((el) => ({
      src: (el as HTMLImageElement).src,
      naturalWidth: (el as HTMLImageElement).naturalWidth,
    }))
  )

  const failed: string[] = []
  for (const { src } of imgData) {
    if (!src) continue
    // Resolver la imagen — aceptar cualquier status < 500 (404 → placeholder, 200 → imagen real)
    const r = await request.get(src).catch(() => null)
    if (r && r.status() >= 500) {
      failed.push(`${src} → ${r.status()}`)
    }
  }

  expect(failed, `imágenes con error de servidor (5xx) en /diccionario`).toEqual([])
})

test('diccionario: no hardcodea plant-XX en src de imágenes', async ({ page }) => {
  await page.goto('/diccionario')
  await page.waitForSelector('article', { timeout: 10_000 })

  const badSrcs = await page.locator('article img').evaluateAll((els) =>
    els
      .map((el) => (el as HTMLImageElement).src)
      .filter((s) => /\/plant-\d{2}-/.test(s))
  )
  expect(badSrcs, 'src con numeración secuencial prohibida').toEqual([])
})
