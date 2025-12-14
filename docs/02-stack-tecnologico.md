# STACK TECNOLÓGICO - APP ASISTENTE PSICÓLOGOS
*Documento creado en Fase 0 - Diciembre 2025*

## 🎯 ARQUITECTURA GENERAL

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    FRONTEND     │    │     BACKEND     │    │   SERVICIOS     │
│   (Next.js)     │◄──►│    (NestJS)     │◄──►│   EXTERNOS      │
│                 │    │                 │    │                 │
│ • React + TS    │    │ • PostgreSQL    │    │ • OpenAI API    │
│ • Tailwind CSS  │    │ • Redis Cache   │    │ • Stripe API    │
│ • shadcn/ui     │    │ • JWT Auth      │    │ • Email Service │
│ • WebRTC        │    │ • Prisma ORM    │    │ • File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🖥️ FRONTEND - Next.js + React

### Tecnologías principales
```json
{
  "framework": "Next.js 14+",
  "runtime": "React 18+",
  "language": "TypeScript 5+",
  "styling": "TailwindCSS 3+",
  "components": "shadcn/ui",
  "bundler": "Turbopack",
  "deployment": "Vercel / Docker"
}
```

### Librerías y dependencias

#### Core Dependencies
```bash
# Framework y React
next@latest
react@latest
react-dom@latest
typescript@latest

# Styling
tailwindcss@latest
@tailwindcss/forms
@tailwindcss/typography
shadcn-ui (via CLI)

# Estado global
@tanstack/react-query@latest  # Server state
zustand@latest               # Client state
```

#### UI y UX
```bash
# Componentes UI
@radix-ui/react-*            # Primitivos accesibles
lucide-react                 # Iconos
class-variance-authority     # Variantes de estilos
clsx                         # Utilidad de clases CSS

# Formularios y validación
react-hook-form@latest
@hookform/resolvers
zod@latest                   # Validación de esquemas

# Animaciones
framer-motion@latest
```

#### Funcionalidades específicas
```bash
# Audio y video
@types/webrtc               # Tipos TypeScript para WebRTC
socket.io-client            # WebSockets para tiempo real

# Editor de texto rico
@tiptap/react
@tiptap/pm
@tiptap/starter-kit
@tiptap/extension-*         # Extensiones específicas

# PDF y documentos
@react-pdf/renderer         # Generación PDF
html2canvas                 # Capturas de pantalla
jspdf                       # Alternativa PDF

# Utilerías
date-fns                    # Manejo de fechas
uuid                        # Generación de IDs únicos
crypto-js                   # Cifrado cliente
```

### Estructura de carpetas Frontend
```
frontend/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── (auth)/         # Grupo de autenticación
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── clients/        # Gestión clientes
│   │   ├── sessions/       # Sesiones en vivo
│   │   ├── reports/        # Generación informes
│   │   ├── simulator/      # Simulador consultas
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Landing page
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # shadcn/ui components
│   │   ├── forms/         # Formularios específicos
│   │   ├── charts/        # Gráficos y métricas
│   │   └── layout/        # Layouts y navegación
│   ├── lib/               # Utilidades y configuración
│   │   ├── auth.ts        # Configuración autenticación
│   │   ├── api.ts         # Cliente API
│   │   ├── utils.ts       # Funciones utilitarias
│   │   └── validations.ts # Esquemas Zod
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Estado global (Zustand)
│   ├── types/             # Definiciones TypeScript
│   └── styles/            # Estilos globales
├── public/                # Archivos estáticos
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

### Configuraciones importantes

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  images: {
    domains: ['localhost', 'api.domain.com'],
  },
  // Configuración para WebRTC
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
}

module.exports = nextConfig
```

#### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta específica para psicología
        therapy: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        calm: {
          50: '#f7fee7',
          500: '#65a30d',
          900: '#365314',
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

## 🔧 BACKEND - NestJS + PostgreSQL

### Tecnologías principales
```json
{
  "framework": "NestJS 10+",
  "runtime": "Node.js 18+",
  "language": "TypeScript 5+",
  "database": "PostgreSQL 15+",
  "orm": "Prisma 5+",
  "cache": "Redis 7+",
  "deployment": "Docker + Kubernetes"
}
```

### Librerías y dependencias

#### Core Dependencies
```bash
# Framework
@nestjs/core@latest
@nestjs/platform-express@latest
@nestjs/common@latest
@nestjs/config@latest

# Database y ORM
prisma@latest
@prisma/client@latest
@nestjs/prisma@latest

# Cache y sesiones
@nestjs/redis@latest
redis@latest

# Autenticación y seguridad
@nestjs/jwt@latest
@nestjs/passport@latest
passport-jwt@latest
bcrypt@latest
@nestjs/throttler@latest    # Rate limiting
helmet@latest               # Security headers
```

#### Funcionalidades específicas
```bash
# WebSockets para tiempo real
@nestjs/websockets@latest
@nestjs/platform-socket.io@latest
socket.io@latest

# Validación y transformación
class-validator@latest
class-transformer@latest

# Pagos
stripe@latest

# AI y procesamiento
openai@latest
@types/multer              # Upload archivos
multer@latest

# Email
@nestjs/mailer@latest
nodemailer@latest

# Documentación API
@nestjs/swagger@latest
swagger-ui-express@latest
```

### Estructura de carpetas Backend
```
backend/
├── src/
│   ├── modules/           # Módulos de negocio
│   │   ├── auth/         # Autenticación y autorización
│   │   ├── users/        # Gestión usuarios
│   │   ├── clients/      # Gestión clientes
│   │   ├── sessions/     # Sesiones terapéuticas
│   │   ├── reports/      # Generación informes
│   │   ├── ai/           # Servicios de IA
│   │   ├── payments/     # Integración Stripe
│   │   └── simulator/    # Simulador consultas
│   ├── common/           # Código compartido
│   │   ├── guards/       # Guards de autenticación
│   │   ├── decorators/   # Decoradores custom
│   │   ├── filters/      # Filtros de excepción
│   │   ├── interceptors/ # Interceptores
│   │   └── dto/          # Data Transfer Objects
│   ├── config/           # Configuración
│   │   ├── database.ts   # Configuración DB
│   │   ├── jwt.ts        # Configuración JWT
│   │   └── redis.ts      # Configuración Redis
│   ├── prisma/           # Esquemas y migraciones
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── main.ts          # Punto de entrada
│   └── app.module.ts    # Módulo principal
├── test/                # Tests e2e
├── docker/              # Configuración Docker
├── package.json
└── tsconfig.json
```

### Configuraciones importantes

#### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String   // Cifrado con bcrypt
  role        UserRole
  plan        UserPlan
  verified    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  clients     Client[]
  sessions    Session[]
  reports     Report[]
  
  // Datos cifrados
  encryptedData Json? // Datos sensibles cifrados
  
  @@map("users")
}

model Client {
  id            String   @id @default(cuid())
  // Datos básicos (cifrados)
  encryptedName String   // AES-256
  encryptedData Json     // Todos los datos sensibles
  
  // Metadatos no sensibles
  userId        String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  isActive      Boolean  @default(true)
  tags          String[] // Array de etiquetas
  
  // Relaciones
  user          User       @relation(fields: [userId], references: [id])
  sessions      Session[]
  reports       Report[]
  
  @@map("clients")
}

model Session {
  id              String      @id @default(cuid())
  clientId        String
  userId          String
  
  // Datos de sesión
  startTime       DateTime
  endTime         DateTime?
  duration        Int?        // En minutos
  transcription   String?     // Cifrado
  audioPath       String?     // Ruta archivo cifrado
  notes           String?     // Notas del psicólogo
  aiSuggestions   Json?       // Sugerencias de IA
  
  // Metadatos
  sessionType     SessionType
  status          SessionStatus
  createdAt       DateTime    @default(now())
  
  // Relaciones
  client          Client      @relation(fields: [clientId], references: [id])
  user            User        @relation(fields: [userId], references: [id])
  
  @@map("sessions")
}

enum UserRole {
  PSYCHOLOGIST
  STUDENT
  ADMIN
}

enum UserPlan {
  BASIC
  PRO
  PREMIUM
}

