# 🧪 Anàlisi de la Bateria de Tests i Propostes de Nous Tests

> **Data:** Setembre 2026  
> **Versió:** 0.1.0 (Beta)  
> **Objectiu:** Analitzar la cobertura actual dels tests i proposar tests per a funcionalitats no provades

---

## 1. Estat Actual dels Tests

### 1.1 Tests E2E (Backend) — `backend/test/`

| Suite | Fitxer | Tests | Cobertura Funcional |
|-------|--------|-------|---------------------|
| Admin | `admin.e2e-spec.ts` | 3 | Dashboard stats, logs, accés no-admin |
| Billing | `billing.e2e-spec.ts` | 5 | Plans, subscription-status, usage, advanced-analytics |
| Clients | `clients.e2e-spec.ts` | 7 | CRUD complet, aïllament cross-user, soft/hard delete |
| Dashboard | `dashboard.e2e-spec.ts` | 2 | Stats, accés no autenticat |
| Notifications | `notifications.e2e-spec.ts` | 5 | Llistar, unread-count, read-all, auth |
| Payments | `payments.e2e-spec.ts` | 5 | Plans, subscription-status, usage, auth |
| Reports | `reports.e2e-spec.ts` | 4 | Crear, llistar, obtenir, auth |
| Sessions | `sessions.e2e-spec.ts` | 6 | CRUD, lifecycle, auth |
| Simulator | `simulator.e2e-spec.ts` | 3 | Demo start, auth, start amb auth |
| Users | `users.e2e-spec.ts` | 6 | Export CSV, admin list, get by ID, change role, dashboard layout |
| **TOTAL** | **10 fitxers** | **~46 tests** | |

### 1.2 Tests Unitaris (Backend) — `backend/src/`

| Suite | Fitxer | Tests | Cobertura |
|-------|--------|-------|-----------|
| AI Safety | `ai.safety.spec.ts` | 10 | Validació de seguretat d'informes generats per IA |
| Sessions Service | `sessions.service.spec.ts` | ? | Tests del servei de sessions |
| Users Service | `users.service.spec.ts` | ? | Tests del servei d'usuaris |
| **TOTAL** | **3 fitxers** | **~15-20 tests** | |

### 1.3 Tests Frontend

| Tipus | Fitxers | Estat |
|-------|---------|-------|
| Tests unitaris (Jest/Vitest) | 0 | ❌ No existeixen |
| Tests E2E (Playwright) | 0 | ❌ Configurat però sense fitxers |

---

## 2. Anàlisi de Cobertura per Mòdul

### Matriu de Cobertura: Endpoints vs Tests

| Mòdul | Endpoints Totals | Endpoints Testejats | % Cobertura | Gaps |
|-------|-----------------|--------------------:|------------:|------|
| **Auth** | 15 | 2 (via helper) | 13% | Login/Register testejat indirectament. Falten: logout, refresh, verify-email, Google OAuth, change-password, verify-password, public-key |
| **Users** | 21 | 6 | 29% | Falten: onboarding, delete-self, agenda-managers (CRUD), professional-groups, upload-logo, verify-user |
| **Clients** | 6 | 7 (tots!) | 100% | ✅ Complet |
| **Sessions** | 7 | 6 | 86% | Falta: upload-audio, transcription |
| **Reports** | 6 | 4 | 67% | Falten: export PDF, export DOCX, update report |
| **AI** | 4 | 0 | 0% | Falten: transcribe, analyze, suggestions, help |
| **Payments** | 14 | 5 | 36% | Falten: checkout-session, webhook, cancel, update, simulate-success, create-portal, verify-session |
| **Simulator** | 5 | 3 | 60% | Falten: message, end, reports |
| **Notifications** | 4 | 5 (tots!) | 100% | ✅ Complet |
| **Admin** | 15+ | 3 | 20% | Falten: communicate, stats/evolution, usage-evolution, CRUD users, plans |
| **Dashboard** | 1 | 2 (100%) | 100% | ✅ Complet |
| **WebRTC** | 1 | 0 | 0% | Falta: ice-config |
| **Google** | 3 | 0 | 0% | Falten: auth-url, callback, events |
| **Encryption** | (servei intern) | 0 | 0% | Cap test de xifrat/desxifrat |
| **Email** | (servei intern) | 0 | 0% | Cap test d'enviament |
| **Reminders** | (servei intern) | 0 | 0% | Cap test de recordatoris |
| **Usage Limits** | (servei intern) | 0 | 0% | Cap test de límits |

