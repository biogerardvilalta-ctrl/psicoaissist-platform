# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Validation >> Login Flow (Demo User)
- Location: tests/e2e/smoke.spec.ts:18:9

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "http://localhost:3000/en/auth/login"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × locator resolved to <html lang="en" class="__variable_f367f3">…</html>
       - unexpected value "http://localhost:3000/en/auth/login"

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
- heading "Welcome back" [level=2]
- paragraph: Access your PsicoAIssist account
- link "Continue with Google":
  - /url: https://psicoaissist.com/api/v1/auth/google
  - img
  - text: Continue with Google
- text: Or continue with email Email
- textbox "Email":
  - /placeholder: you@email.com
  - text: video.demo@psicoaissist.com
- text: Password
- textbox "Password":
  - /placeholder: Your password
  - text: password123
- button:
  - img
- checkbox "Remember me"
- text: Remember me
- link "Forgot your password?":
  - /url: /en/auth/forgot-password
- button "Log in":
  - img
  - text: Log in
- paragraph:
  - text: Don't have an account?
  - link "Sign up for free":
    - /url: /en/auth/register
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
  3  | test.describe('Smoke Validation', () => {
  4  | 
  5  |     test('HomePage loads successfully', async ({ page }) => {
  6  |         // 1. Visit Home
  7  |         await page.goto('/');
  8  | 
  9  |         // 2. Check for Title / Header
  10 |         await expect(page).toHaveTitle(/PsicoAIssist/);
  11 |         await expect(page.getByRole('heading', { name: /(Potencia|Empower)/i }).first()).toBeVisible();
  12 | 
  13 |         // 3. Check for Login Link
  14 |         const loginLink = page.getByRole('link', { name: /(iniciar sesión|log in|sign in)/i });
  15 |         await expect(loginLink).toBeVisible();
  16 |     });
  17 | 
  18 |     test('Login Flow (Demo User)', async ({ page }) => {
  19 |         // Set viewport to avoid Recharts issues
  20 |         await page.setViewportSize({ width: 1280, height: 800 });
  21 | 
  22 |         // 1. Go to Login
  23 |         page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
  24 |         await page.goto('/auth/login');
  25 | 
  26 |         // 2. Fill Credentials
  27 |         await page.fill('input[type="email"]', 'video.demo@psicoaissist.com');
  28 |         await page.fill('input[type="password"]', 'password123');
  29 | 
  30 |         // 3. Submit
  31 |         const loginResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/login'));
  32 |         await page.click('button[type="submit"]');
  33 |         const loginResponse = await loginResponsePromise;
  34 |         console.log(`API RESPONSE STATUS: ${loginResponse.status()}`);
  35 |         console.log(`API BODY: ${await loginResponse.text()}`);
  36 | 
  37 |         // 4. Verify Redirect to Dashboard (Increased timeout)
> 38 |         await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
     |                            ^ Error: expect(page).toHaveURL(expected) failed
  39 | 
  40 |         // 5. Verify Dashboard Loaded
  41 |         // Check for greeting which confirms login and layout
  42 |         await expect(page.locator('body')).toContainText(/(Hola|Hello), Dra\. Andrea/, { timeout: 15000 });
  43 | 
  44 |         console.log('✅ Dashboard loaded with user greeting');
  45 |     });
  46 | 
  47 | });
  48 | 
```