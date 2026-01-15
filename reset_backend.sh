#!/bin/bash
echo "🛑 Deteniendo y eliminando contenedores..."
docker compose stop backend
docker compose rm -f backend

echo "🧹 Eliminando imagen antigua..."
docker image rm psicoaissist-platform-backend

echo "🔨 Reconstruyendo backend DESDE CERO (sin caché)..."
# Force copy of the file to verify it's picked up
cp backend/src/modules/payments/payments.controller.ts backend/src/modules/payments/payments.controller.ts.bak
touch backend/src/modules/payments/payments.controller.ts

docker compose build --no-cache backend

echo "🚀 Arrancando backend..."
docker compose up -d backend

echo "⏳ Esperando a que inicie..."
sleep 10

echo "📜 Logs del inicio (Buscando 'RawBody: true' config implication)..."
docker logs psicoaissist_beta_backend --tail 20

echo "✅ Listo. Prueba 'Reenviar' en Stripe y mira: docker logs -f psicoaissist_beta_backend"
