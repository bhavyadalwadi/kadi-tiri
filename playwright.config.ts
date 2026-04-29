import { defineConfig, devices } from '@playwright/test';

const node18 = '/Users/basho00/.nvm/versions/node/v18.20.8/bin/node';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: `${node18} ./node_modules/next/dist/bin/next dev -H 127.0.0.1 -p 3000`,
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_ENABLE_DEBUG_TOOLS: 'false'
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});
