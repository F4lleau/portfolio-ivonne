import { defineConfig } from '@playwright/test';
import { randomBytes } from 'node:crypto';
process.env.E2E_ADMIN_PASSWORD ||= randomBytes(24).toString('hex');
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    headless: true,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node scripts/e2e-backend.mjs',
      url: 'http://127.0.0.1:8001/api/profile/',
      timeout: 120000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      env: { API_PROXY_TARGET: 'http://127.0.0.1:8001' },
      timeout: 60000,
      reuseExistingServer: false,
    },
  ],
});
