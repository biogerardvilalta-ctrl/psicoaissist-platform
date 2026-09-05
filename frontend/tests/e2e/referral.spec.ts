import { test, expect } from '@playwright/test';

test.describe('Referral System E2E', () => {

    test('Full Referral Cycle', async ({ browser }) => {
        // --- 1. Register User A (Referrer) ---
        const contextA = await browser.newContext();
        const pageA = await contextA.newPage();
        const referrerEmail = `referrer_${Date.now()}@test.com`;
        const referrerPass = 'password123';
        const referrerName = 'ReferrerUser';

        await pageA.goto('/auth/register?plan=pro');
        await pageA.fill('#firstName', referrerName);
        await pageA.fill('#lastName', 'Test');
        await pageA.fill('#email', referrerEmail);
        await pageA.fill('#professionalNumber', '99999');
        await pageA.selectOption('#country', 'España');
        await pageA.fill('#password', referrerPass);
        await pageA.fill('#confirmPassword', referrerPass);
        await pageA.check('#legalLiabilityAccepted');
        await pageA.check('#termsAccepted');

        const registerResponsePromiseA = pageA.waitForResponse(resp => resp.url().includes('/auth/register'));
        await pageA.click('button[type="submit"]');
        const registerResponseA = await registerResponsePromiseA;
        expect(registerResponseA.status()).toBe(201);

        const registerDataA = await registerResponseA.json();
        const referralCode = registerDataA.user.referralCode;
        console.log(`User A Registered. Code: ${referralCode}`);
        expect(referralCode).toBeTruthy();

        // Manually navigate to dashboard because Stripe error might keep us on register page
        await pageA.goto('/dashboard');
        await expect(pageA).toHaveURL(/\/dashboard/, { timeout: 30000 });

        // --- 2. Register User B (Referred) ---
        const contextB = await browser.newContext();
        const pageB = await contextB.newPage();
        const refereeEmail = `referee_${Date.now()}@test.com`;

        await pageB.goto('/auth/register?plan=pro');
        await pageB.fill('#firstName', 'RefereeUser');
        await pageB.fill('#lastName', 'Test');
        await pageB.fill('#email', refereeEmail);
        await pageB.fill('#professionalNumber', '88888');
        await pageB.selectOption('#country', 'España');
        await pageB.fill('#password', referrerPass);
        await pageB.fill('#confirmPassword', referrerPass);
        await pageB.fill('#referralCode', referralCode); // Use the code!
        await pageB.check('#legalLiabilityAccepted');
        await pageB.check('#termsAccepted');

        const registerResponsePromiseB = pageB.waitForResponse(resp => resp.url().includes('/auth/register'));
        await pageB.click('button[type="submit"]');
        const registerResponseB = await registerResponsePromiseB;
        expect(registerResponseB.status()).toBe(201);
        console.log('User B Registered with code.');

        // --- 3. Verify User A Count ---
        // User A is already logged in and on the dashboard in contextA, just refresh
        await pageA.reload();
        await expect(pageA).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Check for Greeting first to confirm Dashboard load
        await expect(pageA.locator('body')).toContainText(/(Hola|Hello), ReferrerUser/, { timeout: 15000 });

        // Check Widget "Invita y Gana" / "Invite & Earn" -> "Referidos" / "Referrals"
        await expect(pageA.locator('body')).toContainText(/(Referidos|Referrals)/);
        // We look for "1" specifically in the widget area
        const widget = pageA.locator('text=/(Invita y Gana|Invite & Earn)/i').locator('..').locator('..');
        
        // Wait, text= regex might be tricky in Playwright, better to use getByText
        const widgetRegex = pageA.getByText(/(Invita y Gana|Invite & Earn)/i).locator('..').locator('..');
        await expect(widgetRegex).toContainText('1', { timeout: 10000 });

        console.log('Verified: Referral count is 1');
        
        await contextA.close();
        await contextB.close();
    });

});
