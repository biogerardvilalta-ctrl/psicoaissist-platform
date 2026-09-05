# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: referral.spec.ts >> Referral System E2E >> Full Referral Cycle
- Location: tests/e2e/referral.spec.ts:5:9

# Error details

```
TimeoutError: page.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('#referralCode')

```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - banner [ref=f1e2]:
    - generic [ref=f1e4]:
      - link "PsicoAIssist" [ref=f1e5] [cursor=pointer]:
        - /url: /en
      - navigation [ref=f1e10]:
        - link "Features" [ref=f1e11] [cursor=pointer]:
          - /url: /en#features
        - link "Simulator" [ref=f1e12] [cursor=pointer]:
          - /url: /en/simulator/try
        - link "Pricing" [ref=f1e13] [cursor=pointer]:
          - /url: /en#pricing
        - link "Documentation" [ref=f1e14] [cursor=pointer]:
          - /url: /en/docs
        - link "Blog" [ref=f1e15] [cursor=pointer]:
          - /url: /en/blog
        - link "Legal" [ref=f1e16] [cursor=pointer]:
          - /url: /en/legal?tab=terms
        - button "Cambiar idioma" [ref=f1e22] [cursor=pointer]
      - generic [ref=f1e24]:
        - link "For Clinics" [ref=f1e25] [cursor=pointer]:
          - /url: /en/clinics
        - link "Log in" [ref=f1e30] [cursor=pointer]:
          - /url: /en/auth/login
        - link "Try free" [ref=f1e34] [cursor=pointer]:
          - /url: /en/auth/register
  - generic [ref=f1e38]:
    - button "Cambiar idioma" [ref=f1e40] [cursor=pointer]
    - generic [ref=f1e42]:
      - generic [ref=f1e43]:
        - heading "Join PsicoAIssist" [level=2] [ref=f1e48]
        - paragraph [ref=f1e49]: Create your account and start transforming your psychological practice
      - generic [ref=f1e50]:
        - link "Sign up with Google" [ref=f1e51] [cursor=pointer]:
          - /url: https://psicoaissist.com/api/v1/auth/google?state=register
        - generic [ref=f1e57]: Or sign up with email
      - generic [ref=f1e62]:
        - generic [ref=f1e63]:
          - generic [ref=f1e64]:
            - generic [ref=f1e65]:
              - generic [ref=f1e66]: First Name
              - textbox "First Name" [ref=f1e67]:
                - /placeholder: Your first name
                - text: RefereeUser
            - generic [ref=f1e68]:
              - generic [ref=f1e69]: Last Name
              - textbox "Last Name" [ref=f1e70]:
                - /placeholder: Your last name
                - text: Test
          - generic [ref=f1e71]:
            - generic [ref=f1e72]: Professional Email
            - textbox "Professional Email" [ref=f1e73]:
              - /placeholder: you@email.com
              - text: referee_1788612732086@test.com
          - generic [ref=f1e74]:
            - generic [ref=f1e75]:
              - generic [ref=f1e76]: Professional / License No.
              - textbox "Professional / License No." [ref=f1e77]:
                - /placeholder: "Ex: License / Assoc. / Tax ID"
                - text: "88888"
            - generic [ref=f1e78]:
              - generic [ref=f1e79]: Country
              - combobox "Country" [ref=f1e80]:
                - option "Selection"
                - option "España" [selected]
                - option "Andorra"
                - option "Francia"
                - option "Otro (UE)"
          - generic [ref=f1e81]:
            - generic [ref=f1e82]: Password
            - generic [ref=f1e83]:
              - textbox "Password" [ref=f1e84]:
                - /placeholder: Minimum 8 characters
                - text: password123
              - button [ref=f1e85] [cursor=pointer]
          - generic [ref=f1e89]:
            - generic [ref=f1e90]: Confirm Password
            - generic [ref=f1e91]:
              - textbox "Confirm Password" [active] [ref=f1e92]:
                - /placeholder: Repeat your password
                - text: password123
              - button [ref=f1e93] [cursor=pointer]
          - generic [ref=f1e97]:
            - checkbox "Professional Certification Statement" [ref=f1e99]
            - generic [ref=f1e100]:
              - text: Professional Certification Statement
              - paragraph [ref=f1e101]:
                - text: I certify that the
                - strong [ref=f1e102]: professional/license number
                - text: entered is truthful and current. I understand that falsifying this data constitutes professional intrusion and document forgery, entailing corresponding
                - strong [ref=f1e103]: criminal responsibilities
                - text: according to current regulations.
          - generic [ref=f1e104]:
            - checkbox "I accept the Terms of Service and Privacy Policy" [ref=f1e106]
            - generic [ref=f1e107]:
              - generic [ref=f1e108]:
                - text: I accept the
                - link "Terms of Service" [ref=f1e109] [cursor=pointer]:
                  - /url: /en/dashboard/compliance?tab=terms
                - text: and
                - link "Privacy Policy" [ref=f1e110] [cursor=pointer]:
                  - /url: /en/dashboard/compliance?tab=gdpr
              - paragraph [ref=f1e111]: This tool offers clinical support guidance exclusively for psychologists. It does not perform diagnoses nor replace clinical judgment.
        - button "Create free account" [ref=f1e113] [cursor=pointer]
        - paragraph [ref=f1e118]:
          - text: By signing up, you accept our
          - link "Terms of Service" [ref=f1e119] [cursor=pointer]:
            - /url: /en/dashboard/compliance?tab=terms
          - text: and
          - link "Privacy Policy" [ref=f1e120] [cursor=pointer]:
            - /url: /en/dashboard/compliance?tab=gdpr
        - paragraph [ref=f1e122]:
          - text: Already have an account?
          - link "Log in" [ref=f1e123] [cursor=pointer]:
            - /url: /en/auth/login
  - contentinfo [ref=f1e124]:
    - generic [ref=f1e126]:
      - generic [ref=f1e127]:
        - generic [ref=f1e128]: PsicoAIssist
        - paragraph [ref=f1e133]: Transforming psychological practice with artificial intelligence. We help mental health professionals optimize their time and improve patient care.
        - generic [ref=f1e134]: 100% Secure and Confidential
      - generic [ref=f1e138]:
        - heading "Links" [level=3] [ref=f1e139]
        - list [ref=f1e140]:
          - listitem [ref=f1e141]:
            - link "Documentation" [ref=f1e142] [cursor=pointer]:
              - /url: /docs
          - listitem [ref=f1e147]:
            - link "Privacy Policy" [ref=f1e148] [cursor=pointer]:
              - /url: /legal?tab=gdpr
          - listitem [ref=f1e153]:
            - link "Terms and Conditions" [ref=f1e154] [cursor=pointer]:
              - /url: /legal?tab=terms
          - listitem [ref=f1e159]:
            - link "Cookie Policy" [ref=f1e160] [cursor=pointer]:
              - /url: /legal?tab=cookies
      - generic [ref=f1e165]:
        - heading "Contact" [level=3] [ref=f1e166]
        - link [ref=f1e168] [cursor=pointer]:
          - /url: mailto:suport@psicoaissist.com
    - generic [ref=f1e175]:
      - generic [ref=f1e176]: © 2026 PsicoAIssist. All rights reserved.
      - generic [ref=f1e177]:
        - generic [ref=f1e178]: GDPR Compliant
        - generic [ref=f1e182]: AES-256 Encryption
  - region "Notifications (F8)":
    - list
  - alert [ref=f1e186]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Referral System E2E', () => {
  4  | 
  5  |     test('Full Referral Cycle', async ({ page, browser }) => {
  6  |         // --- 1. Register User A (Referrer) ---
  7  |         const referrerEmail = `referrer_${Date.now()}@test.com`;
  8  |         const referrerPass = 'password123';
  9  |         const referrerName = 'ReferrerUser';
  10 | 
  11 |         await page.goto('/auth/register');
  12 |         await page.fill('#firstName', referrerName);
  13 |         await page.fill('#lastName', 'Test');
  14 |         await page.fill('#email', referrerEmail);
  15 |         await page.fill('#professionalNumber', '99999');
  16 |         await page.selectOption('#country', 'España');
  17 |         await page.fill('#password', referrerPass);
  18 |         await page.fill('#confirmPassword', referrerPass);
  19 |         await page.check('#legalLiabilityAccepted');
  20 |         await page.check('#termsAccepted');
  21 | 
  22 |         // Capture response to get the referral code from the API directly or UI
  23 |         const registerResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/register'));
  24 |         await page.click('button[type="submit"]');
  25 |         const registerResponse = await registerResponsePromise;
  26 |         expect(registerResponse.status()).toBe(201);
  27 | 
  28 |         const registerData = await registerResponse.json();
  29 |         const referralCode = registerData.user.referralCode;
  30 |         console.log(`User A Registered. Code: ${referralCode}`);
  31 |         expect(referralCode).toBeTruthy();
  32 | 
  33 |         // Logout User A (if auto-login) or just go to login -> dashboard -> logout
  34 |         // The current flow redirects to login.
  35 | 
  36 |         // --- 2. Register User B (Referred) ---
  37 |         // Use a new context or incognito to ensure clean state, but standard page is fine since we aren't logged in yet
  38 |         const refereeEmail = `referee_${Date.now()}@test.com`;
  39 | 
  40 |         await page.goto('/auth/register');
  41 |         await page.fill('#firstName', 'RefereeUser');
  42 |         await page.fill('#lastName', 'Test');
  43 |         await page.fill('#email', refereeEmail);
  44 |         await page.fill('#professionalNumber', '88888');
  45 |         await page.selectOption('#country', 'España');
  46 |         await page.fill('#password', referrerPass);
  47 |         await page.fill('#confirmPassword', referrerPass);
> 48 |         await page.fill('#referralCode', referralCode); // Use the code!
     |                    ^ TimeoutError: page.fill: Timeout 15000ms exceeded.
  49 |         await page.check('#legalLiabilityAccepted');
  50 |         await page.check('#termsAccepted');
  51 | 
  52 |         const registerResponseBPromise = page.waitForResponse(resp => resp.url().includes('/auth/register'));
  53 |         await page.click('button[type="submit"]');
  54 |         const registerResponseB = await registerResponseBPromise;
  55 |         expect(registerResponseB.status()).toBe(201);
  56 |         console.log('User B Registered with code.');
  57 | 
  58 |         // --- 3. Verify User A Count ---
  59 |         // Login as User A
  60 |         await page.goto('/auth/login');
  61 |         await page.fill('input[type="email"]', referrerEmail);
  62 |         await page.fill('input[type="password"]', referrerPass);
  63 | 
  64 |         const loginResponsePromise = page.waitForResponse(resp => resp.url().includes('/auth/login'));
  65 |         await page.click('button[type="submit"]');
  66 |         const loginResponse = await loginResponsePromise;
  67 |         console.log(`Login Status: ${loginResponse.status()}`);
  68 | 
  69 |         await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  70 | 
  71 |         // Check API response for profile or UI Widget
  72 |         // Check for Greeting first to confirm Dashboard load
  73 |         await expect(page.locator('body')).toContainText(/(Hola|Hello), ReferrerUser/, { timeout: 15000 });
  74 | 
  75 |         // Check Widget "Invita y Gana" -> "Referidos"
  76 |         await expect(page.locator('body')).toContainText('Referidos');
  77 |         // We look for "1" specifically in the widget area
  78 |         const widget = page.locator('text=Invita y Gana').locator('..').locator('..');
  79 |         await expect(widget).toContainText('1', { timeout: 10000 });
  80 | 
  81 |         console.log('Verified: Referral count is 1');
  82 |     });
  83 | 
  84 | });
  85 | 
```