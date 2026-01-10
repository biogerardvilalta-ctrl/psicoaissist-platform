# Guía de Despliegue en Servidor (Beta)

Esta guía explica cómo instalar y actualizar la versión Beta de PsicoAIssist en un servidor Ubuntu/Linux.

## 1. Requisitos Previos en el Servidor
Asegúrate de tener instalados `git` y `docker` (con Docker Compose).

```bash
# Instalar Docker (si no lo tienes)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## 2. Configuración Inicial (Solo la primera vez)

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DE_TU_REPO_GITLAB> psicoaissist-platform
   cd psicoaissist-platform
   git checkout develop  # Asegúrate de estar en la rama correcta
   ```

2. **Configurar el entorno**:
   ```bash
   cp env.beta.example.txt .env
   nano .env
   ```
   *   **Importante**: Cambia `POSTGRES_PASSWORD`, `JWT_SECRET`, etc. por valores seguros.
   *   Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`.

3. **Dar permisos al script de despliegue**:
   ```bash
   chmod +x deploy.sh
   ```

4. **Primer arranque**:
   ```bash
   ./deploy.sh
   ```

## 3. Actualizar la App (Día a día)

Cuando hayas subido cambios a GitLab desde tu ordenador:

1. Conéctate al servidor vía SSH.
2. Entra en la carpeta:
   ```bash
   cd psicoaissist-platform
   ```
3. Ejecuta el script:
   ```bash
   ./deploy.sh
   ```

¡El script bajará los cambios, reconstruirá lo necesario y reiniciará la app automáticamente!

## URLs de Acceso
- **Frontend**: `http://TU_IP:3000`
- **Backend API**: `http://TU_IP:3001`
