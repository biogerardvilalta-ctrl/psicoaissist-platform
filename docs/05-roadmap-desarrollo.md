# ROADMAP DETALLADO DE DESARROLLO
*Documento creado en Fase 0 - Diciembre 2025*

## 🗺️ VISIÓN GENERAL DEL PROYECTO

### Objetivo principal
Crear una plataforma web integral que asista a psicólogos y estudiantes de psicología mediante herramientas de IA responsable, cumpliendo con normativas GDPR/HIPAA.

### Metodología de desarrollo
- **Desarrollo modular:** Cada fase entrega funcionalidad completa y utilizable
- **Arquitectura escalable:** Preparada para crecimiento y nuevas funcionalidades
- **Compliance desde el inicio:** Seguridad y legalidad en cada etapa
- **Feedback continuo:** Iteraciones basadas en usuarios reales

---

## 📅 CRONOGRAMA COMPLETO (36-40 semanas)

```
FASE 0  ███████████████████████████████████████████████████████ COMPLETADA
FASE 1  ███████████████████████████████████████████████████████ COMPLETADA
FASE 2  ███████████████████████████████████████████████████████ 100% (Landing ✅, Payments 🚧)
FASE 3  ███████████████████████████████████████████████████████ 100% (Dashboard ✅, CRUD ✅)
FASE 4  ███████████████████████████████████████████████████████ 100% (Calendar ✅, Sessions ✅)
FASE 5  ████████████████████████████████████████████████░░░░░░░ 90% (Live AI ✅, Reports ✅)
FASE 6  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% (Simulator, Advanced Payments)
FASE 7  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0% (Polishing, Launch)

2025 │ Dic │ Dic │ Ene │ Feb │ Mar │ Abr │ May │ Jun │ Jul │ Ago │
2026 │  F0 │ F1  │ F2  │ F3  │ F4  │ F5  │ F6  │ F7  │ F8  │ ... │
```

---

## 🎯 FASE 0 — DEFINICIÓN Y PLANIFICACIÓN ✅

**Duración:** 1-2 semanas (COMPLETADA)  
**Estado:** ✅ Finalizada

### Entregables completados
- ✅ **Especificaciones técnicas completas** (01-especificaciones-tecnicas.md)
- ✅ **Documentación del stack tecnológico** (02-stack-tecnologico.md)
- ✅ **Documentos legales base** (03-documentos-legales.md)
- ✅ **Wireframes y prototipos documentados** (04-wireframes-prototipos.md)
- ✅ **Roadmap detallado** (05-roadmap-desarrollo.md)

### Validación de Phase Gate 0
- ✅ Todos los módulos definidos con funcionalidades específicas
- ✅ Roles y permisos claramente establecidos  
- ✅ Stack tecnológico compatible con escalabilidad
- ✅ Aspectos legales cubiertos (GDPR/HIPAA)
- ✅ Base para prototipos en Figma definida

**Resultado:** Base conceptual y técnica completa ✅

---

## 🏗️ FASE 1 — INFRAESTRUCTURA INICIAL Y SEGURIDAD

**Duración:** 2-3 semanas (COMPLETADA)  
**Estado:** ✅ Finalizada (Enero 2026)

### 🎯 Objetivos principales
- Crear repositorios y configuración inicial
- Implementar autenticación segura con JWT
- Configurar base de datos con cifrado
- Establecer pipeline CI/CD básico
- Implementar logging y monitoring

### 📋 Epic 1.1: Setup de repositorios y estructura
**Duración:** 3-4 días

#### Tareas técnicas
```bash
# Repository setup
- Crear repositorio frontend (Next.js 14)
- Crear repositorio backend (NestJS 10)
- Configurar Git hooks y conventional commits
- Setup Husky + lint-staged
- Configurar GitHub Actions básico
```

#### Entregables
- [x] Frontend: Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [x] Backend: NestJS 10 + TypeScript + Prisma
- [x] Docker compose para desarrollo local
- [x] ESLint + Prettier configurado
- [x] README con instrucciones de setup

#### Validación
- [ ] `npm run dev` funciona en ambos proyectos
- [ ] Hot reload configurado
- [ ] Tests básicos pasan
- [ ] Linting y formatting automático

### 📋 Epic 1.2: Base de datos y ORM
**Duración:** 4-5 días

#### Esquema inicial
```sql
-- Usuarios y autenticación
Table users {
  id: UUID PRIMARY KEY
  email: VARCHAR(255) UNIQUE NOT NULL
  password_hash: VARCHAR(255) NOT NULL
  role: user_role_enum NOT NULL
  plan: user_plan_enum NOT NULL
  verified: BOOLEAN DEFAULT FALSE
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}

-- Datos cifrados de clientes
Table encrypted_client_data {
  id: UUID PRIMARY KEY
  user_id: UUID NOT NULL REFERENCES users(id)
  encrypted_name: BYTEA -- AES-256 encrypted
  encrypted_data: JSONB -- Encrypted personal/clinical data
  encryption_key_id: VARCHAR(50)
  tags: TEXT[]
  is_active: BOOLEAN DEFAULT TRUE
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}

-- Logs de auditoría
Table audit_logs {
  id: UUID PRIMARY KEY
  user_id: UUID REFERENCES users(id)
  action: VARCHAR(100) NOT NULL
  resource_type: VARCHAR(50)
  resource_id: UUID
  metadata: JSONB
  ip_address: INET
  user_agent: TEXT
  created_at: TIMESTAMP DEFAULT NOW()
}
```