### Resum Visual

```
Auth          ██░░░░░░░░░░░░░ 13%
Users         ████░░░░░░░░░░░ 29%
Clients       ███████████████ 100% ✅
Sessions      ████████████░░░ 86%
Reports       ██████████░░░░░ 67%
AI            ░░░░░░░░░░░░░░░  0% ⚠️
Payments      █████░░░░░░░░░░ 36%
Simulator     █████████░░░░░░ 60%
Notifications ███████████████ 100% ✅
Admin         ███░░░░░░░░░░░░ 20%
Dashboard     ███████████████ 100% ✅
WebRTC        ░░░░░░░░░░░░░░░  0% ⚠️
Google        ░░░░░░░░░░░░░░░  0% ⚠️
Encryption    ░░░░░░░░░░░░░░░  0% ⚠️
Email         ░░░░░░░░░░░░░░░  0% ⚠️
UsageLimits   ░░░░░░░░░░░░░░░  0% ⚠️
```

---

## 3. Problemes Detectats als Tests Existents

### 3.1 Tests amb assertions febles

**Reports E2E** — Línies 69, 92, 111:
```typescript
// Massa permissiu — accepta qualsevol resposta
expect([200, 201, 400, 403]).toContain(response.status);
expect([200, 403]).toContain(response.status);
expect([200, 403, 404]).toContain(response.status);
```
**Problema:** Aquests tests passen sempre, independentment del comportament real. Un test que mai falla no aporta valor.

**Proposta:** Crear usuaris amb plans específics per testejar cada cas concret.

### 3.2 Tests de Payments duplicats

Els fitxers `billing.e2e-spec.ts` i `payments.e2e-spec.ts` proven pràcticament el mateix (`/payments/plans`, `/payments/subscription-status`, `/payments/usage`). 

**Proposta:** Consolidar en un sol fitxer `payments.e2e-spec.ts` amb tests més específics.

### 3.3 Auth helper amb `require()` dinàmic

```typescript
// Patró poc ideal — barreja CommonJS i ES modules
const { PrismaService } = require('../../src/common/prisma/prisma.service');
```

**Proposta:** Usar `app.get(PrismaService)` directament, que ja és disponible.

### 3.4 Falta de cleanup dels tests

Alguns tests creen dades (usuaris, clients) que no s'eliminen. Amb el temps, la BBDD de test s'infla.

**Proposta:** Implementar `afterAll` hooks que eliminin les dades creades, o usar transaccions per aïllar cada test.

---

## 4. Propostes de Nous Tests E2E

### 4.1 Auth E2E Suite (NOVA)

```
📁 test/auth.e2e-spec.ts
```

| # | Test | Endpoint | Descripció |
|---|------|----------|------------|
| 1 | Login amb credencials correctes | `POST /auth/login` | Verificar tokens i cookies |
| 2 | Login amb credencials incorrectes | `POST /auth/login` | Verificar 401 i missatge d'error |
| 3 | Login amb compte suspès | `POST /auth/login` | Verificar rebuig |
| 4 | Registre amb dades vàlides | `POST /auth/register` | Verificar creació i tokens |
| 5 | Registre amb email duplicat | `POST /auth/register` | Verificar 409 Conflict |
| 6 | Registre amb dades invàlides | `POST /auth/register` | Verificar validació DTO |
| 7 | Refresh token vàlid | `POST /auth/refresh` | Verificar nous tokens |
| 8 | Refresh token invàlid | `POST /auth/refresh` | Verificar 401 |
| 9 | Logout | `POST /auth/logout` | Verificar neteja de cookies |
| 10 | Get profile | `GET /auth/me` | Verificar dades retornades |
| 11 | Update profile | `PATCH /auth/me` | Verificar actualització |
| 12 | Change password | `PATCH /auth/change-password` | Verificar amb old/new password |
| 13 | Change password incorrecta | `PATCH /auth/change-password` | Verificar rebuig |
| 14 | Verify password (sudo) | `POST /auth/verify-password` | Verificar retorn |
| 15 | Get public key | `GET /auth/public-key` | Verificar format PEM |
| 16 | Verify email amb token | `GET /auth/verify-email?token=X` | Verificar activació |
| 17 | Resend verification | `POST /auth/resend-verification` | Verificar enviament |

