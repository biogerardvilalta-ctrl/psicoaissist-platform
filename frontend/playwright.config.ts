import { defineConfig, devices } from '@playwright/test';

// Force local backend for all E2E tests — never Hetzner/production
const LOCAL_BACKEND = 'http://localhost:3001/api/v1';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60 * 1000,
    expect: {
        timeout: 10 * 1000,
    },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1, // Enable 1 retry locally for robustness
    workers: 1,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        actionTimeout: 15 * 1000,
        navigationTimeout: 30 * 1000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    globalTeardown: './tests/e2e/global-teardown.ts',
    /* Run your local server before starting the tests */
    webServer: {
      // Force NEXT_PUBLIC_API_URL to local backend so tests NEVER hit Hetzner/production
      command: `NEXT_PUBLIC_API_URL=${LOCAL_BACKEND} npm run dev`,
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI, // Always fresh on CI, reuse locally
      timeout: 120 * 1000,
      env: {
        NEXT_PUBLIC_API_URL: LOCAL_BACKEND,
      },
    },
});

