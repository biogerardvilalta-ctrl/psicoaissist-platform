# 📋 Catàleg Complet de Funcionalitats — PsicoAIssist Platform

> **Data:** Setembre 2026  
> **Versió:** 0.1.0 (Beta)  
> **Objectiu:** Inventari exhaustiu de totes les funcionalitats i opcions del sistema

---

## Resum Executiu

El sistema compta amb **17 mòduls backend**, **14 controladors REST** amb **~90 endpoints**, **13 rutes frontend** principals i **24 serveis especialitzats**. Es detalla cada funcionalitat a continuació.

---

## 1. Autenticació i Gestió d'Identitat (`auth`)

### Endpoints (14 endpoints)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `POST` | `/auth/login` | Login amb email + contrasenya |
| 2 | `POST` | `/auth/register` | Registre d'usuari nou |
| 3 | `POST` | `/auth/logout` | Tancament de sessió (invalidació de token + neteja cookies) |
| 4 | `POST` | `/auth/refresh` | Renovació de l'access token amb refresh token |
| 5 | `GET` | `/auth/me` | Obtenir perfil complet de l'usuari autenticat |
| 6 | `PATCH` | `/auth/me` | Actualitzar perfil (nom, telèfon, especialitat, idioma, etc.) |
| 7 | `PATCH` | `/auth/change-password` | Canviar contrasenya (requereix contrasenya actual) |
| 8 | `POST` | `/auth/verify-password` | Verificar contrasenya per "Sudo Mode" |
| 9 | `GET` | `/auth/verify-email` | Verificar email via token (de registre) |
| 10 | `POST` | `/auth/resend-verification` | Reenviar email de verificació |
| 11 | `GET` | `/auth/google` | Iniciar flux OAuth 2.0 amb Google |
| 12 | `GET` | `/auth/google/callback` | Callback de Google OAuth |
| 13 | `POST` | `/auth/google/complete` | Completar registre via Google (perfil professional) |
| 14 | `GET` | `/auth/public-key` | Obtenir clau pública RSA per xifrat de login |
| 15 | `GET` | `/auth/session-tokens` | Recuperar tokens de cookies de sessió (OAuth) |

### Opcions i Característiques
- **JWT amb cookies HttpOnly** — Access token (15 min) + Refresh token (7 dies)
- **Google OAuth 2.0** — Flux complet amb gestió d'usuaris nous/existents
- **Verificació d'email** — Token per email, reenviar si cal
- **Registre pendent** — Gestió d'usuaris Google que han de completar perfil
- **Blacklist de tokens** — Logout real amb invalidació
- **Detecció dinàmica de FRONTEND_URL** — Proxy/Nginx compatible

---

## 2. Gestió d'Usuaris (`users`)

### Endpoints (16 endpoints)

| # | Mètode | Endpoint | Funcionalitat | Accés |
|---|--------|----------|---------------|-------|
| 1 | `GET` | `/users` | Llistar tots els usuaris (paginat) | Admin |
| 2 | `POST` | `/users` | Crear usuari manualment | Admin |
| 3 | `GET` | `/users/:id` | Obtenir usuari per ID | Admin |
| 4 | `PATCH` | `/users/:id` | Actualitzar usuari | Admin |
| 5 | `DELETE` | `/users/:id` | Eliminar usuari (soft delete) | Admin |
| 6 | `PATCH` | `/users/:id/verify` | Verificar usuari manualment | Admin |
| 7 | `PATCH` | `/users/:id/role` | Canviar rol d'usuari | Admin |
| 8 | `PATCH` | `/users/:id/password` | Canviar contrasenya (admin) | Admin |
| 9 | `PATCH` | `/users/:id/dashboard-layout` | Actualitzar layout del dashboard | Propietari/Admin |
| 10 | `GET` | `/users/me/export` | Exportar dades (GDPR) — JSON | Autenticat |
| 11 | `GET` | `/users/me/export/csv` | Exportar dades (GDPR) — CSV | Autenticat |
| 12 | `GET` | `/users/me/onboarding` | Progrés d'onboarding | Autenticat |
| 13 | `DELETE` | `/users/me` | Eliminar el propi compte | Autenticat |
| 14 | `POST` | `/users/agenda-managers` | Crear Agenda Manager | Professional |
| 15 | `GET` | `/users/me/agenda-managers` | Llistar els meus Agenda Managers | Professional |
| 16 | `DELETE` | `/users/agenda-managers/:id` | Eliminar Agenda Manager | Professional |
| 17 | `GET` | `/users/me/managed-professionals` | Professionals gestionats | Agenda Manager |
| 18 | `POST` | `/users/agenda-managers/:id/link` | Vincular professional a gestor | Professional |
| 19 | `POST` | `/users/professional-groups` | Crear grup de professionals | Agenda Manager |
| 20 | `DELETE` | `/users/professional-groups/:id` | Eliminar grup | Agenda Manager |
| 21 | `POST` | `/users/upload-logo` | Pujar logo d'empresa (white label) | Professional |