---

### 4.2 AI E2E Suite (NOVA)

```
📁 test/ai.e2e-spec.ts
```

| # | Test | Endpoint | Descripció |
|---|------|----------|------------|
| 1 | Transcriure àudio sense auth | `POST /ai/transcribe` | 401 |
| 2 | Transcriure àudio vàlid | `POST /ai/transcribe` | Verificar text retornat |
| 3 | Transcriure format invàlid | `POST /ai/transcribe` | Verificar rebuig de fitxer |
| 4 | Transcriure fitxer massa gran | `POST /ai/transcribe` | Verificar limit 50MB |
| 5 | Analitzar sessió sense plan Pro | `POST /ai/session/:id/analyze` | 403 FeatureGuard |
| 6 | Obtenir suggeriments sense auth | `POST /ai/suggestions` | 401 |
| 7 | Preguntar help | `POST /ai/help` | Verificar resposta |

---

### 4.3 WebRTC E2E Suite (NOVA)

```
📁 test/webrtc.e2e-spec.ts
```

| # | Test | Endpoint | Descripció |
|---|------|----------|------------|
| 1 | Obtenir ICE config amb auth | `GET /webrtc/ice-config` | Verificar STUN/TURN servers |
| 2 | Obtenir ICE config sense auth | `GET /webrtc/ice-config` | 401 |

---

### 4.4 Google Calendar E2E Suite (NOVA)

```
📁 test/google.e2e-spec.ts
```

| # | Test | Endpoint | Descripció |
|---|------|----------|------------|
| 1 | Obtenir auth URL | `GET /google/auth-url` | Verificar URL vàlida |
| 2 | Obtenir auth URL sense auth | `GET /google/auth-url` | 401 |
| 3 | Llistar events sense token | `GET /google/events` | 401 o error graceful |

---

### 4.5 Admin E2E Suite Ampliada

```
📁 test/admin.e2e-spec.ts (ampliar existent)
```

| # | Test | Endpoint | Descripció |
|---|------|----------|------------|
| 1 | Evolution stats | `GET /admin/stats/evolution` | Verificar dades per període |
| 2 | Usage evolution stats | `GET /admin/stats/usage-evolution` | Verificar dades |
| 3 | Plans configuration | `GET /admin/plans` | Verificar llista de plans |
| 4 | Communicate — email | `POST /admin/communicate` | Verificar enviament |
| 5 | Communicate — sense target | `POST /admin/communicate` | 400 BadRequest |
| 6 | Admin CRUD users | `PATCH/DELETE /admin/users/:id` | Verificar CRUD complet |
| 7 | Non-admin accés evolution | `GET /admin/stats/evolution` | 403 |

---

### 4.6 Simulator E2E Suite Ampliada

```
📁 test/simulator.e2e-spec.ts (ampliar existent)
```

| # | Test | Endpoint | Descripció |
|---|------|----------|------------|
| 1 | Enviar missatge al simulador | `POST /simulator/message` | Verificar resposta del pacient virtual |
| 2 | Finalitzar sessió | `POST /simulator/end` | Verificar scores i feedback |
| 3 | Llistar reports de simulació | `GET /simulator/reports` | Verificar historial |
| 4 | Verificar límit de casos | `POST /simulator/start` | Verificar bloqueig si s'excedeix quota |

---

### 4.7 Reports E2E Suite Millorada

```
📁 test/reports.e2e-spec.ts (reescriure)
```

| # | Test | Endpoint | Descripció |
|---|------|----------|------------|
| 1 | Crear informe — usuari Pro | `POST /reports` | Verificar creació amb 201 |
| 2 | Crear informe — usuari Basic | `POST /reports` | Verificar 403 per IA |
| 3 | Actualitzar informe | `PATCH /reports/:id` | Verificar canvi d'estat |
| 4 | Exportar PDF | `GET /reports/:id/export/pdf` | Verificar Content-Type |
| 5 | Exportar DOCX | `GET /reports/:id/export/docx` | Verificar Content-Type |
| 6 | Informe d'un altre usuari | `GET /reports/:id` | 404/403 |

