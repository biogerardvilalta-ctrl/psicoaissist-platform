import { test, expect } from '@playwright/test';

test.describe('Simulator E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Register a new user for the test
        const email = `simulator_test_${Date.now()}@test.com`;
        const password = 'password123';

        await page.goto('/auth/register');
        await page.fill('#firstName', 'SimUser');
        await page.fill('#lastName', 'Test');
        await page.fill('#email', email);
        await page.fill('#professionalNumber', '12345');
        await page.selectOption('#country', 'España');
        await page.fill('#password', password);
        await page.fill('#confirmPassword', password);
        await page.check('#legalLiabilityAccepted');
        await page.check('#termsAccepted');

        await page.click('button[type="submit"]');

        // Wait for redirect to login or dashboard. 
        // Current flow redirects to login with query param.
        await expect(page).toHaveURL(/login/);

        // Login
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
    });

    test('Can start a simulator chat and receive response', async ({ page }) => {
        // 1. Navigate to Simulator
        await page.click('a[href="/dashboard/simulator"]');
        await expect(page).toHaveURL(/\/dashboard\/simulator/);

        // 2. Start Simulation (Synthetic Patient)
        const startButton = page.locator('button:has-text("Comenzar Simulación")');
        await expect(startButton).toBeVisible({ timeout: 15000 });
        await startButton.click();

        // 3. Wait for Simulation to load
        await expect(page.locator('text=Finalizar Sesión')).toBeVisible({ timeout: 30000 });

        // 4. Send Message via Text Input
        const input = page.locator('input[name="message"]');
        await expect(input).toBeVisible();

        const testMessage = `Hola, ¿cómo estás? [Test-${Date.now()}]`;
        await input.fill(testMessage);

        // Click Send
        await page.click('button:has-text("Enviar")');

        // 5. Verify User Message Appears
        await expect(page.locator(`text=${testMessage}`)).toBeVisible();

        // 6. Verify AI Response (Wait for invisible "Escribiendo..." or new bubble)
        await expect(page.locator('.bg-gray-100').first()).toBeVisible({ timeout: 30000 });

        console.log('Chat verified. Requesting evaluation...');

        // 7. End Session & Request Evaluation
        const endButton = page.locator('button:has-text("Finalizar Sesión")');
        await expect(endButton).toBeVisible();
        await endButton.click();

        // 8. Verify Evaluation Report
        // Expect "Informe de Supervisión Detallado"
        await expect(page.locator('text=Informe de Supervisión Detallado')).toBeVisible({ timeout: 60000 }); // Generating report takes time

        // Verify Metrics
        await expect(page.locator('text=Empatía')).toBeVisible();
        await expect(page.locator('text=Eficacia Clínica')).toBeVisible();

        console.log('Simulator Test Passed: Chat and Evaluation verified');
    });
});
