# 📘 Documentación Completa — PsicoAIssist Platform

> **Última actualización:** Marzo 2026  
> **Versión de la plataforma:** 0.1.0 (Beta)  
> **Estado:** En producción (entorno beta)

---

## Índice

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura del Repositorio](#4-estructura-del-repositorio)
5. [Base de Datos — Modelos y Esquema](#5-base-de-datos--modelos-y-esquema)
6. [Backend — Módulos y API](#6-backend--módulos-y-api)
7. [Frontend — Páginas y Componentes](#7-frontend--páginas-y-componentes)
8. [Autenticación y Seguridad](#8-autenticación-y-seguridad)
9. [Integración IA (Gemini / OpenAI)](#9-integración-ia-gemini--openai)
10. [Pagos con Stripe](#10-pagos-con-stripe)
11. [Videollamadas (WebRTC + Coturn)](#11-videollamadas-webrtc--coturn)
12. [Sistema de Notificaciones y Email](#12-sistema-de-notificaciones-y-email)
13. [Internacionalización (i18n)](#13-internacionalización-i18n)
14. [Variables de Entorno](#14-variables-de-entorno)
15. [Docker e Infraestructura](#15-docker-e-infraestructura)
16. [Despliegue en Producción](#16-despliegue-en-producción)
17. [Workflow de Desarrollo y Git](#17-workflow-de-desarrollo-y-git)
18. [Testing](#18-testing)
19. [Planes y Modelo de Negocio](#19-planes-y-modelo-de-negocio)
20. [Compliance y GDPR](#20-compliance-y-gdpr)

---

## 1. Visión General del Proyecto

**PsicoAIssist** es una plataforma integral SaaS dirigida a psicólogos clínicos, que combina herramientas de gestión de pacientes, sesiones terapéuticas, generación automática de informes y un asistente de Inteligencia Artificial. La plataforma también incluye un simulador de casos clínicos orientado a estudiantes y profesionales en formación.

### Objetivos clave

- Reducir hasta un **60% el tiempo** dedicado a documentación clínica.
- Proporcionar un **asistente IA ético** que sugiere, sin reemplazar al profesional.
- Garantizar **compliance GDPR/HIPAA** con cifrado extremo a extremo de datos clínicos.
- Ofrecer un **modelo SaaS por suscripción** escalable con planes Basic, Pro y Premium.

### Usuarios objetivo

| Rol | Descripción |
|-----|-------------|
| `PSYCHOLOGIST_BASIC` | Psicólogo con plan básico (25 clientes) |
| `PSYCHOLOGIST_PRO` | Psicólogo con plan Pro (clientes ilimitados + IA) |
| `PSYCHOLOGIST_PREMIUM` | Psicólogo con plan Premium (todo incluido) |
| `PSYCHOLOGIST` | Psicólogo sin plan activo |
| `STUDENT` | Estudiante con acceso al simulador |
| `AGENDA_MANAGER` | Gestor de agenda para un profesional |
| `PROFESSIONAL_GROUP` | Grupo de profesionales |
| `ADMIN` / `SUPER_ADMIN` | Administradores de la plataforma |

---

## 2. Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│               Next.js 14 — Port 3000                        │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP/WS
┌──────────────────────────▼───────────────────────────────────┐
│                      BACKEND (NestJS)                        │
│                  TypeScript — Port 3001                      │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │   Auth   │  │ Clients  │  │ Sessions │  │  Reports │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Admin   │  │    AI    │  │ Payments │  │  WebRTC  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────┬──────────────────────────────┬─────────────────────┘
          │                              │
┌─────────▼──────┐            ┌──────────▼──────────┐
│  PostgreSQL 15 │            │     Redis 7          │
│  (Datos BBDD)  │            │  (Cache + Sessions)  │
└────────────────┘            └─────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────┐
│                SERVICIOS EXTERNOS                           │
│  Google Gemini AI │ OpenAI Whisper │ Stripe │ Google OAuth │
│  Google Calendar  │  Nodemailer   │ STUN/TURN (Coturn)    │
└────────────────────────────────────────────────────────────┘
```

### Patrones de diseño aplicados

- **Módulos desacoplados** (NestJS DI)
- **Repository pattern** via Prisma
- **Guard pattern** para autenticación y roles (RBAC)
- **Interceptors globales** para logging y métricas
- **DTO validation** con `class-validator`
- **Event-driven** para notificaciones en tiempo real (Websockets)

---

## 3. Stack Tecnológico

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 14.0.4 | Framework React con App Router |
| React | 18.2.0 | UI Library |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.x | Estilos utilitarios |
| shadcn/ui | latest | Componentes accesibles (Radix UI) |
| Zustand | 4.4.6 | Estado global |
| React Hook Form | 7.x | Formularios |
| Zod | 3.x | Validación de esquemas |
| next-intl | 4.x | Internacionalización (CA, ES, EN) |
| Recharts | 3.x | Gráficas y dashboards |
| socket.io-client | 4.x | Notificaciones en tiempo real |
| Stripe.js | 8.x | Pagos desde el frontend |
| react-big-calendar | 1.x | Calendario de sesiones |
| dnd-kit | 6.x | Drag and drop para dashboard |
| Playwright | 1.x | Tests E2E |

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| NestJS | 10.x | Framework Node.js modular |
| TypeScript | 5.x | Tipado estático |
| Prisma | 5.22.0 | ORM + migraciones |
| PostgreSQL | 15 | Base de datos relacional |
| Redis | 7 | Caché y sesiones |
| JWT (Passport) | 10.x | Autenticación stateless |
| Helmet | 7.x | Headers de seguridad HTTP |
| Throttler | 5.x | Rate limiting |
| bcrypt | 5.x | Hash de contraseñas |
| Nodemailer | 6.x | Envío de emails |
| Socket.io | 4.x | WebSockets |
| Google Generative AI | 0.24 | Gemini Flash/Pro |
| OpenAI | 4.x | Whisper transcripción |
| Stripe | 14.x | Pagos y suscripciones |
| googleapis | 169.x | Google Calendar, OAuth |
| pdfkit | 0.17 | Generación de PDFs |
| docx | 9.x | Generación de documentos Word |

### Infraestructura

| Servicio | Rol |
|---|---|
| Docker + Docker Compose | Contenedorización de todos los servicios |
| Coturn | Servidor STUN/TURN para WebRTC (videollamadas) |
| Nginx | Proxy inverso en producción |
| GitHub Actions / CI | Pipeline CI/CD |

---

## 4. Estructura del Repositorio

```
psicoaissist-platform/
│
├── frontend/                        # Next.js 14 App
│   ├── src/
│   │   ├── app/[locale]/            # Rutas internacionalizadas
│   │   │   ├── admin/               # Panel administración
│   │   │   ├── auth/                # Login, registro, OAuth
│   │   │   ├── dashboard/           # Dashboard principal
│   │   │   ├── blog/                # Sección blog
│   │   │   ├── clinic/              # Gestión clínica
│   │   │   ├── legal/               # Páginas legales
│   │   │   ├── payment/             # Flujo de pagos
│   │   │   ├── simulator/           # Simulador de casos
│   │   │   └── video-call/          # Videollamadas
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── dashboard/           # Widgets del dashboard
│   │   │   ├── ui/                  # Componentes base (shadcn)
│   │   │   └── ...
│   │   ├── services/                # Capa de llamadas a la API
│   │   ├── store/                   # Estado global (Zustand)
│   │   ├── hooks/                   # Custom hooks
│   │   ├── types/                   # Tipos TypeScript compartidos
│   │   ├── lib/                     # Utilidades y helpers
│   │   └── middleware.ts            # Middleware de i18n + auth
│   ├── messages/                    # Archivos de traducción
│   │   ├── ca.json                  # Catalán
│   │   ├── es.json                  # Español
│   │   └── en.json                  # Inglés
│   ├── public/                      # Assets estáticos
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/                         # NestJS API
│   ├── src/
│   │   ├── main.ts                  # Bootstrap + config global
│   │   ├── app.module.ts            # Módulo raíz
│   │   ├── modules/                 # Módulos de negocio
│   │   │   ├── admin/               # Gestión administrativa
│   │   │   ├── ai/                  # Integración IA (Gemini/OpenAI)
│   │   │   ├── audit/               # Registro de auditoría
│   │   │   ├── auth/                # Autenticación JWT + Google
│   │   │   ├── clients/             # Gestión de pacientes
│   │   │   ├── dashboard/           # Métricas del dashboard
│   │   │   ├── email/               # Envío de emails
│   │   │   ├── encryption/          # Cifrado AES-256
│   │   │   ├── export/              # Exportación de datos
│   │   │   ├── google/              # Google Calendar sync
│   │   │   ├── notifications/       # Notificaciones en tiempo real
│   │   │   ├── payments/            # Stripe + suscripciones
│   │   │   ├── reminders/           # Recordatorios automatizados
│   │   │   ├── reports/             # Generación de informes
│   │   │   ├── sessions/            # Sesiones terapéuticas
│   │   │   ├── simulator/           # Simulador de casos clínicos
│   │   │   ├── users/               # Gestión de usuarios
│   │   │   └── webrtc/              # Videollamadas WebRTC
│   │   ├── common/                  # Servicios compartidos
│   │   │   ├── prisma/              # PrismaService
│   │   │   └── ...
│   │   └── config/                  # Configuración de la app
│   ├── prisma/
│   │   ├── schema.prisma            # Esquema de la BBDD
│   │   ├── migrations/              # Migraciones versionadas
│   │   └── seed.ts                  # Datos de ejemplo
│   └── Dockerfile
│
├── docs/                            # Documentación del proyecto
│   ├── DOCUMENTACION.md             # ← Este archivo
│   ├── 00-resumen-ejecutivo.md
│   ├── 01-especificaciones-tecnicas.md
│   ├── 02-stack-tecnologico.md
│   ├── 03-documentos-legales.md
│   ├── 04-wireframes-prototipos.md
│   └── 05-roadmap-desarrollo.md
│
├── coturn/                          # Config servidor TURN
│   └── turnserver.conf
│
├── docker-compose.yml               # Producción
├── docker-compose.dev.yml           # Desarrollo local
├── deploy.sh                        # Script de deploy completo
├── deploy_fast.sh                   # Deploy rápido (sin rebuild)
├── .env                             # Variables de entorno (¡no commitear!)
├── .env.production
├── README.md
├── DEPLOY.md
└── GIT_WORKFLOW.md
```

---

## 5. Base de Datos — Modelos y Esquema

La base de datos es **PostgreSQL 15** gestionada con **Prisma ORM**. Los datos clínicos sensibles se almacenan **cifrados con AES-256-GCM** en campos de tipo `Bytes`.

### Modelos principales

#### `User` — Usuarios de la plataforma
```
id, email, passwordHash, role, status
firstName, lastName, phone, country
professionalNumber, speciality
preferredLanguage (default: "ca")
stripeCustomerId          ← Vinculación con Stripe
googleCalendarId          ← Integración Google Calendar
googleRefreshToken
referralCode, referralCredits  ← Sistema de referidos
simulatorMinutesUsed
transcriptionMinutesUsed
bufferTime, defaultDuration, workStartHour, workEndHour
scheduleConfig (JSON), dashboardLayout (JSON)
brandingConfig (JSON)     ← White label (plan Premium)
```

#### `Client` — Pacientes (datos cifrados)
```
id, userId (FK → User)
encryptedPersonalData (Bytes)   ← Cifrado AES-256
encryptedClinicalData (Bytes)   ← Cifrado AES-256
encryptedSensitiveData (Bytes)  ← Cifrado AES-256
encryptionKeyId
riskLevel (LOW|MEDIUM|HIGH|CRITICAL)
tags, isActive
firstSessionAt, lastSessionAt
sendEmailReminders, sendWhatsappReminders
```

#### `Session` — Sesiones terapéuticas
```
id, clientId, userId
startTime, endTime, duration
sessionType (INDIVIDUAL|GROUP|FAMILY|COUPLE|CONSULTATION|EMERGENCY)
status (SCHEDULED|IN_PROGRESS|COMPLETED|CANCELLED|NO_SHOW)
encryptedTranscription (Bytes)  ← Transcripción IA cifrada
encryptedNotes (Bytes)          ← Notas del terapeuta cifradas
encryptedAudioPath (String)     ← Ruta del audio cifrada
aiSuggestions (JSON)            ← Sugerencias de la IA
audioQuality (LOW|MEDIUM|HIGH|ULTRA)
recordingConsent, consentSigned
videoCallToken (unique)         ← Token para videollamada
googleEventId                   ← Evento en Google Calendar
```

#### `Report` — Informes clínicos
```
id, clientId, userId, sessionId
title, reportType (INITIAL_EVALUATION|PROGRESS|DISCHARGE|...)
status (DRAFT|IN_REVIEW|COMPLETED|ARCHIVED|DELETED)
encryptedContent (Bytes)        ← Contenido cifrado
aiGenerated, aiConfidence
humanReviewConfirmed
professionalSignature
```

#### `Subscription` — Suscripciones Stripe
```
id, userId
stripeSubscriptionId
status, planType
currentPeriodStart, currentPeriodEnd
canceledAt
```

#### `AuditLog` — Registro de auditoría
```
id, userId, action, resourceType, resourceId
ipAddress, userAgent, method, url
oldValues (JSON), newValues (JSON)
isSuccess, errorMessage, riskScore
```

#### `SimulationReport` — Informes del simulador
```
id, userId
patientName, difficulty, scenario
empathyScore, effectivenessScore, professionalismScore
feedbackMarkdown
```

#### Otros modelos
- `EncryptionKey` — Claves de cifrado por usuario (rotación de claves)
- `Consent` — Consentimientos de pacientes (AUDIO_RECORDING, AI_PROCESSING, etc.)
- `Notification` — Notificaciones en app (INFO|SUCCESS|WARNING|ERROR)
- `AdminTask` — Tareas administrativas (ONBOARDING_SETUP, SUPPORT_REQUEST, etc.)

---

## 6. Backend — Módulos y API

Todos los endpoints están bajo el prefijo `/api/v1`. La documentación Swagger está disponible en `/api/docs`.

### Módulo `auth` — Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/login` | Login con email y contraseña | ❌ |
| `POST` | `/auth/register` | Registro de nuevo usuario | ❌ |
| `POST` | `/auth/logout` | Cierre de sesión (limpia cookies) | ❌ |
| `POST` | `/auth/refresh` | Renovar access token | ❌ |
| `GET` | `/auth/me` | Obtener perfil del usuario | ✅ JWT |
| `PATCH` | `/auth/me` | Actualizar perfil | ✅ JWT |
| `PATCH` | `/auth/change-password` | Cambiar contraseña | ✅ JWT |
| `POST` | `/auth/verify-password` | Verificar contraseña (Sudo Mode) | ✅ JWT |
| `GET` | `/auth/verify-email` | Verificar email con token | ❌ |
| `GET` | `/auth/google` | Iniciar OAuth con Google | ❌ |
| `GET` | `/auth/google/callback` | Callback de Google OAuth | ❌ |
| `POST` | `/auth/google/complete` | Completar registro vía Google | ❌ |
| `GET` | `/auth/public-key` | Obtener clave pública RSA | ❌ |

### Módulo `users` — Gestión de usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/users` | Listar usuarios | ✅ Admin |
| `POST` | `/users` | Crear usuario | ✅ Admin |
| `GET` | `/users/:id` | Obtener usuario | ✅ JWT |
| `PATCH` | `/users/:id` | Actualizar usuario | ✅ Admin |
| `DELETE` | `/users/:id` | Eliminar usuario | ✅ Admin |
| `PATCH` | `/users/:id/role` | Cambiar rol | ✅ Admin |

### Módulo `clients` — Pacientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/clients` | Listar clientes del profesional |
| `POST` | `/clients` | Crear cliente (datos cifrados) |
| `GET` | `/clients/:id` | Obtener cliente (desencriptado) |
| `PATCH` | `/clients/:id` | Actualizar cliente |
| `DELETE` | `/clients/:id` | Desactivar cliente |

### Módulo `sessions` — Sesiones terapéuticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/sessions` | Listar sesiones |
| `POST` | `/sessions` | Crear sesión |
| `GET` | `/sessions/:id` | Obtener sesión |
| `PATCH` | `/sessions/:id` | Actualizar sesión |
| `POST` | `/sessions/:id/start` | Iniciar sesión (grabación) |
| `POST` | `/sessions/:id/end` | Finalizar sesión |
| `POST` | `/sessions/:id/upload-audio` | Subir audio para transcripción |
| `GET` | `/sessions/:id/transcription` | Obtener transcripción (desencriptada) |

### Módulo `reports` — Informes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/reports` | Listar informes |
| `POST` | `/reports` | Crear informe (manual o IA) |
| `GET` | `/reports/:id` | Obtener informe |
| `PATCH` | `/reports/:id` | Actualizar informe |
| `GET` | `/reports/:id/export/pdf` | Exportar a PDF |
| `GET` | `/reports/:id/export/docx` | Exportar a Word |

### Módulo `ai` — Inteligencia Artificial

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/ai/transcribe` | Transcribir audio (Gemini/OpenAI) |
| `POST` | `/ai/analyze` | Analizar sesión con IA |
| `POST` | `/ai/suggestions` | Obtener sugerencias terapéuticas |
| `POST` | `/ai/generate-report` | Generar informe automático |

### Módulo `payments` — Pagos Stripe

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/payments/plans` | Listar planes disponibles |
| `POST` | `/payments/create-checkout` | Crear sesión de pago Stripe |
| `POST` | `/payments/webhook` | Webhook de Stripe (eventos) |
| `GET` | `/payments/subscription` | Estado de suscripción |
| `POST` | `/payments/cancel` | Cancelar suscripción |
| `POST` | `/payments/buy-pack` | Comprar pack (minutos/casos) |

### Módulo `admin` — Administración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/dashboard` | Estadísticas globales (KPIs) |
| `GET` | `/admin/stats/evolution` | Evolución de ingresos/suscripciones |
| `GET` | `/admin/stats/usage-evolution` | Evolución de uso (minutos, simulador) |
| `GET` | `/admin/logs` | Logs de auditoría paginados |
| `GET` | `/admin/plans` | Planes configurados |
| `GET` | `/admin/users` | Todos los usuarios |
| `POST` | `/admin/communicate` | Enviar email/notificación masiva |

### Módulo `simulator` — Simulador de casos clínicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/simulator/start` | Iniciar sesión con paciente virtual |
| `POST` | `/simulator/message` | Enviar mensaje al paciente virtual |
| `POST` | `/simulator/end` | Finalizar y obtener evaluación |
| `GET` | `/simulator/reports` | Historial de informes de simulación |

### Módulo `notifications` — Notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/notifications` | Listar notificaciones del usuario |
| `PATCH` | `/notifications/:id/read` | Marcar como leída |
| `PATCH` | `/notifications/read-all` | Marcar todas como leídas |

### Módulo `webrtc` — Videollamadas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/webrtc/token` | Generar token de sesión de video |
| `GET` | `/webrtc/ice-servers` | Obtener configuración ICE/TURN |

### Otros módulos

- **`google`** — Sincronización con Google Calendar (creación/actualización/eliminación de eventos)
- **`reminders`** — Recordatorios automáticos por email antes de sesiones
- **`audit`** — Registro centralizado de todas las acciones del sistema
- **`encryption`** — Servicio de cifrado/descifrado AES-256-GCM
- **`export`** — Exportación de datos en formatos PDF, Word, ZIP
- **`email`** — Envío de emails transaccionales (bienvenida, recordatorios, cambio de contraseña)
- **`dashboard`** — Agregación de métricas para el dashboard del profesional

---

## 7. Frontend — Páginas y Componentes

### Rutas principales (App Router `[locale]/`)

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page pública |
| `/auth/login` | Página de login |
| `/auth/register` | Página de registro |
| `/auth/complete-profile` | Completar perfil post-OAuth |
| `/dashboard` | Dashboard principal del psicólogo |
| `/dashboard/clients` | Listado y gestión de pacientes |
| `/dashboard/clients/:id` | Detalle de un paciente |
| `/dashboard/sessions` | Calendario y listado de sesiones |
| `/dashboard/sessions/:id` | Detalle de sesión (notas, audio, transcripción) |
| `/dashboard/reports` | Informes generados |
| `/dashboard/reports/:id` | Visor/editor de informe |
| `/dashboard/simulator` | Simulador de casos clínicos |
| `/dashboard/settings` | Configuración de cuenta y perfil |
| `/dashboard/settings/billing` | Gestión de suscripción y facturación |
| `/video-call/:token` | Sala de videollamada |
| `/payment` | Flujo de pago y selección de plan |
| `/admin` | Panel de administración |
| `/admin/users` | Gestión de usuarios |
| `/admin/logs` | Logs de auditoría |
| `/admin/dashboard` | KPIs y estadísticas globales |
| `/legal` | Páginas legales |
| `/blog` | Blog/artículos |

### Componentes clave

- **`DashboardLayout`** — Layout principal con sidebar dinámico por rol/plan
- **`SessionRecorder`** — Grabación de audio en browser (MediaRecorder API)
- **`TranscriptionViewer`** — Visualización de transcripciones cifradas
- **`ReportEditor`** — Editor de informes con asistencia IA
- **`SimulatorChat`** — Interfaz de chat con paciente virtual
- **`VideoCall`** — Sala de videollamada con WebRTC
- **`CalendarView`** — Calendario de sesiones (react-big-calendar)
- **`UpgradePlanModal`** — Modal para upgrade de plan con Stripe
- **`NotificationsPanel`** — Panel de notificaciones en tiempo real

---

## 8. Autenticación y Seguridad

### Flujo de autenticación

1. El usuario envía credenciales a `POST /auth/login`
2. El backend valida con `bcrypt`, genera `accessToken` (JWT, 15 min) y `refreshToken` (JWT, 7 días)
3. Ambos tokens se almacenan en **cookies HttpOnly** (no accesibles desde JavaScript)
4. Cada petición autenticada incluye automáticamente la cookie
5. Al expirar el access token, el cliente llama a `POST /auth/refresh`

### Guards y roles (RBAC)

```typescript
// Ejemplo de uso en controladores
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
```

- **`JwtAuthGuard`** — Valida la presencia y validez del JWT
- **`RolesGuard`** — Verifica que el rol del usuario sea el requerido
- **`GoogleAuthGuard`** — Gestiona el flujo OAuth 2.0 con Google

### Google OAuth 2.0

1. El usuario hace clic en "Iniciar sesión con Google"
2. Redirige a `GET /auth/google` → Google OAuth screen
3. Google hace callback a `GET /auth/google/callback`
4. Si el usuario es nuevo → redirige a completar perfil
5. Si usuario existente → genera tokens y redirige al dashboard

### Medidas de seguridad

| Medida | Implementación |
|--------|---------------|
| Hashing de contraseñas | `bcrypt` (saltRounds: 10) |
| Cifrado de datos clínicos | AES-256-GCM con IV único por operación |
| Rotación de claves de cifrado | Modelo `EncryptionKey` con `isActive` |
| Rate limiting | 100 req/min global; 5 intentos auth/15 min |
| Headers de seguridad | `helmet` (CSP, HSTS, XSS protection, etc.) |
| CORS | Configurado por entorno (whitelist de dominios) |
| Auditoría completa | Registro de todas las acciones en `AuditLog` |
| RSA para login | Clave pública disponible en `/auth/public-key` |

---

## 9. Integración IA (Gemini / OpenAI)

La plataforma usa modelos de IA para tres funciones principales:

### Transcripción de audio

- **Motor primario**: Google Gemini Flash (audio → texto)
- **Motor alternativo**: OpenAI Whisper
- El audio se graba en el navegador, se sube al backend, se transcribe y el resultado se **cifra** antes de guardarse

### Análisis y sugerencias terapéuticas

- **Motor**: Google Gemini Pro
- Analiza la transcripción de la sesión
- Genera insights sobre: estado emocional, patrones de lenguaje, temas recurrentes
- **No emite diagnósticos** — Solo sugiere y destaca patrones (disclaimer claro en el UI)

### Generación automática de informes

- Lee la transcripción y notas del terapeuta
- Genera un borrador de informe estructurado (tipo SOAP, BIRP, etc.)
- El terapeuta siempre revisa y confirma (`humanReviewConfirmed`)

### Simulador de casos clínicos

- **Motor**: Google Gemini Pro
- Simula pacientes virtuales con distintas personalidades y patologías (dificultad configurable)
- Al finalizar, evalúa: `empathyScore`, `effectivenessScore`, `professionalismScore`
- Genera feedback detallado en formato Markdown

---

## 10. Pagos con Stripe

### Planes disponibles

| Plan | Precio | Tipo | Características |
|------|--------|------|----------------|
| Basic | 29€/mes | Mensual | 25 clientes, informes básicos |
| Pro | 59€/mes | Mensual | Clientes ilimitados, IA completa, videollamadas |
| Premium | 99€/mes | Mensual | Todo Pro + White label + API access |
| Basic Anual | 290€/año | Anual | Plan Basic con descuento |
| Pro Anual | 590€/año | Anual | Plan Pro con descuento |
| Premium Anual | 990€/año | Anual | Plan Premium con descuento |
| Agenda Manager | 15€/mes | Add-on | Gestor de agenda para un profesional |
| Pack Minutos IA | 15€ | One-time | 500 minutos extra de transcripción |
| Pack 10 Casos | 15€ | One-time | 10 casos del simulador |
| Pack Onboarding | 50€ | One-time | Configuración inicial + formación |

### Flujo de pago

1. Frontend llama a `POST /payments/create-checkout` con el plan seleccionado
2. Backend crea una sesión de Stripe Checkout y retorna la URL
3. Usuario es redirigido a Stripe para completar el pago
4. Stripe envía webhook a `POST /payments/webhook`
5. Backend procesa el evento, actualiza la suscripción y el rol del usuario
6. Frontend detecta el cambio via `/auth/me` y actualiza el UI

### Variables Stripe necesarias en `.env`

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

---

## 11. Videollamadas (WebRTC + Coturn)

### Arquitectura

- **Señalización**: Socket.io (WebSockets) via el backend NestJS
- **Media**: WebRTC peer-to-peer directo en el navegador
- **NAT Traversal**: Servidor STUN/TURN propio con **Coturn** (en Docker)

### Flujo de videollamada

1. Profesional crea una sesión con `videoCallToken` (único)
2. Comparte el enlace `/video-call/:token` con el paciente
3. Ambos obtienen configuración ICE: `GET /webrtc/ice-servers`
4. Establecen conexión WebRTC peer-to-peer
5. Si la conexión P2P falla (NAT estricto), el tráfico pasa por el servidor TURN

### Configuración Coturn

```env
TURN_SECRET=tu-secret-seguro
TURN_REALM=psicoaissist.com
EXTERNAL_IP=1.2.3.4  # IP pública del servidor
```

---

## 12. Sistema de Notificaciones y Email

### Notificaciones en tiempo real

- **Tecnología**: Socket.io (WebSockets)
- El frontend se conecta al socket tras el login
- El backend emite eventos al socket del usuario cuando hay actualizaciones
- Las notificaciones se persisten en la tabla `Notification`
- Tipos: `INFO`, `SUCCESS`, `WARNING`, `ERROR`

### Emails transaccionales

Gestionados por el módulo `email` usando **Nodemailer**:

| Email | Cuándo se envía |
|-------|----------------|
| Bienvenida | Tras registro exitoso |
| Verificación de email | Tras registro (si verificación activada) |
| Recordatorio de sesión | 24h y 1h antes de la sesión |
| Cambio de contraseña | Tras cambiar la contraseña |
| Notificación de pago | Tras completar una suscripción |
| Comunicaciones admin | Envío masivo desde el panel admin |

---

## 13. Internacionalización (i18n)

- **Librería**: `next-intl` en el frontend; `nestjs-i18n` en el backend
- **Idiomas soportados**: Catalán (`ca`), Español (`es`), Inglés (`en`)
- **Idioma por defecto**: Catalán (`ca`) — configurable por usuario en `preferredLanguage`
- Los archivos de traducción están en `frontend/messages/[lang].json`
- El middleware de Next.js gestiona la detección y redirección de locale

---

## 14. Variables de Entorno

### Backend (`.env`)

```env
# Base de datos
POSTGRES_DB=psicoaissist_beta_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=****
DATABASE_URL=postgresql://postgres:****@127.0.0.1:5432/psicoaissist_beta_db

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=****

# JWT
JWT_SECRET=****
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=****
JWT_REFRESH_EXPIRES_IN=7d

# Cifrado
ENCRYPTION_KEY=****  # 32 caracteres exactos

# Servidor
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://tudominio.com

# Google OAuth
GOOGLE_CLIENT_ID=****
GOOGLE_CLIENT_SECRET=****
GOOGLE_CALLBACK_URL=https://tudominio.com/api/v1/auth/google/callback

# Google AI
GOOGLE_GEMINI_API_KEY=****

# OpenAI
OPENAI_API_KEY=****

# Stripe
STRIPE_SECRET_KEY=sk_live_****
STRIPE_PUBLISHABLE_KEY=pk_live_****
STRIPE_WEBHOOK_SECRET=whsec_****
STRIPE_BASIC_PRICE_ID=price_****
STRIPE_PRO_PRICE_ID=price_****
STRIPE_PREMIUM_PRICE_ID=price_****

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=****
SMTP_PASS=****
SMTP_FROM=noreply@psicoaissist.com

# Coturn / WebRTC
TURN_SECRET=****
TURN_REALM=psicoaissist.com
EXTERNAL_IP=1.2.3.4
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=https://tudominio.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://tudominio.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_****
NEXT_PUBLIC_APP_NAME=PsicoAIssist
NEXT_PUBLIC_APP_URL=https://tudominio.com
INTERNAL_API_URL=http://host.docker.internal:3001/api/v1  # SSR interno
```

---

## 15. Docker e Infraestructura

### Servicios Docker

| Servicio | Imagen | Puerto expuesto | Descripción |
|----------|--------|-----------------|-------------|
| `postgres` | `postgres:15-alpine` | `127.0.0.1:5432` | Base de datos |
| `redis` | `redis:7-alpine` | `127.0.0.1:6379` | Caché y sesiones |
| `coturn` | `coturn/coturn` | Host network | Servidor TURN para WebRTC |
| `backend` | Build propio | Host network (3001) | API NestJS |
| `frontend` | Build propio | `3000:3000` | App Next.js |

> **Nota sobre `network_mode: host`**: El backend y coturn usan `host` network para permitir el acceso a Google APIs (IPv6) y para que Coturn pueda hacer NAT traversal correctamente.

### Comandos Docker útiles

```bash
# Levantar entorno completo
docker compose up -d

# Ver logs de un servicio
docker compose logs -f backend
docker compose logs -f frontend

# Acceder a la base de datos
docker exec -it psicoaissist_beta_db psql -U postgres -d psicoaissist_beta_db

# Reiniciar un servicio específico
docker compose restart backend

# Estado de todos los contenedores
docker ps
```

---

## 16. Despliegue en Producción

### Primera vez (setup inicial)

```bash
# 1. Clonar el repositorio
git clone <URL_REPO> psicoaissist-platform
cd psicoaissist-platform
git checkout main

# 2. Configurar variables de entorno
cp env.beta.example.txt .env
nano .env  # Editar con valores reales

# 3. Dar permisos al script
chmod +x deploy.sh deploy_fast.sh

# 4. Primer despliegue (reconstruye todo)
./deploy.sh
```

### Actualizaciones (día a día)

```bash
# Deploy completo (reconstruye imágenes Docker)
./deploy.sh

# Deploy rápido (solo actualiza código, sin rebuild)
./deploy_fast.sh
```

### Migraciones de base de datos en producción

```bash
# Aplicar migraciones pendientes (sin reset de datos)
docker exec psicoaissist_beta_backend npx prisma migrate deploy

# Generar cliente Prisma (tras cambios de schema)
docker exec psicoaissist_beta_backend npx prisma generate
```

### URLs de acceso

- **Frontend**: `http://TU_IP:3000`
- **Backend API**: `http://TU_IP:3001/api/v1`
- **Swagger UI**: `http://TU_IP:3001/api/docs`

---

## 17. Workflow de Desarrollo y Git

### Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Código en producción. Siempre estable. |
| `development` | Rama de desarrollo activo. |
| `feature/*` | Funcionalidades nuevas. Se mergea a `development`. |
| `hotfix/*` | Correcciones urgentes. Se mergea a `main` y `development`. |

### Flujo de trabajo estándar

```bash
# 1. Trabajar siempre desde `development`
git checkout development
git pull origin development

# 2. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Desarrollar y commitear
git add .
git commit -m "feat: descripción del cambio"

# 4. Mergear a development
git checkout development
git merge feature/nueva-funcionalidad

# 5. Cuando development está listo para producción
git checkout main
git merge development
git push origin main

# 6. Volver a development
git checkout development
```

### Comandos de desarrollo local

```bash
# Backend en modo desarrollo (hot-reload)
cd backend
npm run start:dev

# Frontend en modo desarrollo
cd frontend
npm run dev

# Prisma Studio (explorador de base de datos)
cd backend
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name nombre-de-la-migracion

# Aplicar migraciones existentes
npx prisma db push
```

---

## 18. Testing

### Backend

```bash
cd backend

# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

### Frontend

```bash
cd frontend

# Tests E2E con Playwright
npm run test:e2e

# Ver reporte de Playwright
npx playwright show-report
```

---

## 19. Planes y Modelo de Negocio

### Estructura de precios

```
┌──────────────┬──────────────┬──────────────┐
│  BASIC       │  PRO         │  PREMIUM     │
│  29€/mes     │  59€/mes     │  99€/mes     │
├──────────────┼──────────────┼──────────────┤
│ 25 clientes  │ Ilimitados   │ Todo Pro +   │
│ Sesiones     │ IA completa  │ White Label  │
│ Informes     │ Transcripción│ API Access   │
│ básicos      │ auto.        │ Soporte 24/7 │
│              │ Videoconf.   │ Simulador    │
│              │ Simulador    │ ilimitado    │
└──────────────┴──────────────┴──────────────┘
```

### Límites por plan (controlados en backend)

| Recurso | Basic | Pro | Premium |
|---------|-------|-----|---------|
| Clientes | 25 | ∞ | ∞ |
| Minutos transcripción/mes | 60 | 300 | 600 |
| Casos simulador/mes | 5 | 20 | ∞ |
| Videollamadas | ❌ | ✅ | ✅ |
| Exportación PDF/Word | Básica | ✅ | ✅ |
| Google Calendar | ❌ | ✅ | ✅ |
| White label | ❌ | ❌ | ✅ |

### Sistema de referidos

- Al crear una cuenta, el usuario recibe un `referralCode` único
- Por cada referido que se suscribe, el usuario acumula `referralCredits`
- Los créditos se aplican como descuento en futuras facturas (vía Stripe)

---

## 20. Compliance y GDPR

### Datos personales tratados

| Dato | Categoría | Base legal | Cifrado |
|------|-----------|------------|---------|
| Email, nombre | Personal | Contrato | No |
| Datos clínicos del paciente | Especialmente protegidos | Consentimiento explícito | ✅ AES-256 |
| Transcripciones de sesiones | Especialmente protegidos | Consentimiento explícito | ✅ AES-256 |
| Datos de pago | Financiero | Contrato | Vía Stripe |
| Grabaciones de audio | Especialmente protegidos | Consentimiento explícito | ✅ Ruta cifrada |

### Consentimientos gestionados

El modelo `Consent` registra los siguientes tipos de consentimiento por paciente:
- `AUDIO_RECORDING` — Grabación de sesión
- `AI_PROCESSING` — Procesamiento con IA
- `DATA_STORAGE` — Almacenamiento de datos
- `THIRD_PARTY_SHARING` — Compartir con terceros
- `MARKETING_COMMUNICATIONS` — Comunicaciones comerciales

### Audit trail

Todas las acciones sobre datos sensibles quedan registradas en `AuditLog`:
- Quién realizó la acción (`userId`)
- Qué hizo (`action`: CREATE, READ, UPDATE, DELETE, LOGIN, etc.)
- Sobre qué recurso (`resourceType`, `resourceId`)
- Los valores antes y después del cambio (`oldValues`, `newValues`)
- IP, user agent, timestamp

### Retención de datos

- Los usuarios pueden solicitar la eliminación de su cuenta (implementado vía `status: DELETED`)
- Las claves de cifrado se rotan periódicamente (`EncryptionKey.isActive`)
- Los datos de auditoría se conservan según la normativa aplicable

---

## Contacto y Soporte

- 📧 **Email**: suport@psicoaissist.com
- 📖 **Documentación técnica adicional**: `docs/` en este repositorio
- 🐛 **Reporte de bugs**: Issues en el repositorio Git

---

*Documentación actualizada: Marzo 2026 — PsicoAIssist Platform v0.1.0 (Beta)*
