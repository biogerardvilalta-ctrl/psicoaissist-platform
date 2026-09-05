# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rbac.spec.ts >> RBAC: Agenda Manager Flow >> Professional can create Agenda Manager and Manager can login
- Location: tests/e2e/rbac.spec.ts:6:9

# Error details

```
TimeoutError: page.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "PsicoAIssist" [ref=e5] [cursor=pointer]:
        - /url: /en
      - navigation [ref=e10]:
        - link "Features" [ref=e11] [cursor=pointer]:
          - /url: /en#features
        - link "Simulator" [ref=e12] [cursor=pointer]:
          - /url: /en/simulator/try
        - link "Pricing" [ref=e13] [cursor=pointer]:
          - /url: /en#pricing
        - link "Documentation" [ref=e14] [cursor=pointer]:
          - /url: /en/docs
        - link "Blog" [ref=e15] [cursor=pointer]:
          - /url: /en/blog
        - link "Legal" [ref=e16] [cursor=pointer]:
          - /url: /en/legal?tab=terms
        - button "Cambiar idioma" [ref=e22] [cursor=pointer]
      - generic [ref=e24]:
        - link "For Clinics" [ref=e25] [cursor=pointer]:
          - /url: /en/clinics
        - link "Log in" [ref=e30] [cursor=pointer]:
          - /url: /en/auth/login
        - link "Try free" [ref=e34] [cursor=pointer]:
          - /url: /en/auth/register
  - generic [ref=e38]:
    - button "Cambiar idioma" [ref=e40] [cursor=pointer]
    - generic [ref=e42]:
      - heading "Registration successful!" [level=2] [ref=e47]
      - paragraph [ref=e48]:
        - text: We have sent a verification email to
        - strong [ref=e49]: prof_1788612682948@test.com
        - text: . Please check your inbox (and spam) and click the link to activate your account.
      - link "Go to Login" [ref=e51] [cursor=pointer]:
        - /url: /en/auth/login
  - contentinfo [ref=e52]:
    - generic [ref=e54]:
      - generic [ref=e55]:
        - generic [ref=e56]: PsicoAIssist
        - paragraph [ref=e61]: Transforming psychological practice with artificial intelligence. We help mental health professionals optimize their time and improve patient care.
        - generic [ref=e62]: 100% Secure and Confidential
      - generic [ref=e66]:
        - heading "Links" [level=3] [ref=e67]
        - list [ref=e68]:
          - listitem [ref=e69]:
            - link "Documentation" [ref=e70] [cursor=pointer]:
              - /url: /docs
          - listitem [ref=e75]:
            - link "Privacy Policy" [ref=e76] [cursor=pointer]:
              - /url: /legal?tab=gdpr
          - listitem [ref=e81]:
            - link "Terms and Conditions" [ref=e82] [cursor=pointer]:
              - /url: /legal?tab=terms
          - listitem [ref=e87]:
            - link "Cookie Policy" [ref=e88] [cursor=pointer]:
              - /url: /legal?tab=cookies
      - generic [ref=e93]:
        - heading "Contact" [level=3] [ref=e94]
        - link [ref=e96] [cursor=pointer]:
          - /url: mailto:suport@psicoaissist.com
    - generic [ref=e103]:
      - generic [ref=e104]: © 2026 PsicoAIssist. All rights reserved.
      - generic [ref=e105]:
        - generic [ref=e106]: GDPR Compliant
        - generic [ref=e110]: AES-256 Encryption
  - region "Notifications (F8)":
    - list
  - alert [ref=e114]
```

# Test source