enum SessionType {
  INDIVIDUAL
  GROUP
  FAMILY
  COUPLE
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## 🗄️ BASE DE DATOS Y CACHE

### PostgreSQL
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: psychologist_app
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    # Configuraciones de seguridad
    command: >
      postgres
      -c ssl=on
      -c ssl_cert_file=/etc/ssl/certs/server.crt
      -c ssl_key_file=/etc/ssl/private/server.key
```

### Redis Cache
```yaml
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
```

### Estrategias de Cache
```typescript
// Configuración cache en NestJS
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Cache para consultas frecuentes
  async getUserData(userId: string) {
    const cacheKey = `user:${userId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) return cached;
    
    const userData = await this.fetchUserData(userId);
    await this.cacheManager.set(cacheKey, userData, 300); // 5 min TTL
    
    return userData;
  }
}
```

---

## 🔐 SEGURIDAD Y AUTENTICACIÓN

### JWT Strategy
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies?.access_token, // HttpOnly cookie
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      plan: payload.plan,
    };
  }
}
```

### Cifrado de datos sensibles
```typescript
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey, { iv });
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(
      this.algorithm,
      this.secretKey,
      { iv: Buffer.from(encryptedData.iv, 'hex') }
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

---

## 🌐 SERVICIOS EXTERNOS

### OpenAI Integration
```typescript
@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const response = await this.openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
      language: 'es', // Español
      response_format: 'text',
    });
    
    return response;
  }

  async generateSuggestions(context: string): Promise<string[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente para psicólogos. Proporciona sugerencias útiles pero NUNCA diagnósticos médicos.',
        },
        {
          role: 'user',
          content: context,
        },
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content.split('\n').filter(Boolean);
  }
}
```

### Stripe Payments
```typescript
@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createSubscription(customerId: string, priceId: string) {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.activateSubscription(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.deactivateSubscription(event.data.object);
        break;
    }
  }
}
```

---

## 🚀 DEPLOYMENT Y DEVOPS

### Docker Configuration
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Kubernetes Deployment
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: psychologist-app

---
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: psychologist-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: psychologist-app/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.psychologist-app.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📊 MONITORING Y PERFORMANCE

### Métricas importantes
```typescript
// Instrumentación con Prometheus
@Injectable()
export class MetricsService {
  private readonly httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  private readonly activeUsers = new prometheus.Gauge({
    name: 'active_users_total',
    help: 'Number of active users',
  });

  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestDuration.labels(method, route, status.toString()).observe(duration);
  }
}
```

### Health Checks
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  async check(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkOpenAI(),
    ]);

    return {
      status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN TÉCNICA

### Frontend
- [ ] Next.js 14+ configurado con App Router
- [ ] TypeScript estricto habilitado
- [ ] Tailwind CSS + shadcn/ui instalado
- [ ] Sistema de estado con Zustand + React Query
- [ ] Formularios con React Hook Form + Zod
- [ ] WebRTC configurado para audio
- [ ] PWA capabilities habilitadas

### Backend  
- [ ] NestJS 10+ con arquitectura modular
- [ ] PostgreSQL 15+ con Prisma ORM
- [ ] Redis para cache y sesiones
- [ ] JWT authentication con HttpOnly cookies
- [ ] Rate limiting y security headers
- [ ] OpenAI integration configurada
- [ ] Stripe payments integration

### DevOps
- [ ] Docker containers optimizados
- [ ] Kubernetes manifests preparados
- [ ] CI/CD pipeline con GitHub Actions
- [ ] Monitoring con Prometheus + Grafana
- [ ] Logging centralizado
- [ ] Backup automático configurado

### Seguridad
- [ ] Cifrado AES-256 para datos sensibles
- [ ] HTTPS obligatorio (TLS 1.3)
- [ ] Headers de seguridad configurados
- [ ] Validación de entrada en cliente y servidor
- [ ] Auditoría de accesos implementada
- [ ] Cumplimiento GDPR/HIPAA verificado

---

*Documento actualizado en Fase 0 - Diciembre 2025*
*Versión: 1.0*
*Estado: ✅ Completado*