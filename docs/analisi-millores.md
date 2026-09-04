# 🔍 Anàlisi de Millores — PsicoAIssist Platform

> **Data:** Setembre 2026  
> **Versió actual:** 0.1.0 (Beta)  
> **Objectiu:** Proposar millores tècniques, de seguretat, UX i d'arquitectura

---

## Resum de l'Anàlisi

Després d'una revisió exhaustiva del codi font, l'arquitectura, els tests i la documentació, s'han identificat **38 millores** classificades per àrea i prioritat.

---

## 🔴 Prioritat Alta — Impacte crític o de seguretat

### 1. Absència de tests unitaris al backend

**Situació actual:** Només existeixen 3 fitxers `.spec.ts` (ai.safety, sessions.service, users.service). La majoria de serveis crítics (encryption, payments, auth, clients, reports) no tenen tests unitaris.

**Impacte:** Risc alt de regressions en serveis de xifrat i pagaments.

**Proposta:**
- Crear tests unitaris per a tots els serveis: `EncryptionService`, `AuthService`, `PaymentsService`, `UsageLimitsService`, `ClientsService`, `ReportsService`, `EmailService`.
- Objectiu mínim: 80% de cobertura en serveis crítics.

---

### 2. Absència total de tests frontend

**Situació actual:** No hi ha cap test unitari ni d'integració al frontend. No hi ha cap fitxer `.test.tsx` ni configuració de Jest/Vitest al frontend. Playwright E2E està declarat però sense fitxers de test.

**Impacte:** Impossible detectar regressions en components React, hooks o serveis del frontend.

**Proposta:**
- Configurar Jest + React Testing Library al frontend.
- Crear tests per als hooks crítics: `useWebRTC`, `usePayments`, `useRole`, `useSocket`.
- Crear tests E2E amb Playwright per als fluxos principals (login → dashboard → client → sessió → informe).

---

### 3. Fitxers `.bak` i logs al repositori

**Situació actual:** Hi ha fitxers `.bak` (`page-old.tsx.bak`, `useAdmin-old.ts.bak`) i múltiples fitxers de logs grans (`backend_clean_start.log`, `server.log`, etc.) directament al directori `backend/`.

**Impacte:** Inflacció del repositori, possible filtració d'informació sensible en logs.

**Proposta:**
- Eliminar tots els fitxers `.bak` i `.log` del repositori.
- Afegir a `.gitignore`:
  ```
  *.bak
  *.log
  backend/*.log
  ```

---

### 4. Fitxers d'scripts i debug temporals al backend

**Situació actual:** Hi ha múltiples fitxers temporals a l'arrel de `backend/`: `check_tasks.ts`, `debug-gemini.ts`, `debug-sim.ts`, `diagnose-sync.ts`, `find_user.ts`, `repro_issue.ts`, `reset-password.ts`, `reset_password.ts` (duplicat!), `test_gemini_internal.js`, `test_onboarding.ts`, `view-data.js`, `update-plan.ts`, `verify_users.ts`.

**Impacte:** Contaminació del codi, confusió, possible exposició de scripts de debug.

**Proposta:**
- Moure scripts útils a `backend/scripts/` amb noms descriptius.
- Eliminar els duplicats i fitxers de debug temporals.
- Documentar els scripts de manteniment.

---

### 5. Manca de Password Reset Flow

**Situació actual:** Hi ha camps `resetPasswordToken` i `resetPasswordExpires` al model User, però no existeix cap endpoint `POST /auth/forgot-password` ni `POST /auth/reset-password` al controlador d'auth. Els scripts `reset-password.ts` / `reset_password.ts` són scripts manuals, no endpoints API.

**Impacte:** Els usuaris que oblidin la contrasenya no poden recuperar-la autònomament.

**Proposta:**
- Implementar `POST /auth/forgot-password` — Envia email amb token.
- Implementar `POST /auth/reset-password` — Accepta token i nova contrasenya.
- Afegir pàgina frontend `/auth/reset-password?token=XXX`.

---

### 6. Swagger/OpenAPI poc integrat

**Situació actual:** Existeix la ruta `/api/docs` declarada, però molts endpoints no tenen decoradors `@ApiOperation`, `@ApiResponse` complets. Només el controlador `auth` i `users` els tenen.

**Impacte:** Documentació API incompleta per a integracions futures.

**Proposta:**
- Afegir decoradors Swagger a tots els controladors: `clients`, `sessions`, `reports`, `simulator`, `payments`, `notifications`, `admin`, `google`, `webrtc`, `dashboard`.

---

## 🟠 Prioritat Mitjana — Millores d'arquitectura i codi

