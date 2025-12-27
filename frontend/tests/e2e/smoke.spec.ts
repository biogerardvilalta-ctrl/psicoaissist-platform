import { test, expect } from '@playwright/test';

test.describe('Smoke Validation', () => {

    test('HomePage loads successfully', async ({ page }) => {
        // 1. Visit Home
        await page.goto('/');

        // 2. Check for Title / Header
        await expect(page).toHaveTitle(/PsicoAIssist/);
        await expect(page.getByRole('heading', { name: /Potencia tu práctica/i })).toBeVisible();

        // 3. Check for Login Link
        const loginLink = page.getByRole('link', { name: /iniciar sesión/i });
        await expect(loginLink).toBeVisible();
    });

    test('Login Flow (Demo User)', async ({ page }) => {
        // Set viewport to avoid Recharts issues
        await page.setViewportSize({ width: 1280, height: 800 });

        // 1. Go to Login
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        await page.goto('/auth/login');

        // 2. Fill Credentials
        await page.fill('input[type="email"]', 'video.demo@psicoaissist.com');
        await page.fill('input[type="password"]', 'password123');

        // 3. Submit
        const loginResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/login'));
        await page.click('button[type="submit"]');
        const loginResponse = await loginResponsePromise;
        console.log(`API RESPONSE STATUS: ${loginResponse.status()}`);
        console.log(`API BODY: ${await loginResponse.text()}`);

        // 4. Verify Redirect to Dashboard (Increased timeout)
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // 5. Verify Dashboard Loaded
        // Check for greeting which confirms login and layout
        await expect(page.locator('body')).toContainText('Hola, Dra. Andrea', { timeout: 15000 });

        console.log('✅ Dashboard loaded with user greeting');
    });

});
