import { test, expect } from '@playwright/test';

test.describe('Referral System E2E', () => {

    test('Full Referral Cycle', async ({ page, browser }) => {
        // --- 1. Register User A (Referrer) ---
        const referrerEmail = `referrer_${Date.now()}@test.com`;
        const referrerPass = 'password123';
        const referrerName = 'ReferrerUser';

        await page.goto('/auth/register');
        await page.fill('#firstName', referrerName);
        await page.fill('#lastName', 'Test');
        await page.fill('#email', referrerEmail);
        await page.fill('#professionalNumber', '99999');
        await page.selectOption('#country', 'España');
        await page.fill('#password', referrerPass);
        await page.fill('#confirmPassword', referrerPass);
        await page.check('#legalLiabilityAccepted');
        await page.check('#termsAccepted');

        // Capture response to get the referral code from the API directly or UI
        const registerResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/register'));
        await page.click('button[type="submit"]');
        const registerResponse = await registerResponsePromise;
        expect(registerResponse.status()).toBe(201);

        const registerData = await registerResponse.json();
        const referralCode = registerData.user.referralCode;
        console.log(`User A Registered. Code: ${referralCode}`);
        expect(referralCode).toBeTruthy();

        // Logout User A (if auto-login) or just go to login -> dashboard -> logout
        // The current flow redirects to login.

        // --- 2. Register User B (Referred) ---
        // Use a new context or incognito to ensure clean state, but standard page is fine since we aren't logged in yet
        const refereeEmail = `referee_${Date.now()}@test.com`;

        await page.goto('/auth/register');
        await page.fill('#firstName', 'RefereeUser');
        await page.fill('#lastName', 'Test');
        await page.fill('#email', refereeEmail);
        await page.fill('#professionalNumber', '88888');
        await page.selectOption('#country', 'España');
        await page.fill('#password', referrerPass);
        await page.fill('#confirmPassword', referrerPass);
        await page.fill('#referralCode', referralCode); // Use the code!
        await page.check('#legalLiabilityAccepted');
        await page.check('#termsAccepted');

        const registerResponseBPromise = page.waitForResponse(resp => resp.url().includes('/auth/register'));
        await page.click('button[type="submit"]');
        const registerResponseB = await registerResponseBPromise;
        expect(registerResponseB.status()).toBe(201);
        console.log('User B Registered with code.');

        // --- 3. Verify User A Count ---
        // Login as User A
        await page.goto('/auth/login');
        await page.fill('input[type="email"]', referrerEmail);
        await page.fill('input[type="password"]', referrerPass);

        const loginResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/login'));
        await page.click('button[type="submit"]');
        const loginResponse = await loginResponsePromise;
        console.log(`Login Status: ${loginResponse.status()}`);

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Check API response for profile or UI Widget
        // Check for Greeting first to confirm Dashboard load
        await expect(page.locator('body')).toContainText('Hola, ReferrerUser', { timeout: 15000 });

        // Check Widget "Invita y Gana" -> "Referidos"
        await expect(page.locator('body')).toContainText('Referidos');
        // We look for "1" specifically in the widget area
        const widget = page.locator('text=Invita y Gana').locator('..').locator('..');
        await expect(widget).toContainText('1', { timeout: 10000 });

        console.log('Verified: Referral count is 1');
    });

});