### Rols del sistema (9 rols)
1. `PSYCHOLOGIST` — Psicòleg sense pla actiu
2. `PSYCHOLOGIST_BASIC` — Pla Basic
3. `PSYCHOLOGIST_PRO` — Pla Pro
4. `PSYCHOLOGIST_PREMIUM` — Pla Premium
5. `STUDENT` — Estudiant (accés simulador)
6. `AGENDA_MANAGER` — Gestor d'agenda
7. `PROFESSIONAL_GROUP` — Grup de professionals
8. `ADMIN` — Administrador
9. `SUPER_ADMIN` — Super administrador

### Estats d'usuari (7 estats)
`ACTIVE`, `INACTIVE`, `SUSPENDED`, `DELETED`, `PENDING_REVIEW`, `VALIDATED`, `REJECTED`

---

## 3. Gestió de Pacients/Clients (`clients`)

### Endpoints (5 endpoints + filtres)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/clients` | Llistar clients actius (filtre `?active=false` per inactius) |
| 2 | `POST` | `/clients` | Crear client (dades xifrades AES-256) |
| 3 | `GET` | `/clients/:id` | Obtenir detall de client (desxifrat) |
| 4 | `PUT` | `/clients/:id` | Actualitzar client |
| 5 | `DELETE` | `/clients/:id` | Desactivar client (soft delete) |
| 6 | `DELETE` | `/clients/permanent/:id` | Eliminar permanentment |

### Opcions del client
- **Dades personals xifrades** (AES-256-GCM) — nom, email, telèfon
- **Dades clíniques xifrades** — diagnòstics, historial
- **Dades sensibles xifrades** — informació protegida
- **Nivell de risc**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Tags** — Etiquetes lliures (array)
- **Recordatoris**: Email i WhatsApp (configurables per client)
- **Aïllament d'usuari** — Cada professional només veu els seus clients

---

## 4. Sessions Terapèutiques (`sessions`)

### Endpoints (7 endpoints)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/sessions` | Llistar sessions |
| 2 | `POST` | `/sessions` | Crear sessió programada |
| 3 | `GET` | `/sessions/:id` | Obtenir detall de sessió |
| 4 | `PATCH` | `/sessions/:id` | Actualitzar sessió (estat, notes) |
| 5 | `DELETE` | `/sessions/:id` | Eliminar sessió |
| 6 | `POST` | `/sessions/:id/start` | Iniciar sessió (canvi a IN_PROGRESS) |
| 7 | `POST` | `/sessions/:id/end` | Finalitzar sessió |

### Tipus de sessió (6 tipus)
`INDIVIDUAL`, `GROUP`, `FAMILY`, `COUPLE`, `CONSULTATION`, `EMERGENCY`

### Estats de sessió (5 estats)
`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`

### Opcions addicionals
- **Transcripció xifrada** — Àudio → text via IA
- **Notes xifrades** — Notes del terapeuta
- **Consentiment de gravació** — `recordingConsent`, `consentSigned`
- **Qualitat d'àudio**: `LOW`, `MEDIUM`, `HIGH`, `ULTRA`
- **Videollamada** — Token únic per videoconferència
- **Google Calendar** — `googleEventId` per sincronització
- **Menor d'edat** — Flag `isMinor`
- **Recordatori enviat** — Control de `reminderSent`

---

## 5. Informes Clínics (`reports`)

### Endpoints (6 endpoints)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/reports` | Llistar informes |
| 2 | `POST` | `/reports` | Crear informe (manual o IA) |
| 3 | `GET` | `/reports/:id` | Obtenir informe (desxifrat) |
| 4 | `PATCH` | `/reports/:id` | Actualitzar informe |
| 5 | `GET` | `/reports/:id/export/pdf` | Exportar a PDF |
| 6 | `GET` | `/reports/:id/export/docx` | Exportar a Word |

