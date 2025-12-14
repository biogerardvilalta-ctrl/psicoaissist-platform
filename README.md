# Psychologist Assistant App 🧠

Una aplicación web completa para psicólogos con asistencia de IA, diseñada para mejorar la productividad y calidad de la atención psicológica.

## 📋 Estado del Proyecto

**FASE 1 - COMPLETADA ✅**
- ✅ Frontend (Next.js 14 + TypeScript + Tailwind)
- ✅ Backend (NestJS 10 + TypeScript + Prisma)
- ✅ Base de datos (PostgreSQL + esquemas cifrados)
- ✅ Autenticación (JWT + HttpOnly cookies + roles)
- ✅ Seguridad (CORS + Helmet + validación + rate limiting)
- ✅ Logging y Monitoring (interceptores + métricas + health checks)
- ✅ DevOps (Docker setup + CI/CD pipeline)
- ✅ Tests básicos (autenticación + health checks)

## 🚀 Características Implementadas

### 🔐 Seguridad y Autenticación
- JWT con HttpOnly cookies para máxima seguridad
- Rate limiting configurable por endpoint (100 req/min global, 5 auth/15min)
- Cifrado AES-256 para datos sensibles con rotación de claves
- Headers de seguridad con Helmet (CSP, HSTS, XSS protection)
- Validación estricta de inputs con class-validator
- Logs de auditoría completos con IP tracking
- Guards de roles y permisos granulares

### 📊 Monitoring y Observabilidad
- Health checks automáticos (database, memory, error rate)
- Métricas en tiempo real (requests, response time, active users)
- Logging estructurado con interceptores globales
- Auditoría completa de acciones de usuario
- Monitoring de conexiones de base de datos
- Alertas automáticas por degradación del sistema

### 🔄 DevOps y CI/CD
- Pipeline GitHub Actions para testing automático
- Docker containerization para desarrollo
- Tests E2E para autenticación y health
- Linting y type checking automático
- Build y deployment automatizado
- Security audit en pipeline

## 🚀 Características Implementadas

### 🔐 Seguridad y Autenticación
- JWT con HttpOnly cookies para máxima seguridad
- Rate limiting configurable por endpoint
- Cifrado AES-256 para datos sensibles
- Headers de seguridad con Helmet
- Validación estricta de inputs
- Logs de auditoría completos

### 👥 Gestión de Usuarios
- Sistema de roles (Admin, Psicólogos, Estudiantes)
- Registro y autenticación segura
- Gestión de perfiles y permisos
- Recuperación de contraseña

### 🗃️ Base de Datos
- PostgreSQL con esquemas optimizados
- Cifrado a nivel de campo para datos sensibles
- Relaciones complejas para workflows completos
- Migraciones versionadas con Prisma

### 🎨 Frontend Moderno
- Next.js 14 con App Router
- TypeScript para type safety
- Tailwind CSS para estilos
- Componentes reutilizables
- Estado global con Zustand

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Estado**: Zustand
- **HTTP Client**: Fetch API
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: NestJS 10
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL 15
- **ORM**: Prisma
- **Autenticación**: JWT + Passport
- **Validación**: class-validator
- **Documentación**: Swagger/OpenAPI

### Infraestructura
- **Contenedores**: Docker
- **Cache**: Redis
- **Proxy inverso**: Nginx (producción)
- **CI/CD**: GitHub Actions
- **Monitoreo**: Logs estructurados

### Seguridad
- **Cifrado**: AES-256-GCM
- **Headers**: Helmet
- **Rate Limiting**: Throttler
- **CORS**: Configurado por ambiente
- **Validación**: Pipes globales
- **Auditoría**: Logs completos

## 🏃‍♂️ Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- Docker y Docker Compose
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd psychologist-app
```

### 2. Iniciar servicios de desarrollo
```bash
# Iniciar PostgreSQL y Redis
docker-compose -f docker-compose.dev.yml up -d

# Verificar que los servicios estén corriendo
docker ps
```

### 3. Configurar el Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Aplicar migraciones
npx prisma db push

# Generar cliente Prisma
npx prisma generate

# Iniciar en modo desarrollo
npm run start:dev
```

