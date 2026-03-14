---
description: Cómo desplegar la aplicación
---

# Pasos para el despliegue

1. **Verificar el estado del repositorio**
   Asegúrate de que todos los cambios estén confirmados y listos para producción.
   ```bash
   git status
   ```

2. **Ejecutar pruebas locales**
   Asegúrate de que no haya errores antes de desplegar.
   ```bash
   npm run build
   # o el comando equivalente de build
   ```

3. **Desplegar a producción**
   Ejecuta el comando correspondiente según la plataforma (por ejemplo, Vercel, Railway, etc.).
   ```bash
   # Ejemplo para Vercel
   # vercel --prod
   ```