### 7. Frontend service layer massa prim

**Situació actual:** Només existeix 1 fitxer de servei: `simulator.service.ts`. Totes les altres crides API semblen estar disperses directament als components.

**Impacte:** Codi repetitiu, difícil de mantenir i testejar.

**Proposta:**
- Crear serveis dedicats: `auth.service.ts`, `clients.service.ts`, `sessions.service.ts`, `reports.service.ts`, `payments.service.ts`, `admin.service.ts`, `notifications.service.ts`.
- Centralitzar la configuració d'Axios/Fetch amb interceptors d'auth i error handling.

---

### 8. Duplicació de carpetes de context

**Situació actual:** Existeixen dues carpetes al frontend: `src/context/` i `src/contexts/`. Això indica una migració incompleta.

**Impacte:** Confusió sobre on posar nous contexts.

**Proposta:**
- Consolidar en una sola carpeta `src/contexts/`.
- Actualitzar tots els imports.

---

### 9. Millora del sistema de rate limiting

**Situació actual:** Rate limiting global configurat amb `@nestjs/throttler`, però sense configuració granular per endpoint.

**Proposta:**
- Aplicar rate limiting específic per endpoints sensibles:
  - Login: 5 intents / 15 min
  - Register: 3 intents / hora
  - AI transcribe: segons pla
  - Webhook: sense limit
- Implementar protecció contra brute-force a nivell de compte (bloqueig temporal).

---

### 10. Gestió d'errors frontend centralitzada

**Situació actual:** No hi ha un Error Boundary global ni un mecanisme consistent de gestió d'errors de xarxa al frontend.

**Proposta:**
- Implementar Error Boundary per a React.
- Crear un interceptor de Fetch/Axios per gestionar errors 401 (refresh automàtic), 403, 500.
- Mostrar errors d'UX amigables amb `useToast`.

---

### 11. Manca d'índex de cerca de pacients

**Situació actual:** La cerca de pacients probablement escaneja tots els clients desxifrant dades, ja que les dades personals estan xifrades.

**Proposta:**
- Afegir camps de cerca indexats al model `Client` (ex: hash del nom, inicials, o un camp `searchIndex` generat a partir de dades no sensibles).
- Alternativament, mantenir un índex local xifrat amb hash de tokens de cerca.

---

### 12. Backup automatitzat

**Situació actual:** Existeix un `BackupService` importat a l'AdminController, però no hi ha evidència de backups automatitzats programats.

**Proposta:**
- Implementar CRON job per backup automàtic de PostgreSQL.
- Emmagatzematge xifrat de backups.
- Retenció configurable (7 dies, 30 dies).
- Endpoint admin per triggerar backup manual.

---

### 13. Health Check endpoint

**Situació actual:** No hi ha evidència d'un endpoint `/health` per monitorització.

**Proposta:**
- Implementar `GET /health` que verifiqui:
  - Connexió a PostgreSQL
  - Connexió a Redis
  - Disponibilitat de Gemini API
  - Espai en disc
- Útil per a Docker health checks i monitoring extern.

---

## 🟡 Prioritat Baixa — Millores de qualitat i UX

### 14. Actualitzar documentació principal

**Situació actual:** La documentació diu "Última actualización: Marzo 2026" però el projecte ha evolucionat significativament (onboarding, usage limits, extra packs, trial plans, etc.).

**Proposta:**
- Actualitzar `DOCUMENTACION.md` amb les funcionalitats noves.
- Afegir secció d'Usage Limits i Extra Packs.
- Afegir secció d'Onboarding.

---

### 15. Pla de proves manuals desactualitzat

**Situació actual:** El `pla-proves-manuals.md` no contempla funcionalitats noves com: onboarding guide, packs extra, trial plan, export CSV GDPR.

**Proposta:** Actualitzar amb noves seccions (veure document de tests proposats).

---

### 16. Configuració TypeScript més estricta

**Proposta:**
- Activar `strictNullChecks`, `strictPropertyInitialization` al `tsconfig.json` del backend.
- Reduir l'ús de `any` als controladors (especialment `@Req() req: any`).

---

### 17. Millora del sistema de consentiments

**Situació actual:** El model `Consent` existeix però no hi ha endpoints CRUD dedicats per gestionar consentiments de clients.

**Proposta:**
- Crear endpoints: `GET /clients/:id/consents`, `POST /clients/:id/consents`, `PATCH /consents/:id/revoke`.
- Frontend per visualitzar/gestionar consentiments per client.

---

### 18. Logging estructurat

**Situació actual:** Molts `console.log` i `console.error` directes al codi.