### Tipus d'informe (7 tipus)
`INITIAL_EVALUATION`, `PROGRESS`, `DISCHARGE`, `REFERRAL`, `LEGAL`, `INSURANCE`, `CUSTOM`

### Estats d'informe (5 estats)
`DRAFT`, `IN_REVIEW`, `COMPLETED`, `ARCHIVED`, `DELETED`

### Opcions
- **Contingut xifrat** (AES-256-GCM)
- **Generat per IA** — Flag `aiGenerated` + `aiConfidence`
- **Revisió humana** — `humanReviewConfirmed`
- **Signatura professional** — `professionalSignature`
- **Versionat** — Camp `version`
- **Exportació** — PDF (via PDFKit) i Word (via docx)

---

## 6. Intel·ligència Artificial (`ai`)

### Endpoints (4 endpoints)

| # | Mètode | Endpoint | Funcionalitat | Guard |
|---|--------|----------|---------------|-------|
| 1 | `POST` | `/ai/session/:id/analyze` | Analitzar sessió amb IA | FeatureGuard (advancedAnalytics) |
| 2 | `POST` | `/ai/suggestions` | Obtenir suggeriments terapèutics | FeatureGuard (advancedAnalytics) |
| 3 | `POST` | `/ai/transcribe` | Transcriure àudio (Gemini/Whisper) | JWT |
| 4 | `POST` | `/ai/help` | Preguntar al assistent IA | FeatureGuard (advancedAnalytics) |

### Serveis interns (3 serveis)
1. **`AiService`** — Generació d'anàlisis, suggeriments, informes amb Gemini Pro
2. **`TranscriptionService`** — Transcripció d'àudio amb Gemini Flash / OpenAI Whisper
3. **`VectorStoreService`** — Emmagatzematge vectorial (per RAG futur)

### Formats d'àudio acceptats
`mp3`, `wav`, `ogg`, `webm`, `m4a`, `flac` (màxim 50 MB)

---

## 7. Pagaments i Subscripcions (`payments`)

### Endpoints (12 endpoints)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/payments/plans` | Llistar plans disponibles (públic) |
| 2 | `POST` | `/payments/create-checkout-session` | Crear sessió Stripe Checkout |
| 3 | `POST` | `/payments/create-checkout-session-demo` | Checkout en mode demo |
| 4 | `POST` | `/payments/verify-session` | Verificar sessió de checkout |
| 5 | `POST` | `/payments/checkout/initial` | Checkout inicial post-registre |
| 6 | `POST` | `/payments/create-customer` | Crear client Stripe |
| 7 | `POST` | `/payments/create-portal-session` | Crear portal d'auto-gestió Stripe |
| 8 | `PATCH` | `/payments/subscription` | Actualitzar subscripció (upgrade/downgrade) |
| 9 | `DELETE` | `/payments/subscription` | Cancel·lar subscripció |
| 10 | `GET` | `/payments/subscription-status` | Estat de la subscripció |
| 11 | `GET` | `/payments/usage` | Ús actual (minuts, casos) |
| 12 | `GET` | `/payments/advanced-analytics` | Analytics avançades (Feature Guard) |
| 13 | `POST` | `/payments/webhook` | Webhook de Stripe |
| 14 | `POST` | `/payments/simulate-success` | Simular pagament OK (Admin) |

### Plans i preus (10 productes)

| Producte | Preu | Tipus |
|----------|------|-------|
| Basic | 29€/mes | Subscripció |
| Pro | 59€/mes | Subscripció |
| Premium | 99€/mes | Subscripció |
| Basic Anual | 290€/any | Subscripció |
| Pro Anual | 590€/any | Subscripció |
| Premium Anual | 990€/any | Subscripció |
| Agenda Manager | 15€/mes | Add-on |
| Pack Minuts IA | 15€ | One-time (500 min) |
| Pack 10 Casos | 15€ | One-time (10 casos) |
| Pack Onboarding | 50€ | One-time |

### Serveis interns (3 serveis)
1. **`PaymentsService`** — Lògica de Stripe, webhooks, subscripcions
2. **`StripeService`** — Client Stripe de baix nivell
3. **`UsageLimitsService`** — Control de límits per pla, packs extra

---

## 8. Simulador de Casos Clínics (`simulator`)

