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
test('todas las imágenes del diccionario dan 200', async ({ page, request }) => {
  await page.goto('/diccionario')
  const srcs = await page.locator('img').evaluateAll(els => els.map(e => (e as HTMLImageElement).src).filter(Boolean))
  for (const s of srcs) expect((await request.get(s)).status(), s).toBe(200)
})
