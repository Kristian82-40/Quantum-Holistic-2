import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: process.env.BASE_URL || 'https://quantum-holistic-2-kristiantroncoso-8620s-projects.vercel.app' },
})