---

### 4.8 Payments E2E Suite Completa

```
📁 test/payments.e2e-spec.ts (reescriure)
```

| # | Test | Endpoint | Descripció |
|---|------|----------|------------|
| 1 | Plans públics | `GET /payments/plans` | Sense auth, 200 |
| 2 | Subscription status | `GET /payments/subscription-status` | Verificar dades |
| 3 | Usage data | `GET /payments/usage` | Verificar comptadors |
| 4 | Create checkout | `POST /payments/create-checkout-session` | Verificar URL retornada |
| 5 | Cancel subscription | `DELETE /payments/subscription` | Verificar cancel·lació |
| 6 | Update subscription | `PATCH /payments/subscription` | Verificar upgrade |
| 7 | Create portal session | `POST /payments/create-portal-session` | Verificar URL |
| 8 | Webhook invàlid | `POST /payments/webhook` | 400 sense signatura |
| 9 | Advanced analytics guard | `GET /payments/advanced-analytics` | 403 per Basic |
| 10 | Simulate success (admin only) | `POST /payments/simulate-success` | 403 per non-admin |

---

## 5. Propostes de Tests Unitaris

### 5.1 EncryptionService (CRÍTIC)

```
📁 src/modules/encryption/encryption.service.spec.ts
```

| # | Test | Descripció |
|---|------|------------|
| 1 | Xifrar dades | Verificar que el resultat és diferent de l'original |
| 2 | Desxifrar dades | Verificar que es recupera l'original |
| 3 | Xifrar/desxifrar cicle complet | Roundtrip amb dades JSON |
| 4 | Claus diferents produeixen resultats diferents | Seguretat |
| 5 | Dades corruptes → error controlat | Error handling |
| 6 | IV únic per operació | Verificar que dos xifrats del mateix text difereixen |

---

### 5.2 UsageLimitsService (CRÍTIC)

```
📁 src/modules/payments/usage-limits.service.spec.ts
```

| # | Test | Descripció |
|---|------|------------|
| 1 | Límit de clients per Basic | 25 clients → permès, 26 → bloquejat |
| 2 | Límit de clients per Pro | Sense límit |
| 3 | Minuts de transcripció | Deducció correcta |
| 4 | Reset mensual | Verificar reset al canviar període |
| 5 | Extra packs | Verificar que s'afegeixen al comptador |
| 6 | Feature guard per pla | Verificar accés per funcionalitat |

---

### 5.3 AuthService

```
📁 src/modules/auth/auth.service.spec.ts
```

| # | Test | Descripció |
|---|------|------------|
| 1 | Hash de contrasenya | Verificar que es genera correctament |
| 2 | Verificar contrasenya | Correcta → true, incorrecta → false |
| 3 | Generar tokens | Verificar format JWT |
| 4 | Refresh token | Verificar renovació |
| 5 | Blacklist token | Verificar que no es pot reutilitzar |
| 6 | Registre duplicat | 409 |
| 7 | Login amb compte inactiu | Error |

---

### 5.4 PaymentsService

```
📁 src/modules/payments/payments.service.spec.ts
```

| # | Test | Descripció |
|---|------|------------|
| 1 | getAvailablePlans | Verificar estructura de plans |
| 2 | Mapejat de preus | Plan → price ID correcte |
| 3 | Webhook checkout.session.completed | Activació de subscripció |
| 4 | Webhook customer.subscription.deleted | Cancel·lació |
| 5 | Canvi de rol post-pagament | Verificar que el rol canvia |

---

### 5.5 EmailService

```
📁 src/modules/email/email.service.spec.ts
```

| # | Test | Descripció |
|---|------|------------|
| 1 | Enviar email de benvinguda | Verificar crida a Nodemailer (mock) |
| 2 | Enviar recordatori | Verificar template correcte |
| 3 | Error de transport SMTP | Gestió d'errors graceful |
| 4 | Email personalitzat admin | Verificar contingut |

---

### 5.6 RemindersService

```
📁 src/modules/reminders/reminders.service.spec.ts
```

| # | Test | Descripció |
|---|------|------------|
| 1 | Detectar sessions properes (24h) | Verificar selecció correcta |
| 2 | No duplicar recordatoris | Flag reminderSent |
| 3 | Respectar preferències del client | sendEmailReminders |
| 4 | CRON trigger correcte | Verificar scheduling |

