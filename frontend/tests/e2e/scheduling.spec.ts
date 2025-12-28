
import { test, expect } from '@playwright/test';

test.describe('Scheduling Conflicts', () => {

    test('Should handle concurrent booking conflicts gracefully', async ({ page, request }) => {
        test.setTimeout(120000);

        const profEmail = `prof_conflict_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
        const profPass = 'password123';
        const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // --- 1. Register via UI ---
        await page.goto('/auth/register');
        await page.fill('#firstName', 'Conflict');
        await page.fill('#lastName', 'Tester');
        await page.fill('#email', profEmail);
        await page.fill('#professionalNumber', profNum);
        await page.selectOption('#country', 'España');
        await page.fill('#password', profPass);
        await page.fill('#confirmPassword', profPass);
        await page.check('#legalLiabilityAccepted');
        await page.check('#termsAccepted');

        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30000 });

        // --- 2. Login via API & Inject Token/Cookies ---
        const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
            data: { email: profEmail, password: profPass }
        });
        expect(loginRes.ok()).toBeTruthy();
        const loginData = await loginRes.json();
        const { tokens, user } = loginData;
        const accessToken = tokens.accessToken;
        const token = accessToken;

        await page.goto('/auth/login');

        await page.evaluate(({ accessToken, tokens, user }) => {
            localStorage.setItem('psychoai_access_token', accessToken);
            localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
            localStorage.setItem('psychoai_user', JSON.stringify(user));
        }, { accessToken, tokens, user });

        await page.context().addCookies([
            { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
            { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
        ]);

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });

        // --- 2.1 Configure Schedule ---
        await request.patch('http://localhost:3001/api/v1/auth/me', {
            data: {
                workStartHour: '00:00',
                workEndHour: '23:59',
                defaultDuration: 60,
                bufferTime: 0,
                scheduleConfig: { holidays: [], blockedBlocks: [] }
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // --- 3. Create Client via API ---
        const clientRes = await request.post('http://localhost:3001/api/v1/clients', {
            data: {
                firstName: 'Test',
                lastName: 'Client',
                email: 'client@test.com',
                phone: '123456789'
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        expect(clientRes.status()).toBe(201);
        const clientData = await clientRes.json();
        const clientId = clientData.id;

        // --- 4. Prepare Conflict Data ---
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
        const dateStr = targetDate.toISOString().split('T')[0];
        const timeStr = '10:00';

        // --- 5. Start Booking Flow in UI ---
        await page.goto('/dashboard/sessions/new');
        await page.waitForTimeout(2000);

        await page.click('button:has-text("Seleccionar paciente")');
        await page.click('div[role="option"]:has-text("Test Client")');

        await page.fill('input[type="date"]', dateStr);

        await page.waitForTimeout(1000);
        await expect(page.getByText('Cargando horarios...')).toBeHidden();
        const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
        const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');
        await expect(timeSelectTrigger).toBeEnabled({ timeout: 10000 });
        await timeSelectTrigger.click();

        await page.waitForTimeout(500);
        await page.getByRole('option', { name: timeStr }).click();

        const typeContainer = page.locator('div.space-y-2', { has: page.getByText('Tipo de Sesión') });
        const typeSelectTrigger = typeContainer.locator('button[role="combobox"]');
        await expect(typeSelectTrigger).toBeEnabled();
        await typeSelectTrigger.click();
        await page.click('div[role="option"]:has-text("Individual")');

        // --- 6. TRIGGER CONFLICT ---
        const conflictRes = await request.post('http://localhost:3001/api/v1/sessions', {
            data: {
                clientId: clientId,
                startTime: new Date(`${dateStr}T${timeStr}:00`).toISOString(),
                sessionType: 'INDIVIDUAL'
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        expect(conflictRes.status()).toBe(201);

        // --- 7. Submit UI Form (Should Fail) ---
        await page.click('button:has-text("Agendar Sesión")');

        // --- 8. Verify Error Handling ---
        await expect(page.getByText(/Error al agendar|ya tiene|ocupado/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('Should remove slots that partially overlap with existing sessions', async ({ page, request }) => {
        const profEmail = `prof_overlap_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
        const profPass = 'password123';
        const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        await page.goto('/auth/register');
        await page.fill('#firstName', 'Overlap');
        await page.fill('#lastName', 'Tester');
        await page.fill('#email', profEmail);
        await page.fill('#professionalNumber', profNum);
        await page.selectOption('#country', 'España');
        await page.fill('#password', profPass);
        await page.fill('#confirmPassword', profPass);
        await page.check('#legalLiabilityAccepted');
        await page.check('#termsAccepted');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30000 });

        // Login API & Inject
        const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
            data: { email: profEmail, password: profPass }
        });
        expect(loginRes.ok()).toBeTruthy();
        const loginData = await loginRes.json();
        const { tokens, user } = loginData;
        const accessToken = tokens.accessToken;
        const token = accessToken;

        await page.goto('/auth/login');
        await page.evaluate(({ accessToken, tokens, user }) => {
            localStorage.setItem('psychoai_access_token', accessToken);
            localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
            localStorage.setItem('psychoai_user', JSON.stringify(user));
        }, { accessToken, tokens, user });

        await page.context().addCookies([
            { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
            { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
        ]);

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });

        // --- 1.1 Configure Schedule ---
        await request.patch('http://localhost:3001/api/v1/auth/me', {
            data: {
                workStartHour: '00:00',
                workEndHour: '23:59',
                defaultDuration: 60,
                bufferTime: 0,
                scheduleConfig: { holidays: [], blockedBlocks: [] }
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // --- 2. Create Client ---
        const clientRes = await request.post('http://localhost:3001/api/v1/clients', {
            data: { firstName: 'Overlap', lastName: 'Client', email: 'overlap@test.com' },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const clientData = await clientRes.json();
        const clientId = clientData.id;

        // --- 3. Create Session at 14:30 (Partial Overlap) ---
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
        const dateStr = targetDate.toISOString().split('T')[0];
        const overlapStart = new Date(`${dateStr}T14:30:00`);

        await request.post('http://localhost:3001/api/v1/sessions', {
            data: {
                clientId: clientId,
                startTime: overlapStart.toISOString(),
                sessionType: 'INDIVIDUAL'
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // --- 4. Check UI Slots ---
        await page.goto('/dashboard/sessions/new');

        await page.click('button:has-text("Seleccionar paciente")');
        await page.getByRole('option', { name: 'Overlap Client' }).click();

        await page.fill('input[type="date"]', dateStr);

        await page.waitForTimeout(1000);
        await expect(page.getByText('Cargando horarios...')).toBeHidden();

        const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
        const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');

        await expect(timeSelectTrigger).toBeEnabled({ timeout: 10000 });
        await timeSelectTrigger.click();

        // Verify 14:00 is MISSING
        const hour14 = page.getByRole('option', { name: '14:00', exact: true });
        await expect(hour14).toBeHidden();

        // Verify 16:00 IS VISIBLE
        const hour16 = page.getByRole('option', { name: '16:00', exact: true });
        await expect(hour16).toBeVisible();
    });

    test('Should respect holidays in schedule configuration', async ({ page, request }) => {
        const profEmail = `prof_holiday_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
        const profPass = 'password123';
        const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // Register
        await page.goto('/auth/register');
        await page.fill('#firstName', 'Holiday');
        await page.fill('#lastName', 'Tester');
        await page.fill('#email', profEmail);
        await page.fill('#professionalNumber', profNum);
        await page.selectOption('#country', 'España');
        await page.fill('#password', profPass);
        await page.fill('#confirmPassword', profPass);
        await page.check('#legalLiabilityAccepted');
        await page.check('#termsAccepted');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30000 });

        // Login API & Inject
        const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
            data: { email: profEmail, password: profPass }
        });
        expect(loginRes.ok()).toBeTruthy();
        const loginData = await loginRes.json();
        const { tokens, user } = loginData;
        const accessToken = tokens.accessToken;
        const token = accessToken;

        await page.goto('/auth/login');
        await page.evaluate(({ accessToken, tokens, user }) => {
            localStorage.setItem('psychoai_access_token', accessToken);
            localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
            localStorage.setItem('psychoai_user', JSON.stringify(user));
        }, { accessToken, tokens, user });

        await page.context().addCookies([
            { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
            { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
        ]);

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });

        // Create Client
        await request.post('http://localhost:3001/api/v1/clients', {
            data: { firstName: 'Holiday', lastName: 'Client', email: 'holiday@test.com' },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
        const dateStr = targetDate.toISOString().split('T')[0];

        // Configure Schedule with Holiday
        await request.patch('http://localhost:3001/api/v1/auth/me', {
            data: {
                workStartHour: '09:00',
                workEndHour: '18:00',
                scheduleConfig: { holidays: [dateStr], blockedBlocks: [] }
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Verify No Slots Available
        await page.goto('/dashboard/sessions/new');
        await page.click('button:has-text("Seleccionar paciente")');
        await page.getByRole('option', { name: 'Holiday Client' }).click();
        await page.fill('input[type="date"]', dateStr);

        await page.waitForTimeout(1000);
        await expect(page.getByText('Cargando horarios...')).toBeHidden();

        const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
        const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');

        if (await timeSelectTrigger.isEnabled()) {
            await timeSelectTrigger.click();
            const options = await page.getByRole('option').allInnerTexts();
            expect(options.length).toBe(0);
        } else {
            expect(await timeSelectTrigger.isDisabled()).toBeTruthy();
        }
    });

    test('Should respect buffer time between sessions', async ({ page, request }) => {
        const profEmail = `prof_buffer_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
        const profPass = 'password123';
        const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // Register
        await page.goto('/auth/register');
        await page.fill('#firstName', 'Buffer');
        await page.fill('#lastName', 'Tester');
        await page.fill('#email', profEmail);
        await page.fill('#professionalNumber', profNum);
        await page.selectOption('#country', 'España');
        await page.fill('#password', profPass);
        await page.fill('#confirmPassword', profPass);
        await page.check('#legalLiabilityAccepted');
        await page.check('#termsAccepted');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30000 });

        // Login API & Inject
        const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
            data: { email: profEmail, password: profPass }
        });
        expect(loginRes.ok()).toBeTruthy();
        const loginData = await loginRes.json();
        const { tokens, user } = loginData;
        const accessToken = tokens.accessToken;
        const token = accessToken;

        await page.goto('/auth/login');
        await page.evaluate(({ accessToken, tokens, user }) => {
            localStorage.setItem('psychoai_access_token', accessToken);
            localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
            localStorage.setItem('psychoai_user', JSON.stringify(user));
        }, { accessToken, tokens, user });

        await page.context().addCookies([
            { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
            { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
        ]);

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });

        const clientRes = await request.post('http://localhost:3001/api/v1/clients', {
            data: { firstName: 'Buffer', lastName: 'Client', email: 'buffer@test.com' },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const clientId = await clientRes.json().then(d => d.id);

        // Configure Schedule with Buffer 15m
        const bufferPatchRes = await request.patch('http://localhost:3001/api/v1/auth/me', {
            data: {
                workStartHour: '09:00',
                workEndHour: '18:00',
                defaultDuration: 60,
                bufferTime: 15,
                scheduleConfig: { holidays: [], blockedBlocks: [] }
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Create Session 10:00 - 11:00
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
        const dateStr = targetDate.toISOString().split('T')[0];

        await request.post('http://localhost:3001/api/v1/sessions', {
            data: {
                clientId: clientId,
                startTime: `${dateStr}T10:00:00.000Z`,
                sessionType: 'INDIVIDUAL'
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });



        // Verify 11:00 is BLOCKED
        await page.goto('/dashboard/sessions/new');
        await page.click('button:has-text("Seleccionar paciente")');
        await page.getByRole('option', { name: 'Buffer Client' }).click();
        await page.fill('input[type="date"]', dateStr);

        await page.waitForTimeout(1000);
        const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
        const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');
        await timeSelectTrigger.click();

        // With 60m duration + 15m buffer:
        // Slots: 09:00, 10:15, 11:30, 12:45...

        // 11:00 Should be hidden (not generated)
        await expect(page.getByRole('option', { name: '11:00', exact: true })).toBeHidden();

        // 11:30 Should be visible (First available slot after 10:15 blocked by 10:00 session)
        // Wait, 10:15 slot collides with 10:00-11:00 session?
        // Slot 10:15-11:15 (EndBuf 11:30). Session 10:00-11:00 (EndBuf 11:15).
        // 10:15 < 11:15 Yes. 11:30 > 10:00 Yes. Collision.

        // Next slot 11:30.
        // Slot 11:30-12:30. Session 10:00-11:00 (EndBuf 11:15).
        // 11:30 > 11:15. No Collision.

        await expect(page.getByRole('option', { name: '11:30', exact: true })).toBeVisible();
    });

    test('Should respect manual blocked blocks', async ({ page, request }) => {
        const profEmail = `prof_blocked_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
        const profPass = 'password123';
        const profNum = `PN${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // Register
        await page.goto('/auth/register');
        await page.fill('#firstName', 'Blocked');
        await page.fill('#lastName', 'Tester');
        await page.fill('#email', profEmail);
        await page.fill('#professionalNumber', profNum);
        await page.selectOption('#country', 'España');
        await page.fill('#password', profPass);
        await page.fill('#confirmPassword', profPass);
        await page.check('#legalLiabilityAccepted');
        await page.check('#termsAccepted');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30000 });

        // Login API & Inject
        const loginRes = await request.post('http://localhost:3001/api/v1/auth/login', {
            data: { email: profEmail, password: profPass }
        });
        expect(loginRes.ok()).toBeTruthy();
        const loginData = await loginRes.json();
        const { tokens, user } = loginData;
        const accessToken = tokens.accessToken;
        const token = accessToken;

        await page.goto('/auth/login');
        await page.evaluate(({ accessToken, tokens, user }) => {
            localStorage.setItem('psychoai_access_token', accessToken);
            localStorage.setItem('psychoai_refresh_token', tokens.refreshToken);
            localStorage.setItem('psychoai_user', JSON.stringify(user));
        }, { accessToken, tokens, user });

        await page.context().addCookies([
            { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
            { name: 'refreshToken', value: tokens.refreshToken, domain: 'localhost', path: '/' }
        ]);

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });

        const clientRes = await request.post('http://localhost:3001/api/v1/clients', {
            data: { firstName: 'Blocked', lastName: 'Client', email: 'blocked@test.com' },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
        const dateStr = targetDate.toISOString().split('T')[0];

        // Block 12:00-14:00 (Lunch)
        await request.patch('http://localhost:3001/api/v1/auth/me', {
            data: {
                workStartHour: '09:00',
                workEndHour: '18:00',
                scheduleConfig: {
                    holidays: [],
                    blockedBlocks: [{ date: dateStr, start: '12:00', end: '14:00' }]
                }
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });

        await page.goto('/dashboard/sessions/new');
        await page.click('button:has-text("Seleccionar paciente")');
        await page.getByRole('option', { name: 'Blocked Client' }).click();
        await page.fill('input[type="date"]', dateStr);

        await page.waitForTimeout(1000);
        const timeContainer = page.locator('div.space-y-2', { has: page.getByText('Hora Disponible') });
        const timeSelectTrigger = timeContainer.locator('button[role="combobox"]');
        await timeSelectTrigger.click();

        // 12:00 and 13:00 should be hidden
        await expect(page.getByRole('option', { name: '12:00', exact: true })).toBeHidden();
        await expect(page.getByRole('option', { name: '13:00', exact: true })).toBeHidden();

        // 10:00 and 15:00 should be visible (11:00 might be edge case collision)
        await expect(page.getByRole('option', { name: '10:00', exact: true })).toBeVisible();
        await expect(page.getByRole('option', { name: '15:00', exact: true })).toBeVisible();
    });

});