#### Tareas técnicas
```bash
# Database setup
- Configurar PostgreSQL 15 con Docker
- Setup Prisma ORM con esquema inicial
- Implementar servicio de cifrado (AES-256)
- Configurar Redis para sesiones/cache
- Scripts de migración y seeding
```

#### Entregables
- [x] Schema Prisma con tipos base
- [x] Servicio de cifrado implementado
- [x] Migrations inicial funcional
- [x] Seeds con datos de prueba
- [x] Connection pooling configurado

#### Validación
- [ ] Migrations ejecutan sin error
- [ ] Cifrado/descifrado funciona correctamente
- [ ] Redis conecta y almacena sesiones
- [ ] Queries básicas funcionan

### 📋 Epic 1.3: Autenticación y autorización
**Duración:** 5-6 días

#### Sistema JWT implementado
```typescript
// JWT Strategy con HttpOnly cookies
@Injectable()
export class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(credentials);
    const tokens = await this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken // HttpOnly cookie
    };
  }

  async validateUser(credentials: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(credentials.email);
    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }
}
```

#### Guards y decoradores
```typescript
// Role-based access control
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    
    return requiredRoles.some(role => user.role === role);
  }
}

// Usage example
@Post('clients')
@UseGuards(JwtGuard, RoleGuard)
@Roles(UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO)
async createClient(@Body() createClientDto: CreateClientDto) {
  return this.clientsService.create(createClientDto);
}
```

#### Tareas técnicas
```bash
# Authentication setup
- Implementar JWT strategy con Passport
- Configurar cookies HttpOnly para refresh tokens
- Guards para roles y permisos
- Rate limiting con @nestjs/throttler
- Password hashing con bcrypt
```

#### Entregables
- [x] Login/registro endpoints funcionando
- [x] JWT tokens con refresh automático
- [x] Role-based access control (RBAC)
- [x] Rate limiting en auth endpoints
- [x] Password reset flow básico

#### Validación
- [ ] Login exitoso retorna tokens válidos
- [ ] Rutas protegidas requieren autenticación
- [ ] Roles restringen acceso correctamente
- [ ] Rate limiting previene ataques de fuerza bruta

### 📋 Epic 1.4: Seguridad y headers
**Duración:** 2-3 días

#### Configuración de seguridad
```typescript
// main.ts security setup
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));
  
  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(3000);
}
```

#### Tareas técnicas
```bash
# Security implementation
- Configurar Helmet para headers de seguridad
- CORS configurado para frontend específico
- HTTPS obligatorio en producción
- Input validation con class-validator
- SQL injection prevention con Prisma
```

#### Entregables
- [x] Headers de seguridad configurados
- [x] HTTPS redirect configurado
- [x] CORS restrictivo pero funcional
- [x] Input validation en todos endpoints
- [x] XSS protection activado

#### Validación
- [ ] Security headers presentes en responses
- [ ] CORS permite solo frontend autorizado
- [ ] Input malicioso rechazado con error 400
- [ ] SQL injection attempts bloqueados

### 📋 Epic 1.5: Frontend base y componentes
**Duración:** 4-5 días

#### Estructura de componentes
```typescript
// Layout principal
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="flex">
        <Sidebar userPlan={user.plan} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Sidebar dinámico según plan
export function Sidebar({ userPlan }: { userPlan: UserPlan }) {
  const menuItems = getMenuItemsByPlan(userPlan);
  
  return (
    <aside className="w-64 bg-white shadow-sm">
      <nav className="mt-8">
        {menuItems.map(item => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
```

#### Sistema de estado
```typescript
// Zustand store para auth
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (credentials) => {
    const response = await authAPI.login(credentials);
    set({ user: response.user, isAuthenticated: true });
  },
  
  logout: () => {
    authAPI.logout();
    set({ user: null, isAuthenticated: false });
  },
}));

// React Query para datos del servidor
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsAPI.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

#### Tareas técnicas
```bash
# Frontend setup
- Configurar Next.js 14 App Router
- Instalar y configurar shadcn/ui
- Setup Zustand para estado global
- Configurar React Query para server state
- Implementar sistema de routing
```

#### Entregables
- [x] Layout base con header y sidebar
- [x] Sistema de componentes shadcn/ui
- [x] Estado global para autenticación
- [x] Client HTTP con interceptors
- [x] Routing protegido implementado

#### Validación
- [ ] Layout responsive funciona en mobile/desktop
- [ ] Componentes shadcn/ui renderizan correctamente
- [ ] Estado persiste entre recargas de página
- [ ] Rutas protegidas redirigen a login

### 🚀 Criterios de éxito Fase 1
- ✅ **Funcional:** Login/registro completo y seguro
- ✅ **Técnico:** Base de datos cifrada y auditada
- ✅ **Legal:** Logs de auditoría para compliance
- ✅ **Seguridad:** Headers y autenticación robustos
- ✅ **DevOps:** CI/CD básico funcionando
- ✅ **Monitoring:** Health checks y métricas
- ✅ **Testing:** Tests E2E para funcionalidades críticas

### ✅ Resumen de implementación completada
**Infraestructura y Seguridad - Diciembre 2025**

#### 🔐 Sistema de Autenticación
- JWT con HttpOnly cookies implementado
- Guards de roles (PSYCHOLOGIST_BASIC, PSYCHOLOGIST_PRO, ADMIN, STUDENT)
- Rate limiting: 100 req/min global, 5 auth/15min
- Password hashing con bcrypt + salt
- Refresh tokens con rotación automática

#### 🗄️ Base de Datos y Cifrado
- PostgreSQL 15 con esquemas optimizados
- Cifrado AES-256-GCM para datos sensibles
- Prisma ORM con migraciones versionadas
- 11 modelos completos (User, Client, Session, Report, etc.)
- Audit log completo con tracking de IP

#### 🛡️ Seguridad Implementada
- Helmet con CSP, HSTS, XSS protection
- CORS configurado por ambiente
- Validación estricta con class-validator
- SQL injection prevention
- Input sanitization automático

#### 📊 Monitoring y Observabilidad
- Health checks automáticos (/api/v1/health)
- Métricas de sistema (/api/v1/health/metrics)
- Logging estructurado con interceptores
- Auditoría de requests HTTP
- Monitoreo de memoria y performance

#### 🔄 DevOps y Testing
- GitHub Actions CI/CD pipeline
- Tests E2E para autenticación y health
- Docker development environment
- Linting y type checking automático
- Security audit en pipeline

**Entregable:** Sistema básico con autenticación segura ✅

---

## 🎨 FASE 2 — LANDING PAGE Y SISTEMA DE PAGOS

**Duración:** 3-4 semanas  
**Estado:** 🚧 En Progreso (Landing 100%, Pagos 50%)  

### 🎯 Objetivos principales
- Landing page optimizada para SEO y conversión
- Integración completa con Stripe (suscripciones)
- Sistema de roles y planes funcionando
- Portal de usuario para gestión de suscripción

### 📋 Epic 2.1: Landing page y SEO
**Duración:** 5-6 días

#### Estructura de la landing
```typescript
// pages/page.tsx (Landing)
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}

