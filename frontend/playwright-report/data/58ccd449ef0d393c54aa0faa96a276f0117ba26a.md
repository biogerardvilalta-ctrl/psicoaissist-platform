# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scheduling.spec.ts >> Scheduling Conflicts >> Should respect manual blocked blocks
- Location: tests/e2e/scheduling.spec.ts:425:9

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
      - generic [ref=e43]:
        - heading "Join PsicoAIssist" [level=2] [ref=e48]
        - paragraph [ref=e49]: Create your account and start transforming your psychological practice
      - generic [ref=e50]:
        - link "Sign up with Google" [ref=e51] [cursor=pointer]:
          - /url: https://psicoaissist.com/api/v1/auth/google?state=register
        - generic [ref=e57]: Or sign up with email
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - generic [ref=e65]:
              - generic [ref=e66]: First Name
              - textbox "First Name" [ref=e67]:
                - /placeholder: Your first name
                - text: Blocked
            - generic [ref=e68]:
              - generic [ref=e69]: Last Name
              - textbox "Last Name" [ref=e70]:
                - /placeholder: Your last name
                - text: Tester
          - generic [ref=e71]:
            - generic [ref=e72]: Professional Email
            - textbox "Professional Email" [ref=e73]:
              - /placeholder: you@email.com
              - text: prof_blocked_1788612801353_7252@test.com
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]: Professional / License No.
              - textbox "Professional / License No." [ref=e77]:
                - /placeholder: "Ex: License / Assoc. / Tax ID"
                - text: PN1788612801353_7031
            - generic [ref=e78]:
              - generic [ref=e79]: Country
              - combobox "Country" [ref=e80]:
                - option "Selection"
                - option "España" [selected]
                - option "Andorra"
                - option "Francia"
                - option "Otro (UE)"
          - generic [ref=e81]:
            - generic [ref=e82]: Password
            - generic [ref=e83]:
              - textbox "Password" [ref=e84]:
                - /placeholder: Minimum 8 characters
                - text: password123
              - button [ref=e85] [cursor=pointer]
          - generic [ref=e89]:
            - generic [ref=e90]: Confirm Password
            - generic [ref=e91]:
              - textbox "Confirm Password" [ref=e92]:
                - /placeholder: Repeat your password
                - text: password123
              - button [ref=e93] [cursor=pointer]
          - generic [ref=e97]:
            - checkbox "Professional Certification Statement" [checked] [ref=e99]
            - generic [ref=e100]:
              - text: Professional Certification Statement
              - paragraph [ref=e101]:
                - text: I certify that the
                - strong [ref=e102]: professional/license number
                - text: entered is truthful and current. I understand that falsifying this data constitutes professional intrusion and document forgery, entailing corresponding
                - strong [ref=e103]: criminal responsibilities
                - text: according to current regulations.
          - generic [ref=e104]:
            - checkbox "I accept the Terms of Service and Privacy Policy" [checked] [ref=e106]
            - generic [ref=e107]:
              - generic [ref=e108]:
                - text: I accept the
                - link "Terms of Service" [ref=e109] [cursor=pointer]:
                  - /url: /en/dashboard/compliance?tab=terms
                - text: and
                - link "Privacy Policy" [ref=e110] [cursor=pointer]:
                  - /url: /en/dashboard/compliance?tab=gdpr
              - paragraph [ref=e111]: This tool offers clinical support guidance exclusively for psychologists. It does not perform diagnoses nor replace clinical judgment.
        - button "Creating account..." [disabled] [ref=e113]
        - paragraph [ref=e117]:
          - text: By signing up, you accept our
          - link "Terms of Service" [ref=e118] [cursor=pointer]:
            - /url: /en/dashboard/compliance?tab=terms
          - text: and
          - link "Privacy Policy" [ref=e119] [cursor=pointer]:
            - /url: /en/dashboard/compliance?tab=gdpr
        - paragraph [ref=e121]:
          - text: Already have an account?
          - link "Log in" [ref=e122] [cursor=pointer]:
            - /url: /en/auth/login
  - contentinfo [ref=e123]:
    - generic [ref=e125]:
      - generic [ref=e126]:
        - generic [ref=e127]: PsicoAIssist
        - paragraph [ref=e132]: Transforming psychological practice with artificial intelligence. We help mental health professionals optimize their time and improve patient care.
        - generic [ref=e133]: 100% Secure and Confidential
      - generic [ref=e137]:
        - heading "Links" [level=3] [ref=e138]
        - list [ref=e139]:
          - listitem [ref=e140]:
            - link "Documentation" [ref=e141] [cursor=pointer]:
              - /url: /docs
          - listitem [ref=e146]:
            - link "Privacy Policy" [ref=e147] [cursor=pointer]:
              - /url: /legal?tab=gdpr
          - listitem [ref=e152]:
            - link "Terms and Conditions" [ref=e153] [cursor=pointer]:
              - /url: /legal?tab=terms
          - listitem [ref=e158]:
            - link "Cookie Policy" [ref=e159] [cursor=pointer]:
              - /url: /legal?tab=cookies
      - generic [ref=e164]:
        - heading "Contact" [level=3] [ref=e165]
        - link [ref=e167] [cursor=pointer]:
          - /url: mailto:suport@psicoaissist.com
    - generic [ref=e174]:
      - generic [ref=e175]: © 2026 PsicoAIssist. All rights reserved.
      - generic [ref=e176]:
        - generic [ref=e177]: GDPR Compliant
        - generic [ref=e181]: AES-256 Encryption
  - region "Notifications (F8)":
    - list
  - alert [ref=e185]
