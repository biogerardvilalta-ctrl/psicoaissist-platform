#!/bin/bash

# Script de Despliegue RÁPIDO (Optimized for 4GB RAM)
# 1. Detiene servicios para liberar RAM (Seguridad).
# 2. Construye SIN --no-cache para usar capas existentes (Velocidad).
# 3. Limita Node a 3GB (en Dockerfiles) para evitar Swap/Crash (Estabilidad).

echo "🚀 Iniciando despliegue RÁPIDO (Smart Cache)..."

# 1. Bajar cambios
echo "📥 Descargando código..."
git stash
git pull
git stash pop || echo "⚠️  No había cambios locales o conflicto."

# 2. PARADA TÉCNICA (Necesaria en 4GB RAM)
echo "🛑 Deteniendo contenedores para liberar RAM..."
docker compose stop

# 3. Construcción INTELIGENTE (Usa Caché)
echo "🏗️ Construyendo imágenes (usando caché para velocidad)..."
# NOTA: Quitamos --no-cache. Docker solo reconstruirá lo que haya cambiado.
docker compose build

# 4. Arranque
echo "🔥 Arrancando plataforma..."
docker compose up -d

# 5. Limpieza
echo "🧹 Limpiando imágenes huérfanas..."
docker image prune -f

# 6. Verificación
echo "🔍 Verificando estado..."
sleep 5
docker compose ps

echo "✅ Despliegue RÁPIDO completado."
