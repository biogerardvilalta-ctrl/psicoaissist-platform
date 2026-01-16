#!/bin/bash

# Script de Despliegue Rápido para PsicoAIssist (Beta)

echo "🚀 Iniciando despliegue..."

# 1. Bajar últimos cambios de la rama actual (normalmente main)
echo "📥 Descargando código..."
git pull

# 2. Reconstruir y reiniciar contenedores
echo "🐳 Reconstruyendo contenedores..."

# Pre-limpieza: Asegurar que el puerto 3001 esté libre (evita error 500 por procesos zombies)
if lsof -i :3001 -t >/dev/null; then
    echo "⚠️  Detectado proceso ocupando puerto 3001. Intentando liberar..."
    echo "    1. Deletiendo contenedores antiguos..."
    docker compose down
    
    # Si sigue ocupado, es un proceso rogue (zombie)
    if lsof -i :3001 -t >/dev/null; then
        echo "    2. Matando proceso zombie en puerto 3001..."
        kill -9 $(lsof -t -i:3001) || true
    fi
fi

# --build fuerza la reconstrucción para asegurar que los cambios de código se apliquen
# -d lo ejecuta en segundo plano (detached)
docker compose up -d --build

# 3. Aplicar migraciones de base de datos
echo "🔄 Aplicando migraciones de base de datos..."
sleep 5 # Esperar un poco a que el backend arranque
docker exec psicoaissist_beta_backend npx prisma migrate deploy

# 3. Limpieza opcional (elimina imágenes antiguas para ahorrar espacio)
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "✅ ¡Despliegue completado con éxito!"
echo "   Frontend: http://localhost:3000 (o tu IP)"
echo "   Backend:  http://localhost:3001"