// Optimización SEO
export const metadata: Metadata = {
  title: 'PsycoAI - Asistente IA para Psicólogos | Transcripción y Análisis',
  description: 'Potencia tu práctica psicológica con IA responsable. Transcripción automática, sugerencias éticas y gestión de clientes. GDPR compliant.',
  keywords: 'psicólogo, IA, transcripción, sesiones, GDPR, asistente psicológico',
  openGraph: {
    title: 'PsycoAI - Revoluciona tu consulta psicológica',
    description: 'Herramientas de IA ética para psicólogos modernos',
    images: ['/og-image.jpg'],
  },
};
```

#### Componente de pricing
```typescript
// components/PricingSection.tsx
const plans = [
  {
    name: 'Basic',
    price: 29,
    description: 'Para psicólogos que comienzan',
    features: [
      'Hasta 25 clientes',
      'Informes básicos',
      'Soporte por email',
      '⚠️ IA limitada'
    ],
    limitations: ['Sin sesiones en vivo', 'Sin simulador'],
    cta: 'Comenzar Basic',
    popular: false,
  },
  {
    name: 'Pro',
    price: 59,
    description: 'Para práctica profesional',
    features: [
      'Clientes ilimitados',
      'IA asistente completa',
      'Sesiones en vivo',
      'Analytics avanzados',
      'Soporte prioritario'
    ],
    cta: 'Elegir Pro',
    popular: true,
  },
  {
    name: 'Premium',
    price: 99,
    description: 'Para clínicas y formación',
    features: [
      'Todo lo de Pro',
      'Simulador completo',
      'API access',
      'Backup automático',
      'Soporte 24/7'
    ],
    cta: 'Elegir Premium',
    popular: false,
  },
];
```

#### Tareas técnicas
```bash
# Landing page development
- Hero section con video demo
- Sección de características (3 columnas)
- Comparativa de planes interactiva
- Testimonios con fotos y verificación
- FAQ con accordion
- Footer con links legales
```

#### Entregables
- [x] Landing page completa y responsive
- [x] SEO optimizado (metadata, structured data)
- [x] Performance score >90 (Lighthouse)
- [x] A/B testing setup para CTAs
- [x] Analytics configurado (Google Analytics 4)

#### Validación
- [ ] Core Web Vitals en verde
- [ ] Conversion rate tracking funciona
- [ ] Mobile experience optimizada
- [ ] Accesibilidad AA compliance

### 📋 Epic 2.2: Integración Stripe completa
**Duración:** 6-7 días

#### Setup de productos en Stripe
```javascript
// scripts/setup-stripe-products.js
const products = [
  {
    name: 'PsycoAI Basic',
    description: 'Plan básico para psicólogos',
    prices: [
      { currency: 'eur', unit_amount: 2900, recurring: { interval: 'month' } },
      { currency: 'eur', unit_amount: 29000, recurring: { interval: 'year' } }
    ]
  },
  {
    name: 'PsycoAI Pro',
    description: 'Plan profesional con IA completa',
    prices: [
      { currency: 'eur', unit_amount: 5900, recurring: { interval: 'month' } },
      { currency: 'eur', unit_amount: 59000, recurring: { interval: 'year' } }
    ]
  },
  {
    name: 'PsycoAI Premium',
    description: 'Plan premium con todas las funciones',
    prices: [
      { currency: 'eur', unit_amount: 9900, recurring: { interval: 'month' } },
      { currency: 'eur', unit_amount: 99000, recurring: { interval: 'year' } }
    ]
  }
];
```

#### Servicio de pagos backend
```typescript
@Injectable()
export class PaymentService {
  constructor(private readonly stripe: Stripe) {}

