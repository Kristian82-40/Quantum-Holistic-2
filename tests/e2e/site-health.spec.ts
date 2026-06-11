import { test, expect } from '@playwright/test'

const routes = ['/', '/blog']
for (const r of routes) {
  test(`render sin errores: ${r}`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', m => m.type() === 'error' && errors.push(m.text()))
    const resp = await page.goto(r)
    expect(resp?.status(), `status de ${r}`).toBeLessThan(400)
    expect(errors, `errores de consola en ${r}`).toEqual([])
  })
}
