# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: simulator.spec.ts >> Simulator E2E >> Can start a simulator chat and receive response
- Location: tests/e2e/simulator.spec.ts:33:9

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /login/
Received string:  "http://localhost:3000/en/auth/register"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × locator resolved to <html lang="en" class="__variable_f367f3">…</html>
       - unexpected value "http://localhost:3000/en/auth/register"

```

```yaml
- banner:
  - link "PsicoAIssist":
    - /url: /en
    - img
    - text: PsicoAIssist
  - navigation:
    - link "Features":
      - /url: /en#features
    - link "Simulator":
      - /url: /en/simulator/try
    - link "Pricing":
      - /url: /en#pricing
    - link "Documentation":
      - /url: /en/docs
    - link "Blog":
      - /url: /en/blog
    - link "Legal":
      - /url: /en/legal?tab=terms
      - img
      - text: Legal
    - button "Cambiar idioma":
      - img
      - text: Cambiar idioma
  - link "For Clinics":
    - /url: /en/clinics
    - img
    - text: For Clinics
  - link "Log in":
    - /url: /en/auth/login
    - img
    - text: Log in
  - link "Try free":
    - /url: /en/auth/register
    - img
    - text: Try free
- button "Cambiar idioma":
  - img
  - text: Cambiar idioma
- img
- heading "Registration successful!" [level=2]
- paragraph:
  - text: We have sent a verification email to
  - strong: simulator_test_1788612808927@test.com
  - text: . Please check your inbox (and spam) and click the link to activate your account.
- link "Go to Login":
  - /url: /en/auth/login
- contentinfo:
  - img
  - text: PsicoAIssist
  - paragraph: Transforming psychological practice with artificial intelligence. We help mental health professionals optimize their time and improve patient care.
  - img
  - text: 100% Secure and Confidential
  - heading "Links" [level=3]
  - list:
    - listitem:
      - link "Documentation":
        - /url: /docs
        - text: Documentation
        - img
    - listitem:
      - link "Privacy Policy":
        - /url: /legal?tab=gdpr
        - text: Privacy Policy
        - img
    - listitem:
      - link "Terms and Conditions":
        - /url: /legal?tab=terms
        - text: Terms and Conditions
        - img
    - listitem:
      - link "Cookie Policy":
        - /url: /legal?tab=cookies
        - text: Cookie Policy
        - img
  - heading "Contact" [level=3]
  - link "suport@psicoaissist.com":
    - /url: mailto:suport@psicoaissist.com
    - img
    - text: suport@psicoaissist.com
  - text: © 2026 PsicoAIssist. All rights reserved.
  - img
  - text: GDPR Compliant
  - img
  - text: AES-256 Encryption
- region "Notifications (F8)":
  - list
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Simulator E2E', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         // Register a new user for the test
  6  |         const email = `simulator_test_${Date.now()}@test.com`;
  7  |         const password = 'password123';
  8  | 
  9  |         await page.goto('/auth/register');
  10 |         await page.fill('#firstName', 'SimUser');
  11 |         await page.fill('#lastName', 'Test');
  12 |         await page.fill('#email', email);
  13 |         await page.fill('#professionalNumber', '12345');
  14 |         await page.selectOption('#country', 'España');
  15 |         await page.fill('#password', password);
  16 |         await page.fill('#confirmPassword', password);
  17 |         await page.check('#legalLiabilityAccepted');
  18 |         await page.check('#termsAccepted');
  19 | 
  20 |         await page.click('button[type="submit"]');
  21 | 
  22 |         // Wait for redirect to login or dashboard. 
  23 |         // Current flow redirects to login with query param.
> 24 |         await expect(page).toHaveURL(/login/);
     |                            ^ Error: expect(page).toHaveURL(expected) failed
  25 | 
  26 |         // Login
  27 |         await page.fill('input[type="email"]', email);
  28 |         await page.fill('input[type="password"]', password);
  29 |         await page.click('button[type="submit"]');
  30 |         await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
  31 |     });
  32 | 
  33 |     test('Can start a simulator chat and receive response', async ({ page }) => {
  34 |         // 1. Navigate to Simulator
  35 |         await page.click('a[href="/dashboard/simulator"]');
  36 |         await expect(page).toHaveURL(/\/dashboard\/simulator/);
  37 | 
  38 |         // 2. Start Simulation (Synthetic Patient)
  39 |         const startButton = page.locator('button:has-text("Comenzar Simulación")');
  40 |         await expect(startButton).toBeVisible({ timeout: 15000 });
  41 |         await startButton.click();
  42 | 
  43 |         // 3. Wait for Simulation to load
  44 |         await expect(page.locator('text=Finalizar Sesión')).toBeVisible({ timeout: 30000 });
  45 | 
  46 |         // 4. Send Message via Text Input
  47 |         const input = page.locator('input[name="message"]');
  48 |         await expect(input).toBeVisible();
  49 | 
  50 |         const testMessage = `Hola, ¿cómo estás? [Test-${Date.now()}]`;
  51 |         await input.fill(testMessage);
  52 | 
  53 |         // Click Send
  54 |         await page.click('button:has-text("Enviar")');
  55 | 
  56 |         // 5. Verify User Message Appears
  57 |         await expect(page.locator(`text=${testMessage}`)).toBeVisible();
  58 | 
  59 |         // 6. Verify AI Response (Wait for invisible "Escribiendo..." or new bubble)
  60 |         await expect(page.locator('.bg-gray-100').first()).toBeVisible({ timeout: 30000 });
  61 | 
  62 |         console.log('Chat verified. Requesting evaluation...');
  63 | 
  64 |         // 7. End Session & Request Evaluation
  65 |         const endButton = page.locator('button:has-text("Finalizar Sesión")');
  66 |         await expect(endButton).toBeVisible();
  67 |         await endButton.click();
  68 | 
  69 |         // 8. Verify Evaluation Report
  70 |         // Expect "Informe de Supervisión Detallado"
  71 |         await expect(page.locator('text=Informe de Supervisión Detallado')).toBeVisible({ timeout: 60000 }); // Generating report takes time
  72 | 
  73 |         // Verify Metrics
  74 |         // Use specific class selector to avoid strict mode violations (e.g. "Empatía" in text body vs header)
  75 |         await expect(page.locator('.text-lg', { hasText: 'Empatía' }).first()).toBeVisible();
  76 |         await expect(page.locator('.text-lg', { hasText: 'Eficacia Clínica' }).first()).toBeVisible();
  77 | 
  78 |         console.log('Simulator Test Passed: Chat and Evaluation verified');
  79 | 
  80 |         // 9. Verify Usage Deduction
  81 |         // Click "Nueva Simulación" to go back to the setup screen
  82 |         await page.click('button:has-text("Nueva Simulación")');
  83 | 
  84 |         // Wait for usage stats to reload
  85 |         await expect(page.locator('text=Casos Clínicos')).toBeVisible();
  86 | 
  87 |         // Expect usage to be at least 1. We use .not.toContainText to allow Playwright to poll until it changes.
  88 |         // Identify the usage text element more specifically if possible, or use text locator.
  89 |         // The text is format: "{used} / {limit} Usados" e.g. "0 / 5 Usados" -> "1 / 5 Usados"
  90 |         const usageLocator = page.locator('text=/\\d+ \\/ \\d+ Usados/');
  91 |         await expect(usageLocator).not.toContainText('0 / 5 Usados', { timeout: 10000 });
  92 | 
  93 |         console.log('Usage updated successfully.');
  94 |     });
  95 | });
  96 | 
```