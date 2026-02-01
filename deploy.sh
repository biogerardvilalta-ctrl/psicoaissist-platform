#!/bin/bash

# Script de Despliegue Rápido para PsicoAIssist (Beta)

echo "🚀 Iniciando despliegue..."

# 1. Bajar últimos cambios de la rama actual (normalmente main)
echo "📦 Guardando posibles cambios locales..."
git stash

echo "📥 Descargando código..."
git pull

echo "♻️ Recuperando cambios locales..."
git stash pop || echo "⚠️  No había cambios locales o hubo conflicto (eso es normal si tocaste lo mismo que nosotros)."

# 2. Despliegue con Zero-Downtime (o casi cero)
echo "🐳 Actualizando contenedores (Rolling Update)..."

# Usamos 'up -d --build' directamete. Docker es inteligente:
# 1. Si hay cambios, crea el nuevo contenedor
# 2. Detiene el viejo
# 3. Arranca el nuevo
# SIN tirar toda la plataforma abajo primero.
docker compose up -d --build --remove-orphans

# 3. Validar que todo arrancó bien
echo "🔍 Verificando salud del despliegue..."
sleep 5

if docker compose ps | grep "Exit"; then
    echo "❌ ERROR: Algunos contenedores fallaron al arrancar."
    docker compose ps
    echo "📜 Logs recientes:"
    docker compose logs --tail=20
    exit 1
fi

# 4. Limpieza suave (solo si todo salió bien)
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f >/dev/null 2>&1

echo "✅ ¡Despliegue completado con éxito!"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $API_URL"

