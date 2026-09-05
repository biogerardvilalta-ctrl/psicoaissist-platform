# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scheduling.spec.ts >> Scheduling Conflicts >> Should respect holidays in schedule configuration
- Location: tests/e2e/scheduling.spec.ts:233:9

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
                - text: Holiday
            - generic [ref=e68]:
              - generic [ref=e69]: Last Name
              - textbox "Last Name" [ref=e70]:
                - /placeholder: Your last name
                - text: Tester
          - generic [ref=e71]:
            - generic [ref=e72]: Professional Email
            - textbox "Professional Email" [ref=e73]:
              - /placeholder: you@email.com
              - text: prof_holiday_1788612786181_765@test.com
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]: Professional / License No.
              - textbox "Professional / License No." [ref=e77]:
                - /placeholder: "Ex: License / Assoc. / Tax ID"
                - text: PN1788612786181_4648
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
  156 | 
  157 |         await page.goto('/auth/login');
  158 |         await page.evaluate(({ accessToken, tokens, user }) => {
  159 |             localStorage.setItem('psychoai_access_token', accessToken);
  160 |             localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
  161 |             localStorage.setItem('psychoai_user', JSON.stringify(user));
  162 |         }, { accessToken, tokens, user });
  163 | 
  164 |         await page.context().addCookies([
  165 |             { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
  166 |             { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
  167 |         ]);
  168 | 
  169 |         await page.goto('/dashboard');
  170 |         await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
  171 | 
  172 |         // --- 1.1 Configure Schedule ---
  173 |         await request.patch('http://localhost:3001/api/v1/auth/me', {
  174 |             data: {
  175 |                 workStartHour: '00:00',
  176 |                 workEndHour: '23:59',
  177 |                 defaultDuration: 60,
  178 |                 bufferTime: 0,
  179 |                 scheduleConfig: { holidays: [], blockedBlocks: [] }
  180 |             },
  181 |             headers: { 'Authorization': `Bearer ${token}` }
  182 |         });
  183 | 
  184 |         // --- 2. Create Client ---
  185 |         const clientRes = await request.post('http://localhost:3001/api/v1/clients', {
  186 |             data: { firstName: 'Overlap', lastName: 'Client', email: 'overlap@test.com' },
  187 |             headers: { 'Authorization': `Bearer ${token}` }
  188 |         });
  189 |         const clientData = await clientRes.json();
  190 |         const clientId = clientData.id;
  191 | 
  192 |         // --- 3. Create Session at 14:30 (Partial Overlap) ---
  193 |         const targetDate = new Date();
  194 |         targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
  195 |         const dateStr = targetDate.toISOString().split('T')[0];
  196 |         const overlapStart = new Date(`${dateStr}T14:30:00`);
  197 | 
  198 |         await request.post('http://localhost:3001/api/v1/sessions', {
  199 |             data: {
  200 |                 clientId: clientId,
  201 |                 startTime: overlapStart.toISOString(),
  202 |                 sessionType: 'INDIVIDUAL'
  203 |             },
  204 |             headers: { 'Authorization': `Bearer ${token}` }
  205 |         });
  206 | 
  207 |         // --- 4. Check UI Slots ---
  208 |         await page.goto('/dashboard/sessions/new');
  209 | 
  210 |         await page.click('button:has-text("Seleccionar paciente")');
  211 |         await page.getByRole('option', { name: 'Overlap Client' }).click();
  212 | 
  213 |         await page.fill('input[type="date"]', dateStr);
  214 | 
  215 |         await page.waitForTimeout(1000);
  216 |         await expect(page.getByText('Cargando horarios...')).toBeHidden();
  217 | 
  218 |         const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
  219 |         const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');
  220 | 
  221 |         await expect(timeSelectTrigger).toBeEnabled({ timeout: 10000 });
  222 |         await timeSelectTrigger.click();
  223 | 
  224 |         // Verify 14:00 is MISSING
  225 |         const hour14 = page.getByRole('option', { name: '14:00', exact: true });
  226 |         await expect(hour14).toBeHidden();
  227 | 
  228 |         // Verify 16:00 IS VISIBLE
  229 |         const hour16 = page.getByRole('option', { name: '16:00', exact: true });
  230 |         await expect(hour16).toBeVisible();
  231 |     });
  232 | 
  233 |     test('Should respect holidays in schedule configuration', async ({ page, request }) => {
  234 |         const profEmail = `prof_holiday_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  235 |         const profPass = 'password123';
  236 |         const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  237 | 
  238 |         // Register
  239 |         await page.goto('/auth/register');
  240 |         await page.fill('#firstName', 'Holiday');
  241 |         await page.fill('#lastName', 'Tester');
  242 |         await page.fill('#email', profEmail);
  243 |         await page.fill('#professionalNumber', profNum);
  244 |         await page.selectOption('#country', 'España');
  245 |         await page.fill('#password', profPass);
  246 |         await page.fill('#confirmPassword', profPass);
  247 |         await page.check('#legalLiabilityAccepted');
  248 |         await page.check('#termsAccepted');
  249 |         await page.click('button[type="submit"]');
  250 |         await expect(page).toHaveURL(/\/auth\/(login|register)/, { timeout: 30000 });
  251 | 
  252 |         // Login API & Inject
  253 |         const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
  254 |             data: { email: profEmail, password: profPass }
  255 |         });
> 256 |         expect(loginRes.ok()).toBeTruthy();
      |                               ^ Error: expect(received).toBeTruthy()
  257 |         const loginData = await loginRes.json();
  258 |         const { tokens, user } = loginData;
  259 |         const accessToken = tokens.accessToken;
  260 |         const token = accessToken;
  261 | 
  262 |         await page.goto('/auth/login');
  263 |         await page.evaluate(({ accessToken, tokens, user }) => {
  264 |             localStorage.setItem('psychoai_access_token', accessToken);
  265 |             localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
  266 |             localStorage.setItem('psychoai_user', JSON.stringify(user));
  267 |         }, { accessToken, tokens, user });
  268 | 
  269 |         await page.context().addCookies([
  270 |             { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
  271 |             { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
  272 |         ]);
  273 | 
  274 |         await page.goto('/dashboard');
  275 |         await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
  276 | 
  277 |         // Create Client
  278 |         await request.post('http://localhost:3001/api/v1/clients', {
  279 |             data: { firstName: 'Holiday', lastName: 'Client', email: 'holiday@test.com' },
  280 |             headers: { 'Authorization': `Bearer ${token}` }
  281 |         });
  282 | 
  283 |         const targetDate = new Date();
  284 |         targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
  285 |         const dateStr = targetDate.toISOString().split('T')[0];
  286 | 
  287 |         // Configure Schedule with Holiday
  288 |         await request.patch('http://localhost:3001/api/v1/auth/me', {
  289 |             data: {
  290 |                 workStartHour: '09:00',
  291 |                 workEndHour: '18:00',
  292 |                 scheduleConfig: { holidays: [dateStr], blockedBlocks: [] }
  293 |             },
  294 |             headers: { 'Authorization': `Bearer ${token}` }
  295 |         });
  296 | 
  297 |         // Verify No Slots Available
  298 |         await page.goto('/dashboard/sessions/new');
  299 |         await page.click('button:has-text("Seleccionar paciente")');
  300 |         await page.getByRole('option', { name: 'Holiday Client' }).click();
  301 |         await page.fill('input[type="date"]', dateStr);
  302 | 
  303 |         await page.waitForTimeout(1000);
  304 |         await expect(page.getByText('Cargando horarios...')).toBeHidden();
  305 | 
  306 |         const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
  307 |         const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');
  308 | 
  309 |         if (await timeSelectTrigger.isEnabled()) {
  310 |             await timeSelectTrigger.click();
  311 |             const options = await page.getByRole('option').allInnerTexts();
  312 |             expect(options.length).toBe(0);
  313 |         } else {
  314 |             expect(await timeSelectTrigger.isDisabled()).toBeTruthy();
  315 |         }
  316 |     });
  317 | 
  318 |     test('Should respect buffer time between sessions', async ({ page, request }) => {
  319 |         const profEmail = `prof_buffer_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  320 |         const profPass = 'password123';
  321 |         const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  322 | 
  323 |         // Register
  324 |         await page.goto('/auth/register');
  325 |         await page.fill('#firstName', 'Buffer');
  326 |         await page.fill('#lastName', 'Tester');
  327 |         await page.fill('#email', profEmail);
  328 |         await page.fill('#professionalNumber', profNum);
  329 |         await page.selectOption('#country', 'España');
  330 |         await page.fill('#password', profPass);
  331 |         await page.fill('#confirmPassword', profPass);
  332 |         await page.check('#legalLiabilityAccepted');
  333 |         await page.check('#termsAccepted');
  334 |         await page.click('button[type="submit"]');
  335 |         await expect(page).toHaveURL(/\/auth\/(login|register)/, { timeout: 30000 });
  336 | 
  337 |         // Login API & Inject
  338 |         const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
  339 |             data: { email: profEmail, password: profPass }
  340 |         });
  341 |         expect(loginRes.ok()).toBeTruthy();
  342 |         const loginData = await loginRes.json();
  343 |         const { tokens, user } = loginData;
  344 |         const accessToken = tokens.accessToken;
  345 |         const token = accessToken;
  346 | 
  347 |         await page.goto('/auth/login');
  348 |         await page.evaluate(({ accessToken, tokens, user }) => {
  349 |             localStorage.setItem('psychoai_access_token', accessToken);
  350 |             localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
  351 |             localStorage.setItem('psychoai_user', JSON.stringify(user));
  352 |         }, { accessToken, tokens, user });
  353 | 
  354 |         await page.context().addCookies([
  355 |             { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
  356 |             { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
```