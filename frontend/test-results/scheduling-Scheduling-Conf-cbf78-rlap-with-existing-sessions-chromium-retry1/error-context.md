# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scheduling.spec.ts >> Scheduling Conflicts >> Should remove slots that partially overlap with existing sessions
- Location: tests/e2e/scheduling.spec.ts:129:9

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
                - text: Overlap
            - generic [ref=e68]:
              - generic [ref=e69]: Last Name
              - textbox "Last Name" [ref=e70]:
                - /placeholder: Your last name
                - text: Tester
          - generic [ref=e71]:
            - generic [ref=e72]: Professional Email
            - textbox "Professional Email" [ref=e73]:
              - /placeholder: you@email.com
              - text: prof_overlap_1788612781988_1390@test.com
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]: Professional / License No.
              - textbox "Professional / License No." [ref=e77]:
                - /placeholder: "Ex: License / Assoc. / Tax ID"
                - text: PN1788612781988_1894
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
  51  |         await page.goto('/dashboard');
  52  |         await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
  53  | 
  54  |         // --- 2.1 Configure Schedule ---
  55  |         await request.patch('http://localhost:3001/api/v1/auth/me', {
  56  |             data: {
  57  |                 workStartHour: '00:00',
  58  |                 workEndHour: '23:59',
  59  |                 defaultDuration: 60,
  60  |                 bufferTime: 0,
  61  |                 scheduleConfig: { holidays: [], blockedBlocks: [] }
  62  |             },
  63  |             headers: { 'Authorization': `Bearer ${token}` }
  64  |         });
  65  | 
  66  |         // --- 3. Create Client via API ---
  67  |         const clientRes = await request.post('http://localhost:3001/api/v1/clients', {
  68  |             data: {
  69  |                 firstName: 'Test',
  70  |                 lastName: 'Client',
  71  |                 email: 'client@test.com',
  72  |                 phone: '123456789'
  73  |             },
  74  |             headers: { 'Authorization': `Bearer ${token}` }
  75  |         });
  76  |         expect(clientRes.status()).toBe(201);
  77  |         const clientData = await clientRes.json();
  78  |         const clientId = clientData.id;
  79  | 
  80  |         // --- 4. Prepare Conflict Data ---
  81  |         const targetDate = new Date();
  82  |         targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
  83  |         const dateStr = targetDate.toISOString().split('T')[0];
  84  |         const timeStr = '10:00';
  85  | 
  86  |         // --- 5. Start Booking Flow in UI ---
  87  |         await page.goto('/dashboard/sessions/new');
  88  |         await page.waitForTimeout(2000);
  89  | 
  90  |         await page.click('button:has-text("Seleccionar paciente")');
  91  |         await page.click('div[role="option"]:has-text("Test Client")');
  92  | 
  93  |         await page.fill('input[type="date"]', dateStr);
  94  | 
  95  |         await page.waitForTimeout(1000);
  96  |         await expect(page.getByText('Cargando horarios...')).toBeHidden();
  97  |         const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
  98  |         const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');
  99  |         await expect(timeSelectTrigger).toBeEnabled({ timeout: 10000 });
  100 |         await timeSelectTrigger.click();
  101 | 
  102 |         await page.waitForTimeout(500);
  103 |         await page.getByRole('option', { name: timeStr }).click();
  104 | 
  105 |         const typeContainer = page.locator('div.space-y-2', { has: page.getByText('Tipo de Sesión') });
  106 |         const typeSelectTrigger = typeContainer.locator('button[role="combobox"]');
  107 |         await expect(typeSelectTrigger).toBeEnabled();
  108 |         await typeSelectTrigger.click();
  109 |         await page.click('div[role="option"]:has-text("Individual")');
  110 | 
  111 |         // --- 6. TRIGGER CONFLICT ---
  112 |         const conflictRes = await request.post('http://localhost:3001/api/v1/sessions', {
  113 |             data: {
  114 |                 clientId: clientId,
  115 |                 startTime: new Date(`${dateStr}T${timeStr}:00`).toISOString(),
  116 |                 sessionType: 'INDIVIDUAL'
  117 |             },
  118 |             headers: { 'Authorization': `Bearer ${token}` }
  119 |         });
  120 |         expect(conflictRes.status()).toBe(201);
  121 | 
  122 |         // --- 7. Submit UI Form (Should Fail) ---
  123 |         await page.click('button:has-text("Agendar Sesión")');
  124 | 
  125 |         // --- 8. Verify Error Handling ---
  126 |         await expect(page.getByText(/Error al agendar|ya tiene|ocupado/i).first()).toBeVisible({ timeout: 10000 });
  127 |     });
  128 | 
  129 |     test('Should remove slots that partially overlap with existing sessions', async ({ page, request }) => {
  130 |         const profEmail = `prof_overlap_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  131 |         const profPass = 'password123';
  132 |         const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  133 | 
  134 |         await page.goto('/auth/register');
  135 |         await page.fill('#firstName', 'Overlap');
  136 |         await page.fill('#lastName', 'Tester');
  137 |         await page.fill('#email', profEmail);
  138 |         await page.fill('#professionalNumber', profNum);
  139 |         await page.selectOption('#country', 'España');
  140 |         await page.fill('#password', profPass);
  141 |         await page.fill('#confirmPassword', profPass);
  142 |         await page.check('#legalLiabilityAccepted');
  143 |         await page.check('#termsAccepted');
  144 |         await page.click('button[type="submit"]');
  145 |         await expect(page).toHaveURL(/\/auth\/(login|register)/, { timeout: 30000 });
  146 | 
  147 |         // Login API & Inject
  148 |         const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
  149 |             data: { email: profEmail, password: profPass }
  150 |         });
> 151 |         expect(loginRes.ok()).toBeTruthy();
      |                               ^ Error: expect(received).toBeTruthy()
  152 |         const loginData = await loginRes.json();
  153 |         const { tokens, user } = loginData;
  154 |         const accessToken = tokens.accessToken;
  155 |         const token = accessToken;
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
```