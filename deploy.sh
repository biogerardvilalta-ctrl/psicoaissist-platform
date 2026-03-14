#!/bin/bash

# Script de Despliegue SEGURO
# Requiere especificar entorno: ./deploy.sh [preprod|prod]

ENV=$1

if [[ "$ENV" != "preprod" && "$ENV" != "prod" ]]; then
  echo "❌ Error: Especificar entorno. Uso: ./deploy.sh [preprod|prod]"
  exit 1
fi

COMPOSE_FILE="docker-compose.${ENV}.yml"
PROJECT_NAME="psicoaissist_${ENV}"

echo "🚀 Iniciando despliegue seguro (Modo Ahorro RAM) para: ${ENV^}"

# 1. Bajar cambios (Si estamos en manual. Si es GitHub Actions, ya bajó el código)
echo "📥 Descargando código..."
git stash  # Guardar cambios locales por si acaso
git pull
git stash pop || echo "⚠️  No había cambios locales o conflicto."

# 2. PARADA TÉCNICA
echo "🛑 Deteniendo contenedores para liberar RAM..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME stop

# 3. Limpieza preventiva
echo "🧹 Limpiando contenedores antiguos..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME rm -f

# 4. Construcción (Build)
echo "🏗️ Construyendo imágenes (esto puede tardar)..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache

# 5. Arranque
echo "🔥 Arrancando plataforma..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d

# 6. Verificación
echo "🔍 Verificando estado..."
sleep 5
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME ps

echo "✅ Despliegue completado para ${ENV}."
