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

test('diccionario: cada card carga sin 5xx', async ({ page, request }) => {
  await page.goto('/diccionario')
  await page.waitForSelector('article, a[href^="/diccionario/"]', { timeout: 10_000 })

  const imgData = await page.locator('img').evaluateAll((els) =>
    els.map((el) => (el as HTMLImageElement).src).filter(Boolean)
  )

  const failed: string[] = []
  for (const src of imgData) {
    const r = await request.get(src).catch(() => null)
    if (r && r.status() >= 500) failed.push(`${src} → ${r.status()}`)
  }
  expect(failed, 'imágenes con error 5xx en /diccionario').toEqual([])
})

test('diccionario: ningún src contiene plant-XX (numeración legacy)', async ({ page }) => {
  await page.goto('/diccionario')
  await page.waitForSelector('img', { timeout: 10_000 }).catch(() => null)

  const badSrcs = await page.locator('img').evaluateAll((els) =>
    els
      .map((el) => (el as HTMLImageElement).src)
      .filter((s) => /\/plant-\d{2}[-_]/.test(s))
  )
  expect(badSrcs, 'src con numeración secuencial legacy').toEqual([])
})
