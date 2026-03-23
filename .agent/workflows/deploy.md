---
description: Cómo desplegar la aplicación
---

# Pasos para el despliegue según el flujo oficial (GitHub)

1. **Pre-producción (Vercel)**
   El entorno de pruebas `preprod` se compila y aloja de forma **completamente automática en Vercel**.
   Sólo asegúrate de pasar tus últimos cambios de development a `preprod` y envíalos a GitHub:
   ```bash
   git checkout preprod
   git merge development
   git push origin preprod
   ```
   *Vercel detectará el nuevo commit mágicamente y desplegará la versión.*

2. **Producción (Hetzner)**
   El entorno de producción oficial no tiene auto-deploy en GitHub Actions para máxima seguridad. 
   Todo el código final se aloja en GitHub, pero el despliegue requiere **acceder de forma manual por SSH al servidor Hetzner** para iniciar el contenedor de Docker:
   ```bash
   # 1. Pujeamos todo el código firme finalitzado:
   git checkout main
   git merge development
   git push origin main
   
   # 2. Entramos desde nuestro terminal manualmente al Hetzner:
   # ssh tu-usuario@tu-hetzner-ip
   # cd /ruta-app/psicoaissist-platform
   # git pull origin main
   # ./deploy.sh prod
   ```
