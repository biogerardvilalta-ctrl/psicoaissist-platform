import { test, expect } from '@playwright/test';

test.describe('Public Simulator (The Hook)', () => {

    test('should load demo page and chat with Marta', async ({ page }) => {
        // 1. Navigate to Landing Page
        await page.goto('/');

        // 2. Click on "Probar Simulador"
        await page.click('text=Probar Simulador');

        // 3. Verify URL is /simulator/try
        await expect(page).toHaveURL(/\/simulator\/try/);

        // 4. Verify "Marta" profile is visible (API success)
        await expect(page.getByText('Marta R.')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Ansietat Social')).toBeVisible();

        // 5. Send a message
        const input = page.getByPlaceholder('Escribe tu mensaje...');
        await input.fill('Hola Marta, ¿cómo te sientes hoy?');
        await input.press('Enter');

        // 6. Verify "Escribiendo..." appears
        await expect(page.getByText('Escribiendo...')).toBeVisible();

        // 7. Verify we get a response (Demo mode might be fast, so wait for Any response from model)
        // The model response usually doesn't have a specific class but we check for a bubble that is NOT the user's.
        // User message: bg-blue-600
        // Model message: bg-gray-100
        // We can just wait for the loading to disappear and check count.
        await expect(page.getByText('Escribiendo...')).toBeHidden({ timeout: 15000 });

        // Check if there is a response bubble (gray)
        const bubbles = page.locator('.bg-gray-100.text-gray-800');
        // We expect at least 1 model bubble (if welcome msg is not there, then 1 after our chat. The code implies no welcome msg initially unless hardcoded?)
        // In my code: no initial welcome message in `messages` state. Only after chat.
        // So expect 1.
        await expect(bubbles).toHaveCount(1);
    });
});