### 4. Configurar el Frontend
```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# Iniciar en modo desarrollo
npm run dev
```

### 5. Acceder a la aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **API Docs**: http://localhost:3001/api/docs
- **Base de datos**: localhost:5432

## 🗄️ Variables de Entorno

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/psychologist_app"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"

# Server
NODE_ENV="development"
PORT=3001
```

### Frontend (.env.local)
```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"

# App
NEXT_PUBLIC_APP_NAME="Psychologist Assistant"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🔗 API Endpoints

### Autenticación
```
POST /api/v1/auth/register     # Registro de usuarios
POST /api/v1/auth/login        # Inicio de sesión
POST /api/v1/auth/logout       # Cerrar sesión
POST /api/v1/auth/refresh      # Renovar token
GET  /api/v1/auth/me          # Perfil de usuario
PATCH /api/v1/auth/change-password  # Cambiar contraseña
```

### Usuarios
```
GET    /api/v1/users           # Listar usuarios (admin)
POST   /api/v1/users           # Crear usuario (admin)
GET    /api/v1/users/:id       # Obtener usuario
PATCH  /api/v1/users/:id       # Actualizar usuario
DELETE /api/v1/users/:id       # Eliminar usuario
PATCH  /api/v1/users/:id/role  # Cambiar rol (admin)
```

### Health & Monitoring
```
GET /api/v1/health             # Estado del sistema
GET /api/v1/health/metrics     # Métricas de rendimiento
GET /api/v1/health/status      # Estado detallado
```

### Documentación
```
GET /api/docs                  # Swagger UI
GET /api/docs-json             # OpenAPI JSON
```

## 📊 Estructura del Proyecto

```
psychologist-app/
├── frontend/                 # Aplicación Next.js
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Componentes reutilizables
│   │   ├── lib/            # Utilidades y configuración
│   │   ├── store/          # Estado global
│   │   └── types/          # Definiciones TypeScript
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/        # Módulos de la aplicación
│   │   ├── common/         # Servicios compartidos
│   │   ├── config/         # Configuración
│   │   └── main.ts        # Punto de entrada
│   └── prisma/             # Esquemas y migraciones
├── docs/                   # Documentación
├── docker-compose.dev.yml  # Desarrollo
└── docker-compose.yml     # Producción
```

## 🧪 Testing

### Backend
```bash
cd backend

# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend
```bash
cd frontend

# Tests unitarios
npm run test

# Tests e2e con Playwright
npm run test:e2e
```

## 📝 Comandos Útiles

### Desarrollo
```bash
# Reiniciar base de datos
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Ver logs de la base de datos
docker logs psychologist_app_db -f

# Conectar a PostgreSQL
docker exec -it psychologist_app_db psql -U postgres -d psychologist_app

# Reiniciar schema de Prisma
cd backend
npx prisma db push --force-reset
npx prisma generate
```

### Prisma
```bash
cd backend

# Crear migración
npx prisma migrate dev --name nombre-migracion

# Aplicar migraciones
npx prisma db push

# Explorar datos
npx prisma studio

# Regenerar cliente
npx prisma generate
```

## 🔄 Próximas Fases

### Fase 2: Funcionalidades Core
- [ ] Gestión completa de clientes/pacientes
- [ ] Sistema de sesiones terapéuticas
- [ ] Grabación y transcripción de audio
- [ ] Generación de reportes automáticos

### Fase 3: Integración IA
- [ ] Transcripción automática con Whisper
- [ ] Análisis de sentimientos
- [ ] Sugerencias terapéuticas con GPT-4
- [ ] Simulador de casos clínicos

### Fase 4: Funcionalidades Avanzadas
- [ ] Sistema de pagos con Stripe
- [ ] Notificaciones en tiempo real
- [ ] Calendario y citas
- [ ] Dashboard analítico

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte y preguntas:
- 📧 Email: soporte@psychologist-app.com
- 📱 Discord: [Servidor de la comunidad]
- 📖 Documentación: [docs.psychologist-app.com]

---

**Desarrollado con ❤️ para mejorar la práctica psicológica con tecnología moderna**