**Proposta:**
- Substituir per `Logger` de NestJS a tots els serveis.
- Configurar format JSON per a producció.
- Integrar amb un sistema de logging centralitzat (ex: ELK, Loki).

---

### 19. Caching Redis més agressiu

**Situació actual:** Redis instal·lat i configurat, però poc utilitzat per cache d'endpoints.

**Proposta:**
- Afegir cache a endpoints estàtics: `/payments/plans`, `/admin/dashboard`, `/dashboard/stats`.
- TTL configurable per endpoint.

---

### 20. WebSocket reconnection handling

**Situació actual:** El hook `useSocket` no gestiona reconexions explícitament.

**Proposta:**
- Implementar retry automàtic amb backoff exponencial.
- Indicador visual de connexió/desconnexió al frontend.

---

### 21. Millorar la gestió de sessions múltiples

**Proposta:**
- Implementar control de sessions múltiples (limitar a N dispositius per compte).
- Alertar l'usuari si s'ha iniciat sessió des d'un altre dispositiu.

---

### 22. Afegir filtre de sessions per data al backend

**Proposta:**
- Endpoint `GET /sessions` amb filtres: `?startDate=`, `?endDate=`, `?clientId=`, `?status=`.
- Paginació.

---

### 23. Dashboard drag-and-drop — persistència

**Situació actual:** El layout es guarda a `dashboardLayout` JSON del model User, cosa que funciona. Però falta validació del contingut JSON.

**Proposta:**
- Afegir validació de l'esquema JSON del layout al backend.
- Limitar la mida del JSON per evitar inflacció.

---

### 24. Millora de l'export GDPR

**Proposta:**
- Afegir export en format ZIP amb tots els fitxers (PDF informes + CSV dades + àudios xifrats).
- Complir més estrictament amb el dret de portabilitat (Article 20 GDPR).

---

### 25. Implementar Soft Delete consistent

**Situació actual:** Clients tenen `isActive` (soft delete), però Sessions i Reports usen `DELETE` real o estats.

**Proposta:**
- Unificar l'estratègia de soft delete: `status: DELETED` a tots els models.
- Afegir endpoint admin per purgar dades eliminades.

---

## 🟢 Millores Futures (Roadmap)

### 26. Sistema de templates d'informes
Permetre als professionals crear i reutilitzar plantilles d'informes personalitzades.

### 27. Integració WhatsApp Business
Recordatoris de sessions via WhatsApp (el model ja té `sendWhatsappReminders`).

### 28. Multi-terapia i co-terapeutes
Permetre que múltiples professionals col·laborin en un pacient.

### 29. API pública per Premium
Documentar i publicar una API REST per a integracions (ja prevista al pla Premium).

### 30. Dashboard analytics avançats
Gràfiques d'evolució de pacients, tendències, comparatives.

### 31. PWA / App nativa
Progressive Web App per experiència mòbil nativa.

### 32. Integració amb dispositius de monitorització
Dades de wearables (son, estrès, activitat).

### 33. Sistema de referrals complet
El model té `referralCode` i `referralCredits` però falta la lògica completa de descomptes.

### 34. Autenticació de 2 factors (2FA)
TOTP o SMS com a segon factor.

### 35. Workflow d'aprovació d'informes
Per a equips: un professional crea l'informe, un supervisor l'aprova.

### 36. Retry i Dead Letter Queue per emails
Gestió de rebots i reintents en l'enviament d'emails.

### 37. Migrar de Prisma a TypeORM (opcional, debatible)
Prisma té limitacions amb queries complexes. TypeORM pot ser més flexible per a projectes grans.

### 38. CI/CD complet amb GitHub Actions
Pipeline automatitzat: lint → test → build → deploy.

---

## Matriu Resum

| Àrea | Total | 🔴 Alta | 🟠 Mitjana | 🟡 Baixa | 🟢 Futur |
|------|-------|---------|-----------|---------|---------|
| Tests | 2 | 2 | 0 | 0 | 0 |
| Codi/Neteja | 2 | 2 | 0 | 0 | 0 |
| Seguretat | 2 | 1 | 1 | 0 | 0 |
| Documentació | 2 | 1 | 0 | 1 | 0 |
| Arquitectura | 6 | 0 | 5 | 1 | 0 |
| UX/Frontend | 4 | 0 | 1 | 3 | 0 |
| Funcionalitats | 13 | 0 | 0 | 4 | 9 |
| **TOTAL** | **38** | **6** | **7** | **12** | **13** |

---

*Document generat: Setembre 2026 — Anàlisi automatitzada del codi font*