---

### 5.7 AiService (Ampliar)

```
📁 src/modules/ai/ai.service.spec.ts (NOU)
```

| # | Test | Descripció |
|---|------|------------|
| 1 | Generar anàlisi de sessió | Format correcte del resultat |
| 2 | Suggeriments amb context curt | Verificar resposta |
| 3 | Generació d'informe | Estructura correcta |
| 4 | Error de Gemini API | Gestió d'errors graceful |
| 5 | Límit de tokens | Verificar truncament |

---

## 6. Propostes de Tests Frontend

### 6.1 Configuració necessària

```bash
# Instal·lar dependències
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

### 6.2 Tests de Hooks

| Hook | Tests Proposats |
|------|----------------|
| `useRole` | Verificar permisos per cada rol, guard de funcionalitats |
| `usePayments` | Verificar flux de checkout, cancel·lació, upgrade |
| `useSocket` | Verificar connexió, desconnexió, events |
| `useOnboarding` | Verificar estat inicial, dismissal, persistència localStorage |
| `useToast` | Verificar aparició i eliminació de toasts |

### 6.3 Tests E2E amb Playwright (Prioritaris)

| # | Flow | Descripció |
|---|------|------------|
| 1 | Login Flow | Registre → Login → Dashboard |
| 2 | Client Management | Crear → Editar → Cercar → Eliminar client |
| 3 | Session Flow | Crear sessió → Iniciar → Finalitzar |
| 4 | Payment Flow | Seleccionar pla → Checkout (mock) → Activació |
| 5 | i18n | Canviar idioma → Verificar traduccions |
| 6 | Responsive | Verificar layout mòbil (viewport 375px) |
| 7 | Admin Panel | Login admin → Dashboard → Logs → Users |
| 8 | Simulator | Iniciar demo → Xat → Finalitzar → Veure report |

---

## 7. Pla d'Implementació de Tests

### Fase 1 — Tests Crítics (1-2 setmanes)

| Prioritat | Tests | Estimació |
|-----------|-------|-----------|
| 🔴 | `encryption.service.spec.ts` | 4h |
| 🔴 | `auth.e2e-spec.ts` (17 tests) | 6h |
| 🔴 | `usage-limits.service.spec.ts` | 4h |
| 🔴 | `auth.service.spec.ts` | 4h |
| | **Total Fase 1** | **~18h** |

### Fase 2 — Serveis Core (1-2 setmanes)

| Prioritat | Tests | Estimació |
|-----------|-------|-----------|
| 🟠 | `payments.service.spec.ts` | 4h |
| 🟠 | `ai.e2e-spec.ts` | 4h |
| 🟠 | `email.service.spec.ts` | 3h |
| 🟠 | Ampliar `admin.e2e-spec.ts` | 4h |
| 🟠 | Ampliar `reports.e2e-spec.ts` | 3h |
| 🟠 | Ampliar `simulator.e2e-spec.ts` | 3h |
| | **Total Fase 2** | **~21h** |

### Fase 3 — Frontend i Integració (2-3 setmanes)

| Prioritat | Tests | Estimació |
|-----------|-------|-----------|
| 🟡 | Configurar Jest al frontend | 2h |
| 🟡 | Tests de hooks (5 hooks) | 8h |
| 🟡 | Configurar Playwright | 3h |
| 🟡 | Tests E2E Playwright (8 flows) | 16h |
| | **Total Fase 3** | **~29h** |

### Total estimat: ~68 hores (3-6 setmanes segons dedicació)

---

## 8. Objectius de Cobertura

| Mètriques | Actual | Objectiu Fase 1 | Objectiu Final |
|-----------|--------|----------------|---------------|
| Tests E2E backend | ~46 | ~75 | ~100+ |
| Tests unitaris backend | ~15-20 | ~45 | ~80+ |
| Tests frontend | 0 | 0 | ~30+ |
| Tests E2E Playwright | 0 | 0 | ~25+ |
| Cobertura codi backend | ~15% | ~45% | ~80% |
| Mòduls amb 0% cobertura | 7 | 3 | 0 |

---

*Document generat: Setembre 2026 — Anàlisi automatitzada dels tests existents*