### Endpoints (4+ endpoints)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/simulator/demo/start` | Demo pública (sense auth) |
| 2 | `POST` | `/simulator/start` | Iniciar sessió amb pacient virtual |
| 3 | `POST` | `/simulator/message` | Enviar missatge al pacient virtual |
| 4 | `POST` | `/simulator/end` | Finalitzar i obtenir avaluació |
| 5 | `GET` | `/simulator/reports` | Historial d'informes de simulació |

### Opcions
- **Dificultats**: `easy`, `medium`, `hard`
- **Avaluació**: `empathyScore`, `effectivenessScore`, `professionalismScore` (0-100)
- **Feedback** en format Markdown
- **Motor**: Google Gemini Pro

---

## 9. Notificacions (`notifications`)

### Endpoints (4 endpoints)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/notifications` | Llistar notificacions |
| 2 | `GET` | `/notifications/unread-count` | Comptador de no llegides |
| 3 | `PATCH` | `/notifications/:id/read` | Marcar com a llegida |
| 4 | `PATCH` | `/notifications/read-all` | Marcar totes com a llegides |

### Tipus: `INFO`, `SUCCESS`, `WARNING`, `ERROR`
### Transport: Socket.io (temps real) + persistència a BBDD

---

## 10. Videollamades WebRTC (`webrtc`)

### Endpoints (1 endpoint)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/webrtc/ice-config` | Obtenir configuració ICE/STUN/TURN |

### Infraestructura
- **Senyalització**: Socket.io (WebSockets)
- **Mitjans**: WebRTC peer-to-peer
- **NAT Traversal**: Coturn (servidor STUN/TURN propi en Docker)

---

## 11. Google Calendar (`google`)

### Endpoints (3 endpoints)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/google/auth-url` | Obtenir URL d'autorització Google |
| 2 | `POST` | `/google/callback` | Processar callback d'autorització |
| 3 | `GET` | `/google/events` | Llistar esdeveniments del calendari |

---

## 12. Dashboard del Professional (`dashboard`)

### Endpoints (1 endpoint)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/dashboard/stats` | Estadístiques agregades del professional |

### Mètriques incloses
- Total clients actius
- Sessions programades/completades
- Informes generats
- Minuts de transcripció usats
- Alertes i recordatoris pendents

---

## 13. Administració (`admin`)

### Endpoints (~15 endpoints)

| # | Mètode | Endpoint | Funcionalitat |
|---|--------|----------|---------------|
| 1 | `GET` | `/admin/dashboard` | KPIs globals (usuaris, ingressos, sessions, informes) |
| 2 | `GET` | `/admin/stats/evolution` | Evolució d'ingressos/subscripcions (1w/1m/3m/6m/1y) |
| 3 | `GET` | `/admin/stats/usage-evolution` | Evolució d'ús (minuts, simulador) |
| 4 | `GET` | `/admin/logs` | Logs d'auditoria (paginats, filtres avançats) |
| 5 | `GET` | `/admin/plans` | Configuració de plans |
| 6 | `GET` | `/admin/users` | Tots els usuaris amb detalls |
| 7 | `POST` | `/admin/communicate` | Enviar email/notificació massiva |
| 8 | `PATCH` | `/admin/users/:id` | Actualitzar usuari |
| 9 | `DELETE` | `/admin/users/:id` | Eliminar usuari |
| 10 | `PATCH` | `/admin/users/:id/role` | Canviar rol |
| 11 | `PATCH` | `/admin/users/:id/password` | Canviar contrasenya |

### Filtres de logs d'auditoria
- Per usuari, per acció, per recurs
- Per data (rang)
- Per errors (errorOnly)
- Cerca per nom/email

---

## 14. Auditoria (`audit`)

