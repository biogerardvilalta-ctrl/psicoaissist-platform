#!/bin/bash

# Script de Despliegue Rápido para PsicoAIssist (Beta)

echo "🚀 Iniciando despliegue..."

# 1. Bajar últimos cambios de la rama actual (normalmente main)
echo "📥 Descargando código..."
git pull

# 2. Reconstruir y reiniciar contenedores
echo "🐳 Reconstruyendo contenedores..."
# --build fuerza la reconstrucción para asegurar que los cambios de código se apliquen
# -d lo ejecuta en segundo plano (detached)
docker compose up -d --build

# 3. Limpieza opcional (elimina imágenes antiguas para ahorrar espacio)
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "✅ ¡Despliegue completado con éxito!"
echo "   Frontend: http://localhost:3000 (o tu IP)"
echo "   Backend:  http://localhost:3001"
