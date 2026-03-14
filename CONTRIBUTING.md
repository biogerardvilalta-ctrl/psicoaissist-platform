# Reglas de Contribución y Entornos

Este documento establece las reglas fundamentales para trabajar en el proyecto **PsicoAIssist**. El incumplimiento de estas normas puede llevar a fallos graves en los entornos de producción o pérdida de datos.

## 1. Regla de Oro Continua: SIEMPRE DEVELOPMENT
**En tu ordenador local SIEMPRE se trabaja en modo development.**
- Nunca, bajo ninguna circunstancia, configures tu base de datos local para que apunte a la base de datos de producción o preproducción.
- Nunca arranques el servidor local usando `.env.prod` o `.env.preprod` para "hacer una prueba rápida".
- Tu archivo `.env` local debe tener siempre: `NODE_ENV=development`.
- Al iniciar una sesión de trabajo, el script `./check-env.sh` te protegerá verificando este modo.

## 2. Gestión de Entornos (Environments)
El proyecto cuenta con tres entornos principales:
1. **Development (Local)**: Para el trabajo diario. Usa el archivo `.env`. (NO se sube a GitHub).
2. **Pre-producción (Staging)**: Entorno beta en un servidor externo. Usa variables de entorno propias o `.env.preprod` en su servidor respectivo. Base de datos y Stripe en "modo de pruebas".
3. **Producción (Live)**: Entorno real con clientes reales. Stripe en "live" y base de datos con información altamente sensible.

**REGLA:** **Los archivos `.env.prod` y `.env.preprod` con contraseñas reales NUNCA deben subirse al repositorio Git.** Git solo debe contener las plantillas (`.env.prod.example` etc.).

## 3. Ramas de Git (Branching Workflow)
Seguimos un flujo basado en entornos:
- **`main`**: Es la rama de **Producción (Prod)**. Código final e intocable.
- **`preprod`**: Es la rama de **Pre-producción**. Para pruebas en el servidor antes de los clientes.
- **`development`**: Es la rama base de **Desarrollo (Dev)**. Todas las tareas nuevas nacen de aquí.

**Flujo de trabajo para una nueva tarea:**
1. Siempre crea tu rama desde `development`:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/nuevo-dashboard
   ```
2. Trabaja localmente, haz commits y sube tu rama (Push).
3. Haz Merge Request a `development`.

**Flujo de despliegues (Merge Requests):**
1. De `feature/...` → Merge a `development` (desarrollo diario).
2. De `development` → Merge a `preprod` (despliegue automático a Staging para pruebas).
3. De `preprod` → Merge a `main` (despliegue automático a Producción para clientes reales).

## 4. Despliegues (Deployments)
Los despliegues manuales (entrar al servidor vía SSH, hacer `git pull` y reiniciar) quedan limitados al entorno `development` o a situaciones de extrema emergencia.
- **Debe usarse automatización**: El despliegue de las integraciones a `preprod` y `prod` se hará a través de flujos automáticos ejecutados mediante GitHub Actions que leerán Secrets seguros de la plataforma Git.

## 5. Secretos y Credenciales
- **Prohibido "Hardcodear"**. Ninguna contraseña, token API o secreto puede escribirse directamente en los archivos `.ts`, `.tsx`, `.js`, `.py` del código fuente. Todo debe leerse desde `process.env`.
- **Plantillas SI**: Los desarrolladores deben mantener actualizadas las plantillas (`.env.preprod.example`, etc) cuando añadan una nueva variable obligatoria, dejándola inicialmente vacía para que el equipo lo vea y la configure en el entorno de despliegue.