### Accions registrades (15 accions)
`CREATE`, `READ`, `UPDATE`, `DELETE`, `LOGIN`, `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `FAILED_LOGIN`, `PASSWORD_RESET`, `EMAIL_VERIFICATION`, `SUBSCRIPTION_CHANGE`, `DATA_EXPORT`, `DATA_IMPORT`, `CONSENT_GRANTED`, `CONSENT_REVOKED`

### Dades capturades per registre
- userId, acció, recursTipus, recursId
- IP, userAgent, mètode HTTP, URL
- Valors anteriors/posteriors (JSON)
- isSuccess, errorMessage, riskScore

---

## 15. Xifrat i Seguretat (`encryption`)

### Capacitats
- **AES-256-GCM** amb IV únic per operació
- **Rotació de claus** — Model `EncryptionKey` amb `isActive`
- **Dades xifrades**: Dades personals/clíniques de clients, transcripcions, notes, informes
- **RSA per login** — Clau pública disponible a `/auth/public-key`

---

## 16. Email i Recordatoris (`email` + `reminders`)

### Emails transaccionals
- Bienvenida (registre)
- Verificació d'email
- Recordatori de sessió (24h i 1h abans)
- Canvi de contrasenya
- Notificació de pagament
- Comunicacions admin (massives)

### Recordatoris automatitzats
- **Servei CRON** — Revisa sessions properes i envia recordatoris
- Configurable per client (`sendEmailReminders`, `sendWhatsappReminders`)

---

## 17. Exportació de Dades (`export`)

### Formats disponibles
- **CSV** — Exportació GDPR de dades desxifrades
- **JSON** — Exportació GDPR legacy
- **PDF** — Informes clínics (via PDFKit)
- **Word/DOCX** — Informes clínics (via docx)

---

## 18. Consentiments (`consents`)

### Tipus de consentiment (5 tipus)
1. `AUDIO_RECORDING` — Gravació de sessió
2. `AI_PROCESSING` — Processament amb IA
3. `DATA_STORAGE` — Emmagatzematge de dades
4. `THIRD_PARTY_SHARING` — Compartir amb tercers
5. `MARKETING_COMMUNICATIONS` — Comunicacions comercials

---

## 19. Frontend — Pàgines i Components

### Rutes principals (13 seccions)

| Ruta | Descripció |
|------|------------|
| `/` | Landing page pública |
| `/auth/*` | Login, registre, completar perfil, Google OAuth |
| `/dashboard` | Dashboard principal (mètriques, widgets drag-and-drop) |
| `/dashboard/clients` | Gestió de pacients |
| `/dashboard/sessions` | Calendari i gestió de sessions |
| `/dashboard/reports` | Informes clínics |
| `/dashboard/simulator` | Simulador de casos clínics |
| `/dashboard/settings` | Configuració de compte |
| `/dashboard/statistics` | Estadístiques avançades |
| `/dashboard/activity` | Registre d'activitat |
| `/dashboard/compliance` | Compliance GDPR |
| `/dashboard/profile` | Perfil professional |
| `/video-call/:token` | Sala de videollamada |
| `/payment` | Flux de pagament |
| `/admin/*` | Panel d'administració |
| `/legal/*` | Pàgines legals |
| `/blog` | Blog |
| `/privacy` | Política de privacitat |
| `/simulator` | Simulador (ruta pública) |

### Components clau
- **Header** — Glassmorphism amb scroll detection, menú mòbil overlay
- **Dashboard Layout** — Sidebar dinàmic per rol, drag-and-drop widgets
- **Onboarding Guide** — Guia interactiva per nous usuaris (localStorage)
- **Language Switcher** — Selector d'idioma CA/ES/EN
- **SEO Components** — robots.ts, sitemap.ts

### Hooks personalitzats (8 hooks)
1. `useSocket` — Connexió WebSocket per notificacions
2. `useSpeechRecognition` — Reconeixement de veu en temps real
3. `useToast` — Sistema de notificacions UI
4. `useWebRTC` — Gestió de videollamades
5. `useAdmin` — Operacions d'administració
6. `useOnboarding` — Estat d'onboarding
7. `usePayments` — Operacions de pagament
8. `useRole` — Permisos per rol

### Internacionalització (3 idiomes)
- **Catalán** (`ca.json`) — Idioma per defecte
- **Español** (`es.json`)
- **Anglès** (`en.json`)

---

## 20. Infraestructura i DevOps

### Serveis Docker (5 serveis)
1. PostgreSQL 15 — Base de dades
2. Redis 7 — Cache i sessions
3. Backend NestJS — API (port 3001)
4. Frontend Next.js — App (port 3000)
5. Coturn — Servidor TURN/STUN

### Scripts de desplegament
- `deploy.sh` — Deploy complet (rebuild Docker)
- `deploy_fast.sh` — Deploy ràpid (sense rebuild)
- `check-env.sh` — Verificació de variables d'entorn

---

*Document generat automàticament: Setembre 2026*