```ts
  1   | 
  2   | import { test, expect } from '@playwright/test';
  3   | 
  4   | test.describe('RBAC: Agenda Manager Flow', () => {
  5   | 
  6   |     test('Professional can create Agenda Manager and Manager can login', async ({ page, request }) => {
  7   |         // --- 1. Register Professional (User A) ---
  8   |         const profEmail = `prof_${Date.now()}@test.com`;
  9   |         const profPass = 'password123';
  10  |         const profName = 'Dr. Test';
  11  | 
  12  |         await page.goto('/auth/register');
  13  |         await page.fill('#firstName', profName);
  14  |         await page.fill('#lastName', 'Professional');
  15  |         await page.fill('#email', profEmail);
  16  |         await page.fill('#professionalNumber', '12345');
  17  |         await page.selectOption('#country', 'España');
  18  |         await page.fill('#password', profPass);
  19  |         await page.fill('#confirmPassword', profPass);
  20  |         await page.check('#legalLiabilityAccepted');
  21  |         await page.check('#termsAccepted');
  22  | 
  23  |         // Capture response
  24  |         const registerResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/register'));
  25  |         await page.click('button[type="submit"]');
  26  |         const registerResponse = await registerResponsePromise;
  27  | 
  28  |         // If auto-login happens, we might not get redirect to login, but dashboard directly
  29  |         // Adjust expectation based on actual flow.
  30  |         // Assuming redirect to login:
  31  |         await expect(page).toHaveURL(/\/auth\/(login|register)/);
  32  | 
  33  |         // Login as Professional
> 34  |         await page.fill('input[type="email"]', profEmail);
      |                    ^ TimeoutError: page.fill: Timeout 15000ms exceeded.
  35  |         await page.fill('input[type="password"]', profPass);
  36  |         const loginResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/login'));
  37  |         await page.click('button[type="submit"]');
  38  |         const loginResponse = await loginResponsePromise;
  39  |         expect(loginResponse.status()).toBe(201);
  40  | 
  41  |         await expect(page).toHaveURL(/\/dashboard/);
  42  | 
  43  |         const loginData = await loginResponse.json();
  44  |         // Validated token extraction
  45  |         const token = loginData.tokens?.accessToken || loginData.access_token;
  46  | 
  47  |         // If token is in cookie, `request` fixture handles it automatically if sharing context? 
  48  |         // No, `request` fixture is separate context usually. 
  49  |         // We can use page.request to share context cookies.
  50  | 
  51  |         // --- 2. Create Agenda Manager via API (User A) ---
  52  |         const managerEmail = `manager_${Date.now()}@test.com`;
  53  |         const managerPass = 'managerpass123';
  54  | 
  55  |         const createManagerResponse = await page.request.post('http://localhost:3001/api/v1/users/agenda-managers', {
  56  |             data: {
  57  |                 email: managerEmail,
  58  |                 password: managerPass,
  59  |                 firstName: 'Agenda',
  60  |                 lastName: 'Manager'
  61  |             },
  62  |             headers: token ? {
  63  |                 'Authorization': `Bearer ${token}`
  64  |             } : undefined
  65  |         });
  66  | 
  67  |         expect(createManagerResponse.status()).toBe(201);
  68  |         const managerData = await createManagerResponse.json();
  69  |         const managerId = managerData.id;
  70  | 
  71  |         // Force link just in case automatic linking is flaky
  72  |         const linkResponse = await page.request.post(`http://localhost:3001/api/v1/users/agenda-managers/${managerId}/link`, {
  73  |             headers: token ? {
  74  |                 'Authorization': `Bearer ${token}`
  75  |             } : undefined
  76  |         });
  77  |         // We expect success (201 created or 200 OK)
  78  |         expect([200, 201]).toContain(linkResponse.status());
  79  | 
  80  |         // --- 3. Logout Professional ---
  81  |         // Clear state to force logout
  82  |         await page.context().clearCookies();
  83  |         await page.evaluate(() => localStorage.clear());
  84  |         await page.goto('/auth/login');
  85  | 
  86  |         // --- 4. Login as Agenda Manager ---
  87  |         await page.fill('input[type="email"]', managerEmail);
  88  |         await page.fill('input[type="password"]', managerPass);
  89  |         await page.click('button[type="submit"]');
  90  | 
  91  |         await expect(page).toHaveURL(/\/dashboard/);
  92  | 
  93  |         // --- 5. Verify Dashboard for Agenda Manager ---
  94  |         // Expect greeting to match
  95  |         await expect(page.locator('body')).toContainText('Hola, Agenda', { timeout: 15000 });
  96  | 
  97  |         // Expect Professional Selector to be visible (critical for Agenda Manager)
  98  |         // From previous tasks, it seems there is a selector in the header or dashboard
  99  |         // Let's look for a select/combobox or specific text "Seleccionar Profesional"
  100 |         // Adjust selector based on actual UI if known, else look for generic text
  101 |         // await expect(page.getByText('Seleccionar Profesional')).toBeVisible(); 
  102 |         // Or check for the professional name we created ("Dr. Test") in a dropdown
  103 | 
  104 |         // Since we don't know the exact UI selector implementation, we check for presence of the managed professional's name
  105 |         // which should be selectable.
  106 |         // BUT strict accessibility role is better.
  107 |         // Let's check if we can see the professional name.
  108 |         // Warning: The dashboard might show "Seleccionado: Dr. Test" or similar.
  109 | 
  110 |         // Verify we can access Sessions page via Dashboard Card
  111 |         // Check if we have professionals assigned
  112 |         const noProsMessage = page.getByText('No tienes profesionales asignados todavía');
  113 |         if (await noProsMessage.isVisible()) {
  114 |             console.error('TEST FAIL: Agenda Manager has no assigned professionals.');
  115 |         }
  116 | 
  117 |         // Agenda Managers do not have a sidebar link for "Sesiones" usually.
  118 |         // They click on the professional card on the dashboard.
  119 |         // Try locating by EMAIL as it is unique and definitely displayed
  120 |         // We know profEmail from the registration step above
  121 |         const cardLocator = page.getByText(profEmail);
  122 | 
  123 |         try {
  124 |             await expect(cardLocator).toBeVisible({ timeout: 5000 });
  125 |             await cardLocator.click();
  126 |         } catch (e) {
  127 |             console.log('Start of Page Content Dump:');
  128 |             console.log(await page.content());
  129 |             console.log('End of Page Content Dump');
  130 |             throw e;
  131 |         }
  132 | 
  133 |         // Check URL includes sessions
  134 |         await expect(page).toHaveURL(/\/dashboard\/sessions/);
```