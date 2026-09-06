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

        // Wait for redirect to dashboard directly (auto-login)
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
    });

    test('Can start a simulator chat and receive response', async ({ page }) => {
        // 1. Navigate to Simulator
        await page.goto('/dashboard/simulator');
        await expect(page).toHaveURL(/\/dashboard\/simulator/);

        // 2. Start Simulation (Synthetic Patient)
        const startButton = page.getByRole('button', { name: /(Comenzar Simulación|Start Simulation)/i });
        await expect(startButton).toBeVisible({ timeout: 15000 });
        await startButton.click();

        // 3. Wait for Simulation to load
        const endButton = page.getByRole('button', { name: /(Finalizar Sesión|End Session)/i });
        await expect(endButton).toBeVisible({ timeout: 30000 });

        // 4. Send Message via Text Input
        const input = page.locator('input[name="message"]');
        await expect(input).toBeVisible();

        const testMessage = `Hola, ¿cómo estás? [Test-${Date.now()}]`;
        await input.fill(testMessage);

        // Mock AI response to bypass backend logic and prevent test from hanging
        await page.route('**/api/v1/simulator/chat', async route => {
            const json = { response: 'Això és una resposta simulada de la IA.' };
            await route.fulfill({ json });
        });

        // Click Send
        await page.click('button[type="submit"]');

        // 5. Verify User Message Appears
        await expect(page.locator(`text=${testMessage}`)).toBeVisible();

        // 6. Verify AI Response (Wait for invisible "Escribiendo..." or new bubble)
        await expect(page.locator('.bg-gray-100').first()).toBeVisible({ timeout: 30000 });

        console.log('Chat verified. Requesting evaluation...');

        // Mock AI evaluate
        await page.route('**/api/v1/simulator/evaluate', async route => {
            const json = {
                report: '# Informe de Supervisión Detallado\n\n## Empatía\nBona.\n\n## Eficacia Clínica\nBona.',
                metrics: { empathy: 4, clinicalEfficacy: 4 }
            };
            await route.fulfill({ json });
        });

        // 7. End Session & Request Evaluation
        await expect(endButton).toBeVisible();
        await endButton.click();

        // 8. Verify Evaluation Report
        // Expect "Informe de Supervisión Detallado" or Catalan/English equivalents
        await expect(page.getByText(/Informe de Supervisión Detallado|Informe de Supervisió Detallat|Detailed Supervision Report/i)).toBeVisible({ timeout: 60000 }); // Generating report takes time

        // Verify Metrics
        // Use specific class selector to avoid strict mode violations (e.g. "Empatía" in text body vs header)
        await expect(page.locator('.text-lg', { hasText: /Empatía|Empathy|Empatia/i }).first()).toBeVisible();
        await expect(page.locator('.text-lg', { hasText: /Eficacia Clínica|Clinical Effectiveness|Eficàcia Clínica/i }).first()).toBeVisible();

        console.log('Simulator Test Passed: Chat and Evaluation verified');
    });
});