  async createCheckoutSession(userId: string, priceId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    
    const session = await this.stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { userId },
    });
    
    return session.url;
  }

  async handleWebhook(signature: string, body: Buffer): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.activateSubscription(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
    }
  }

  private async activateSubscription(session: Stripe.Checkout.Session) {
    const userId = session.metadata.userId;
    const subscriptionId = session.subscription as string;
    
    await this.usersService.updateSubscription(userId, {
      stripeSubscriptionId: subscriptionId,
      plan: this.getPlanFromPriceId(session.line_items.data[0].price.id),
      status: 'active',
    });
  }
}
```

#### Componente de checkout frontend
```typescript
// components/CheckoutButton.tsx
export function CheckoutButton({ priceId, planName }: CheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error('Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className="w-full">
      {isLoading ? 'Procesando...' : `Suscribirse a ${planName}`}
    </Button>
  );
}
```

#### Tareas técnicas
```bash
# Stripe integration
- Configurar productos y precios en Stripe
- Implementar Checkout Sessions
- Webhook endpoints para eventos críticos
- Customer portal para gestión de suscripciones
- Manejo de failed payments y dunning
```

#### Entregables
- [x] Checkout flow completo funcionando
- [ ] Webhooks procesando eventos correctamente
- [ ] Customer portal integrado
- [ ] Manejo de errores de pago
- [ ] Facturación automática configurada

#### Validación
- [ ] Pagos test completan exitosamente
- [ ] Plan se activa inmediatamente post-pago
- [ ] Webhooks procesan todos los eventos críticos
- [ ] Usuarios pueden cancelar/reactivar suscripciones

### 📋 Epic 2.3: Sistema de roles y permisos
**Duración:** 4-5 días

#### Middleware de autorización
```typescript
// guards/plan.guard.ts
@Injectable()
export class PlanGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<UserPlan>('plan', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    
    const planHierarchy = {
      [UserPlan.BASIC]: 1,
      [UserPlan.PRO]: 2,
      [UserPlan.PREMIUM]: 3,
    };
    
    return planHierarchy[user.plan] >= planHierarchy[requiredPlan];
  }
}

// Decorator de uso
export const RequiredPlan = (plan: UserPlan) => SetMetadata('plan', plan);

// Usage
@Get('ai-suggestions')
@UseGuards(JwtGuard, PlanGuard)
@RequiredPlan(UserPlan.PRO)
async getAISuggestions() {
  return this.aiService.getSuggestions();
}
```

#### Hook de permisos frontend
```typescript
// hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth();
  
  const canAccessFeature = (feature: Feature): boolean => {
    const permissions = getPermissionsByPlan(user.plan);
    return permissions.includes(feature);
  };
  
  const shouldShowUpgrade = (feature: Feature): boolean => {
    return !canAccessFeature(feature) && user.plan !== UserPlan.PREMIUM;
  };
  
  return { canAccessFeature, shouldShowUpgrade };
}

// Usage en componentes
export function AIAssistantPanel() {
  const { canAccessFeature, shouldShowUpgrade } = usePermissions();
  
  if (!canAccessFeature(Feature.AI_ASSISTANT)) {
    return <UpgradePrompt feature="IA Asistente" requiredPlan="Pro" />;
  }
  
  return <AIAssistantComponent />;
}
```

#### Tareas técnicas
```bash
# Permission system
- Guards para verificación de plan backend
- Middleware de feature flags
- Hook de permisos en frontend
- Componentes de upgrade prompt
- Métricas de feature usage
```

#### Entregables
- [ ] Sistema de permisos backend funcionando
- [ ] Frontend adapta UI según plan del usuario
- [ ] Upgrade prompts en features restringidas
- [ ] Analytics de usage por feature
- [ ] Tests unitarios para logic de permisos

#### Validación
- [ ] Usuarios Basic no acceden a features Pro
- [ ] Upgrade prompts muestran plan correcto
- [ ] Downgrade de plan restringe acceso inmediato
- [ ] Analytics capturan intentos de uso restringido

### 🚀 Criterios de éxito Fase 2
- [ ] **Conversión:** Landing page convierte >2% visitors
- [ ] **Pagos:** Stripe procesa suscripciones sin errores
- [ ] **Usuarios:** Onboarding completo en <5 minutos
- [ ] **Técnico:** Zero downtime deployments
- [ ] **Legal:** T&C y Privacy Policy actualizados

**Entregable:** Landing + registro + pagos funcionando ✅

---

## 👥 FASE 3 — DASHBOARD Y GESTIÓN DE CLIENTES

**Duración:** 4-6 semanas  
**Estado:** 🚧 En Progreso (Dashboard/CRUD 100%, Real AI 20%)

### 🎯 Objetivos principales
- Dashboard funcional con métricas en tiempo real
- CRUD completo de clientes con cifrado
- Sistema de filtros y búsqueda avanzada
- Audit trail completo para compliance

### 📋 Epic 3.1: Dashboard principal
**Duración:** 6-7 días

#### Métricas y KPIs
```typescript
// services/dashboard.service.ts
@Injectable()
export class DashboardService {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const [clientsCount, sessionsThisMonth, reportsCount, upcomingAppointments] = 
      await Promise.all([
        this.getClientsCount(userId),
        this.getSessionsThisMonth(userId),
        this.getReportsCount(userId),
        this.getUpcomingAppointments(userId),
      ]);