```

# Test source

```ts
  348 |         await page.evaluate(({ accessToken, tokens, user }) => {
  349 |             localStorage.setItem('psychoai_access_token', accessToken);
  350 |             localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
  351 |             localStorage.setItem('psychoai_user', JSON.stringify(user));
  352 |         }, { accessToken, tokens, user });
  353 | 
  354 |         await page.context().addCookies([
  355 |             { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
  356 |             { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
  357 |         ]);
  358 | 
  359 |         await page.goto('/dashboard');
  360 |         await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
  361 | 
  362 |         const clientRes = await request.post('http://localhost:3001/api/v1/clients', {
  363 |             data: { firstName: 'Buffer', lastName: 'Client', email: 'buffer@test.com' },
  364 |             headers: { 'Authorization': `Bearer ${token}` }
  365 |         });
  366 |         const clientId = await clientRes.json().then(d => d.id);
  367 | 
  368 |         // Configure Schedule with Buffer 15m
  369 |         const bufferPatchRes = await request.patch('http://localhost:3001/api/v1/auth/me', {
  370 |             data: {
  371 |                 workStartHour: '09:00',
  372 |                 workEndHour: '18:00',
  373 |                 defaultDuration: 60,
  374 |                 bufferTime: 15,
  375 |                 scheduleConfig: { holidays: [], blockedBlocks: [] }
  376 |             },
  377 |             headers: { 'Authorization': `Bearer ${token}` }
  378 |         });
  379 | 
  380 |         // Create Session 10:00 - 11:00
  381 |         const targetDate = new Date();
  382 |         targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
  383 |         const dateStr = targetDate.toISOString().split('T')[0];
  384 | 
  385 |         await request.post('http://localhost:3001/api/v1/sessions', {
  386 |             data: {
  387 |                 clientId: clientId,
  388 |                 startTime: `${dateStr}T10:00:00.000Z`,
  389 |                 sessionType: 'INDIVIDUAL'
  390 |             },
  391 |             headers: { 'Authorization': `Bearer ${token}` }
  392 |         });
  393 | 
  394 | 
  395 | 
  396 |         // Verify 11:00 is BLOCKED
  397 |         await page.goto('/dashboard/sessions/new');
  398 |         await page.click('button:has-text("Seleccionar paciente")');
  399 |         await page.getByRole('option', { name: 'Buffer Client' }).click();
  400 |         await page.fill('input[type="date"]', dateStr);
  401 | 
  402 |         await page.waitForTimeout(1000);
  403 |         const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
  404 |         const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');
  405 |         await timeSelectTrigger.click();
  406 | 
  407 |         // With 60m duration + 15m buffer:
  408 |         // Slots: 09:00, 10:15, 11:30, 12:45...
  409 | 
  410 |         // 11:00 Should be hidden (not generated)
  411 |         await expect(page.getByRole('option', { name: '11:00', exact: true })).toBeHidden();
  412 | 
  413 |         // 11:30 Should be visible (First available slot after 10:15 blocked by 10:00 session)
  414 |         // Wait, 10:15 slot collides with 10:00-11:00 session?
  415 |         // Slot 10:15-11:15 (EndBuf 11:30). Session 10:00-11:00 (EndBuf 11:15).
  416 |         // 10:15 < 11:15 Yes. 11:30 > 10:00 Yes. Collision.
  417 | 
  418 |         // Next slot 11:30.
  419 |         // Slot 11:30-12:30. Session 10:00-11:00 (EndBuf 11:15).
  420 |         // 11:30 > 11:15. No Collision.
  421 | 
  422 |         await expect(page.getByRole('option', { name: '11:30', exact: true })).toBeVisible();
  423 |     });
  424 | 
  425 |     test('Should respect manual blocked blocks', async ({ page, request }) => {
  426 |         const profEmail = `prof_blocked_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  427 |         const profPass = 'password123';
  428 |         const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  429 | 
  430 |         // Register
  431 |         await page.goto('/auth/register');
  432 |         await page.fill('#firstName', 'Blocked');
  433 |         await page.fill('#lastName', 'Tester');
  434 |         await page.fill('#email', profEmail);
  435 |         await page.fill('#professionalNumber', profNum);
  436 |         await page.selectOption('#country', 'España');
  437 |         await page.fill('#password', profPass);
  438 |         await page.fill('#confirmPassword', profPass);
  439 |         await page.check('#legalLiabilityAccepted');
  440 |         await page.check('#termsAccepted');
  441 |         await page.click('button[type="submit"]');
  442 |         await expect(page).toHaveURL(/\/auth\/(login|register)/, { timeout: 30000 });
  443 | 
  444 |         // Login API & Inject
  445 |         const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
  446 |             data: { email: profEmail, password: profPass }
  447 |         });
> 448 |         expect(loginRes.ok()).toBeTruthy();
      |                               ^ Error: expect(received).toBeTruthy()
  449 |         const loginData = await loginRes.json();
  450 |         const { tokens, user } = loginData;
  451 |         const accessToken = tokens.accessToken;
  452 |         const token = accessToken;
  453 | 
  454 |         await page.goto('/auth/login');
  455 |         await page.evaluate(({ accessToken, tokens, user }) => {
  456 |             localStorage.setItem('psychoai_access_token', accessToken);
  457 |             localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
  458 |             localStorage.setItem('psychoai_user', JSON.stringify(user));
  459 |         }, { accessToken, tokens, user });
  460 | 
  461 |         await page.context().addCookies([
  462 |             { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
  463 |             { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
  464 |         ]);
  465 | 
  466 |         await page.goto('/dashboard');
  467 |         await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
  468 | 
  469 |         const clientRes = await request.post('http://localhost:3001/api/v1/clients', {
  470 |             data: { firstName: 'Blocked', lastName: 'Client', email: 'blocked@test.com' },
  471 |             headers: { 'Authorization': `Bearer ${token}` }
  472 |         });
  473 | 
  474 |         const targetDate = new Date();
  475 |         targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
  476 |         const dateStr = targetDate.toISOString().split('T')[0];
  477 | 
  478 |         // Block 12:00-14:00 (Lunch)
  479 |         await request.patch('http://localhost:3001/api/v1/auth/me', {
  480 |             data: {
  481 |                 workStartHour: '09:00',
  482 |                 workEndHour: '18:00',
  483 |                 scheduleConfig: {
  484 |                     holidays: [],
  485 |                     blockedBlocks: [{ date: dateStr, start: '12:00', end: '14:00' }]
  486 |                 }
  487 |             },
  488 |             headers: { 'Authorization': `Bearer ${token}` }
  489 |         });
  490 | 
  491 |         await page.goto('/dashboard/sessions/new');
  492 |         await page.click('button:has-text("Seleccionar paciente")');
  493 |         await page.getByRole('option', { name: 'Blocked Client' }).click();
  494 |         await page.fill('input[type="date"]', dateStr);
  495 | 
  496 |         await page.waitForTimeout(1000);
  497 |         const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
  498 |         const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');
  499 |         await timeSelectTrigger.click();
  500 | 
  501 |         // 12:00 and 13:00 should be hidden
  502 |         await expect(page.getByRole('option', { name: '12:00', exact: true })).toBeHidden();
  503 |         await expect(page.getByRole('option', { name: '13:00', exact: true })).toBeHidden();
  504 | 
  505 |         // 10:00 and 15:00 should be visible (11:00 might be edge case collision)
  506 |         await expect(page.getByRole('option', { name: '10:00', exact: true })).toBeVisible();
  507 |         await expect(page.getByRole('option', { name: '15:00', exact: true })).toBeVisible();
  508 |     });
  509 | 
  510 | });
  511 | 
```