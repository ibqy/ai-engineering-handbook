import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:4173/ai-engineering-handbook/', browserName: 'chromium', channel: 'chromium', screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/ai-engineering-handbook/',
    reuseExistingServer: !process.env.CI
  }
})