    return {
      clientsCount,
      sessionsThisMonth,
      reportsCount,
      upcomingAppointments,
      aiSuggestions: await this.getAISuggestions(userId),
      recentActivity: await this.getRecentActivity(userId),
    };
  }

  private async getAISuggestions(userId: string): Promise<AISuggestion[]> {
    const user = await this.usersService.findById(userId);
    
    if (!this.permissionsService.canAccessFeature(user.plan, Feature.AI_SUGGESTIONS)) {
      return [];
    }
    
    // Generate AI suggestions based on recent activity
    return this.aiService.generateDashboardSuggestions(userId);
  }
}
```

#### Componentes de métricas
```typescript
// components/dashboard/StatsCards.tsx
export function StatsCards({ data }: { data: DashboardData }) {
  const stats = [
    {
      label: 'Clientes activos',
      value: data.clientsCount,
      icon: Users,
      trend: data.clientsTrend,
      color: 'text-blue-600',
    },
    {
      label: 'Sesiones este mes',
      value: data.sessionsThisMonth,
      icon: Calendar,
      trend: data.sessionsTrend,
      color: 'text-green-600',
    },
    {
      label: 'Informes generados',
      value: data.reportsCount,
      icon: FileText,
      trend: data.reportsTrend,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
```

#### Actividad reciente
```typescript
// components/dashboard/RecentActivity.tsx
export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Actividad reciente</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ActivityIcon type={activity.type} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Tareas técnicas
```bash
# Dashboard development
- Componentes de métricas con datos reales
- Charts interactivos con Recharts
- Actividad en tiempo real (WebSockets)
- Dashboard responsive mobile/desktop
- Loading states y error boundaries
```

#### Entregables
- [x] Dashboard con métricas principales
- [x] Gráficos interactivos de progreso
- [x] Feed de actividad reciente
- [ ] Sugerencias de IA diarias (Plan Pro+)
- [x] Widget de próximas citas

#### Validación
- [ ] Métricas se actualizan en tiempo real
- [ ] Dashboard carga en <2 segundos
- [ ] Responsive en todos los dispositivos
- [ ] WebSockets funcionan sin memory leaks

### 📋 Epic 3.2: Modelo de datos para clientes
**Duración:** 5-6 días

#### Schema cifrado
```prisma
// prisma/schema.prisma
model Client {
  id            String   @id @default(cuid())
  userId        String   // Relación con psicólogo
  
  // Datos cifrados
  encryptedPersonalData  Bytes   // Nombre, contacto, etc.
  encryptedClinicalData  Bytes   // Historia clínica, notas
  encryptedSensitiveData Bytes?  // Datos extra sensibles
  
  // Metadatos no sensibles
  tags          String[] // Etiquetas para filtros
  isActive      Boolean  @default(true)
  riskLevel     RiskLevel @default(LOW)
  
  // Fechas importantes
  firstSession  DateTime?
  lastSession   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Audit trail
  lastModifiedBy String
  version       Int      @default(1)
  
  // Relaciones
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions      Session[]
  reports       Report[]
  consents      Consent[]
  
  @@map("clients")
  @@index([userId, isActive])
  @@index([tags])
}

model Consent {
  id            String      @id @default(cuid())
  clientId      String
  consentType   ConsentType
  granted       Boolean
  grantedAt     DateTime
  revokedAt     DateTime?
  version       String      @default("1.0")
  
  client        Client      @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  @@map("consents")
}

enum ConsentType {
  AUDIO_RECORDING
  AI_PROCESSING
  DATA_STORAGE
  THIRD_PARTY_SHARING
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

#### Servicio de cifrado avanzado
```typescript
// services/encryption.service.ts
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  
  async encryptClientData(data: ClientPersonalData): Promise<EncryptedData> {
    const key = this.getOrCreateKey(data.userId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key, { iv });
    
    const serializedData = JSON.stringify(data);
    let encrypted = cipher.update(serializedData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
      keyId: key.id,
    };
  }

  async decryptClientData(encryptedData: EncryptedData): Promise<ClientPersonalData> {
    const key = await this.getKey(encryptedData.keyId);
    const decipher = crypto.createDecipher(
      this.algorithm,
      key.value,
      { iv: Buffer.from(encryptedData.iv, 'hex') }
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  private async getOrCreateKey(userId: string): Promise<EncryptionKey> {
    let key = await this.encryptionKeysRepository.findByUserId(userId);
    
    if (!key) {
      key = await this.encryptionKeysRepository.create({
        userId,
        value: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(),
      });
    }
    
    return key;
  }
}
```

#### Tareas técnicas
```bash
# Data modeling
- Schema Prisma con cifrado completo
- Servicios de cifrado/descifrado
- Validación de datos sensibles
- Soft delete para audit trail
- Migración de datos existentes
```

#### Entregables
- [ ] Schema de base de datos finalizado
- [ ] Servicio de cifrado robusto
- [ ] Validaciones exhaustivas de input
- [ ] Sistema de versioning de datos
- [ ] Backup strategy para datos cifrados

#### Validación
- [ ] Cifrado/descifrado sin pérdida de datos
- [ ] Performance aceptable con datos cifrados
- [ ] Migrations no rompen datos existentes
- [ ] Audit logs capturan todos los cambios

### 📋 Epic 3.3: CRUD de clientes
**Duración:** 7-8 días

#### Controlador con validación
```typescript
// controllers/clients.controller.ts
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser() user: User,
  ): Promise<ClientResponse> {
    // Verificar límites del plan
    await this.verifyPlanLimits(user);
    
    const client = await this.clientsService.create(createClientDto, user.id);
    return this.clientsService.toResponse(client);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ClientResponse> {
    const client = await this.clientsService.findOne(id, user.id);
    
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    
    return this.clientsService.toResponse(client);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() user: User,
  ): Promise<ClientResponse> {
    const client = await this.clientsService.update(id, updateClientDto, user.id);
    return this.clientsService.toResponse(client);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.clientsService.softDelete(id, user.id);
    return { message: 'Cliente eliminado correctamente' };
  }

  private async verifyPlanLimits(user: User): Promise<void> {
    if (user.plan === UserPlan.BASIC) {
      const clientCount = await this.clientsService.countByUser(user.id);
      if (clientCount >= 25) {
        throw new ForbiddenException('Límite de clientes alcanzado para el plan Basic');
      }
    }
  }
}
```

#### DTOs con validación exhaustiva
```typescript
// dto/create-client.dto.ts
export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('ES')
  phone?: string;

  @IsOptional()
  @IsDateString()
  @IsNotAfter(new Date()) // No fechas futuras
  birthDate?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  initialNotes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  // Datos específicos de consentimiento
  @ValidateNested()
  @Type(() => ConsentDto)
  consents: ConsentDto[];
}

export class ConsentDto {
  @IsEnum(ConsentType)
  type: ConsentType;

  @IsBoolean()
  granted: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

#### Servicio con lógica de negocio
```typescript
// services/clients.service.ts
@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly auditService: AuditService,
  ) {}

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    // Cifrar datos sensibles
    const encryptedPersonalData = await this.encryptionService.encryptClientData({
      firstName: createClientDto.firstName,
      lastName: createClientDto.lastName,
      email: createClientDto.email,
      phone: createClientDto.phone,
      birthDate: createClientDto.birthDate,
    });

    const encryptedClinicalData = await this.encryptionService.encryptClientData({
      initialNotes: createClientDto.initialNotes,
    });

    // Crear cliente
    const client = await this.prisma.client.create({
      data: {
        userId,
        encryptedPersonalData: encryptedPersonalData.encryptedData,
        encryptedClinicalData: encryptedClinicalData.encryptedData,
        tags: createClientDto.tags || [],
        riskLevel: createClientDto.riskLevel || RiskLevel.LOW,
        lastModifiedBy: userId,
        consents: {
          create: createClientDto.consents.map(consent => ({
            consentType: consent.type,
            granted: consent.granted,
            grantedAt: new Date(),
            version: '1.0',
          })),
        },
      },
      include: {
        consents: true,
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: 'CLIENT_CREATED',
      resourceType: 'CLIENT',
      resourceId: client.id,
      metadata: { tags: client.tags, riskLevel: client.riskLevel },
    });

    return client;
  }

  async findAllByUser(
    userId: string,
    filters?: ClientFilters,
    pagination?: Pagination,
  ): Promise<{ clients: ClientResponse[]; total: number }> {
    const where: Prisma.ClientWhereInput = {
      userId,
      isActive: true,
      ...(filters?.tags && { tags: { hasSome: filters.tags } }),
      ...(filters?.riskLevel && { riskLevel: filters.riskLevel }),
      ...(filters?.dateFrom && {
        createdAt: { gte: new Date(filters.dateFrom) },
      }),
      ...(filters?.dateTo && {
        createdAt: { lte: new Date(filters.dateTo) },
      }),
    };

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: { consents: true },
        skip: pagination?.skip || 0,
        take: pagination?.take || 20,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    const decryptedClients = await Promise.all(
      clients.map(client => this.toResponse(client))
    );

    return { clients: decryptedClients, total };
  }

  async toResponse(client: Client): Promise<ClientResponse> {
    const [personalData, clinicalData] = await Promise.all([
      this.encryptionService.decryptClientData(client.encryptedPersonalData),
      this.encryptionService.decryptClientData(client.encryptedClinicalData),
    ]);

    return {
      id: client.id,
      ...personalData,
      ...clinicalData,
      tags: client.tags,
      riskLevel: client.riskLevel,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      consents: client.consents?.map(consent => ({
        type: consent.consentType,
        granted: consent.granted,
        grantedAt: consent.grantedAt,
        version: consent.version,
      })),
    };
  }
}
```

#### Tareas técnicas
```bash
# CRUD implementation
- Endpoints REST completos
- Validación robusta con class-validator
- Cifrado automático de datos sensibles
- Soft delete con audit trail
- Tests unitarios y e2e
```

#### Entregables
- [x] API REST completa para clientes
- [x] Validación exhaustiva de datos
- [x] Cifrado transparente funcionando
- [x] Audit trail para todos los cambios
- [x] Tests con cobertura >90%

#### Validación
- [ ] Endpoints responden según especificación OpenAPI
- [ ] Validación rechaza datos inválidos
- [ ] Datos se cifran/descifran correctamente
- [ ] Soft delete preserva integridad referencial

### 📋 Epic 3.4: Frontend de gestión de clientes
**Duración:** 8-9 días

#### Lista de clientes con filtros
```typescript
// components/clients/ClientsList.tsx
export function ClientsList() {
  const [filters, setFilters] = useState<ClientFilters>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', filters, pagination],
    queryFn: () => clientsAPI.getAll(filters, pagination),
  });

  const { mutate: deleteClient } = useMutation({
    mutationFn: clientsAPI.delete,
    onSuccess: () => {
      toast.success('Cliente eliminado correctamente');
      queryClient.invalidateQueries(['clients']);
    },
  });

  const handleDelete = (clientId: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      deleteClient(clientId);
    }
  };

  if (isLoading) return <ClientsListSkeleton />;
  if (error) return <ErrorState retry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      <ClientsFilters filters={filters} onChange={setFilters} />
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ClientsTable
          clients={data?.clients || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
        
        <Pagination
          current={pagination.page}
          total={data?.total || 0}
          pageSize={pagination.limit}
          onChange={(page) => setPagination(prev => ({ ...prev, page }))}
        />
      </div>
    </div>
  );
}
```

#### Formulario de cliente
```typescript
// components/clients/ClientForm.tsx
const clientFormSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  lastName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  initialNotes: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
  consents: z.array(z.object({
    type: z.enum(['AUDIO_RECORDING', 'AI_PROCESSING', 'DATA_STORAGE']),
    granted: z.boolean(),
    notes: z.string().optional(),
  })),
});

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: client || {
      riskLevel: 'LOW',
      tags: [],
      consents: [
        { type: 'AUDIO_RECORDING', granted: false },
        { type: 'AI_PROCESSING', granted: false },
        { type: 'DATA_STORAGE', granted: true },
      ],
    },
  });

  const { mutate: saveClient, isLoading } = useMutation({
    mutationFn: client ? clientsAPI.update : clientsAPI.create,
    onSuccess: () => {
      toast.success(client ? 'Cliente actualizado' : 'Cliente creado');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Error al guardar cliente');
    },
  });

  const onSubmit = (data: ClientFormData) => {
    saveClient(client ? { id: client.id, ...data } : data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos *</FormLabel>
                <FormControl>
                  <Input placeholder="Apellidos del cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sección de consentimientos */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Consentimientos</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            {form.watch('consents').map((consent, index) => (
              <FormField
                key={consent.type}
                control={form.control}
                name={`consents.${index}.granted`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        {getConsentLabel(consent.type)}
                      </FormLabel>
                      <FormDescription className="text-xs">
                        {getConsentDescription(consent.type)}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : client ? 'Actualizar' : 'Crear cliente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

#### Tareas técnicas
```bash
# Frontend development
- Lista responsive con tabla/cards
- Formulario con validación tiempo real
- Filtros avanzados y búsqueda
- Modal de confirmación para eliminar
- Estados de loading y error
```

#### Entregables
- [ ] Lista de clientes responsive
- [ ] Formulario de creación/edición
- [ ] Sistema de filtros completo
- [ ] Búsqueda en tiempo real
- [ ] Gestión de estados UI

#### Validación
- [ ] UI funciona en móvil y desktop
- [ ] Formularios validan en tiempo real
- [ ] Filtros persisten entre navegaciones
- [ ] Loading states no bloquean UI

### 🚀 Criterios de éxito Fase 3
- [ ] **Funcional:** CRUD completo de clientes funcionando
- [ ] **Seguridad:** Todos los datos sensibles cifrados
- [ ] **Performance:** Dashboard carga en <2 segundos
- [ ] **Legal:** Audit trail completo para compliance
- [ ] **UX:** Mobile experience optimizada

**Entregable:** Dashboard + gestión clientes completa ✅

---

## 📅 FASE 4 — GESTIÓN DE SESIONES Y CALENDARIO

**Duración:** 3-4 semanas  
**Estado:** 🚧 90% Completado (Código implementado, falta video integración)

### 🎯 Objetivos principales
- Agenda interactiva (diaria, semanal, mensual)
- Gestión del ciclo de vida de la sesión (Programar -> Realizar -> Completar)
- Integración con historia clínica y notas
- (Futuro) Videollamada integrada

### 📋 Epic 4.1: Calendario y Agenda
**Estado:** ✅ Implementado (`CalendarView`, `react-big-calendar`)

#### Funcionalidades entregadas:
- Vistas de calendario completas
- Filtrado por estado y tipo de sesión
- Creación rápida desde slots de tiempo
- Drag & drop (parcial)
- Indicadores visuales de estado

### 📋 Epic 4.2: Detalles de Sesión y Ejecución
**Estado:** ✅ Implementado (`SessionDetailPage`)

#### Funcionalidades entregadas:
- Flujo de estados (Programada -> En Curso -> Completada)
- Grabación de audio y transcripción en tiempo real
- Asistente IA en vivo (`AiAssistantPanel`)
- Notas clínicas manuales + Metodología
- Generación de informe post-sesión

### 🚀 Criterios de éxito Fase 4
- [x] **Funcional:** Psicólogo puede agendar y gestionar sesiones
- [x] **UX:** Calendario intuitivo y rápido
- [x] **AI:** Transcripción y análisis conectados a la sesión
- [x] **Video:** Integración con plataforma de video (Movido a Fase 7)

---

## 🧠 FASE 5 — INTELIGENCIA ARTIFICIAL AVANZADA Y REPORTES

**Duración:** 4 semanas
**Estado:** 🚧 90% Completado (Transcripción ✅, Panel AI ✅, Reportes ✅)

### 🎯 Objetivos principales
- Transcripción en tiempo real de alta calidad
- Panel de asistente clínico en vivo (Sugestiones, Riesgos)
- Generación de informes PDF profesionales con IA
- Integración profunda de notas clínicas con insights de IA

### 📋 Epic 5.1: Transcripción y Análisis en Vivo
**Estado:** ✅ Implementado (`AudioRecorder`, `TranscriptionService`)
- Grabación por chunks con headers válidos (WebM)
- Transcripción continua con Gemini Flash 2.0
- Feed de observaciones en tiempo real

### 📋 Epic 5.2: Asistente Clínico (Panel Lateral)
**Estado:** ✅ Implementado (`AiAssistantPanel`)
- Sugerencias de preguntas sistémicas
- Detección de indicadores de riesgo
- Consideraciones éticas en vivo
- Limpieza automática de contexto antiguo

### 📋 Epic 5.3: Generación de Informes
**Estado:** ✅ Implementado (`ReportsService`, `PdfService`)
- Templates para informes clínicos y legales
- Generación PDF con diseño profesional
- Cifrado de informes generados
- Validación humana obligatoria para informes forenses

---

## 🎮 FASE 6 — SIMULADOR CLÍNICO Y MONETIZACIÓN

**Duración:** 4-6 semanas
**Estado:** 🌑 0% Iniciado

### 🎯 Objetivos principales
- Simulador de pacientes con IA (Roleplay) para entrenamiento
- Finalización del sistema de pagos (Webhooks, Portal Clientes)
- Gamificación del aprendizaje

### 📋 Epic 6.1: Simulador de Pacientes (Roleplay)
- Chat/Voz interactivo con "Pacientes IA" (Personas configurables)
- Escenarios clínicos predefinidos (Depresión, Ansiedad, TLP)
- Evaluación de desempeño del psicólogo post-simulación

### 📋 Epic 6.2: Finalización de Pagos
- Integración completa de Webhooks de Stripe
- Portal de auto-servicio para facturas y suscripciones
- Sistema de créditos para uso intensivo de IA

---

## 📊 PROGRESO Y ESTIMACIONES

### Resumen por fases
```
FASE 0: ████████████████████████████████████████████████████████ 100% ✅
FASE 1: ████████████████████████████████████████████████████████ 100% ✅
FASE 2: ████████████████████████████████████████░░░░░░░░░░░░░░░  75% 🚧
FASE 3: ████████████████████████████████████░░░░░░░░░░░░░░░░░░░  70% 🚧
FASE 4: █████████████████████████████████████████████████████░░░░ 90% (Calendar ✅, Sessions ✅, Video 🟡)
FASE 5: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
FASE 6: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
FASE 7: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
FASE 8: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%

Total estimado: 32-42 semanas
Progreso actual: 2 semanas ✅
```

### Próximos hitos importantes
1. **MVP básico** (Fin Fase 3): Dashboard + clientes + pagos
2. **Beta con IA** (Fin Fase 5): Incluye transcripción y sugerencias
3. **Producto completo** (Fin Fase 7): Todas las funcionalidades
4. **Lanzamiento comercial** (Fase 8): Marketing y escalamiento

---

## 💼 RECURSOS Y EQUIPO SUGERIDO

### Equipo mínimo recomendado
```
👨‍💻 DESARROLLO
• 1 Full-stack developer (Next.js + NestJS)
• 1 Frontend developer especializado (React + UX)
• 1 Backend developer (Node.js + PostgreSQL)

🎨 DISEÑO Y UX
• 1 UI/UX Designer (Figma, prototipos)
• 1 Content specialist (copywriting médico)

⚖️ LEGAL Y COMPLIANCE
• 1 Data Protection Officer (part-time)
• 1 Legal advisor especializado en salud

📊 PRODUCTO Y NEGOCIO
• 1 Product Manager
• 1 QA Engineer
```

### Presupuesto estimado (mensual)
```
💰 PERSONAL (€/mes)
• Desarrollo: €12,000-15,000
• Diseño: €4,000-6,000
• Legal: €2,000-3,000
• Producto: €3,000-4,000

🛠️ HERRAMIENTAS (€/mes)
• Hosting (Vercel + Railway): €200-500
• Base de datos (PostgreSQL): €100-300
• OpenAI API: €500-2,000
• Stripe fees (2.9%): Variable
• Monitoring tools: €100-200

Total mensual: €22,000-31,000
```

---

## 🔄 METODOLOGÍA DE DESARROLLO

### Sprint Planning (2 semanas)
- **Planning:** Lunes semana 1 (4 horas)
- **Daily standups:** Martes a viernes (15 min)
- **Review:** Viernes semana 2 (2 horas)
- **Retrospective:** Viernes semana 2 (1 hora)

### Definition of Done
- [ ] Código revisado por al menos 2 personas
- [ ] Tests unitarios con cobertura >80%
- [ ] Tests e2e para flujos críticos
- [ ] Documentación actualizada
- [ ] Validación de seguridad completada
- [ ] Deploy en staging exitoso
- [ ] Validación por Product Owner

### Branches y releases
```
main ────────────────────────── Production
 ↑
develop ──────────────────────── Staging
 ↑
feature/user-auth ─────────────── Development
feature/client-crud ───────────── Development
```

---

## ✅ CHECKLIST DE READINESS

### Para iniciar Fase 1
- [ ] Equipo de desarrollo confirmado
- [ ] Presupuesto aprobado para 6 meses
- [ ] Accesos a herramientas (GitHub, OpenAI, Stripe)
- [ ] Documentación de Fase 0 validada
- [ ] Legal advisor identificado

### Para iniciar Fase 2
- [ ] Autenticación funcionando en staging
- [ ] Base de datos con cifrado validada
- [ ] Tests de seguridad pasando
- [ ] Performance benchmarks establecidos

### Para cada Phase Gate
- [ ] Demos funcionales completados
- [ ] Security review aprobado
- [ ] Performance targets alcanzados
- [ ] Legal compliance verificado
- [ ] User acceptance testing realizado

---

*Documento actualizado en Fase 0 - Diciembre 2025*  
*Versión: 1.0*  
*Estado: ✅ Completado*

**Próximo paso:** Iniciar Fase 1 - Infraestructura inicial y seguridad