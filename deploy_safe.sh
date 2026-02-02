#!/bin/bash

# Script de Despliegue SEGURO (Low RAM)
# Este script DETIENE los servicios antes de construir para ahorrar memoria.
# Úsalo si tu servidor tiene < 4GB de RAM y se cuelga al desplegar.

echo "🚀 Iniciando despliegue seguro (Modo Ahorro RAM)..."

# 1. Bajar cambios
echo "📥 Descargando código..."
git stash  # Guardar cambios locales por si acaso
git pull
git stash pop || echo "⚠️  No había cambios locales o conflicto."

# 2. PARADA TÉCNICA (Clave para servidores pequeños)
echo "🛑 Deteniendo contenedores para liberar RAM..."
docker compose stop

# 3. Limpieza preventiva
echo "🧹 Limpiando contenedores antiguos..."
docker compose rm -f

# 4. Construcción (Build)
# Al estar parados los contenedores, tenemos toda la RAM disponible para esto.
echo "🏗️ Construyendo imágenes (esto puede tardar)..."
docker compose build --no-cache

# 5. Arranque
echo "🔥 Arrancando plataforma..."
docker compose up -d

# 6. Verificación
echo "🔍 Verificando estado..."
sleep 5
docker compose ps

echo "✅ Despliegue completado."
