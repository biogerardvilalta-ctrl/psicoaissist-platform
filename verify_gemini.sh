#!/bin/bash
# Load .env variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ ERROR: No se encuentra el archivo .env"
  exit 1
fi

echo "---------------------------------------------------"
echo "🔍 DIAGNÓSTICO DE CONEXIÓN GEMINI (PsicoAIssist)"
echo "---------------------------------------------------"

if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ ERROR: No se encontró GEMINI_API_KEY en el archivo .env"
  exit 1
fi

echo "✅ API Key encontrada: ${GEMINI_API_KEY:0:10}......"
echo "✅ Modelo configurado: ${GEMINI_MODEL:-"gemini-2.0-flash (default)"}"

# Use configured model or fallback to 1.5-flash for testing since we know 2.0 fails often on servers
TEST_MODEL="${GEMINI_MODEL:-gemini-1.5-flash}"

echo -e "\n📡 Probando conexión directa a Google desde el servidor..."
echo "📍 Modelo: $TEST_MODEL"
echo "📍 Endpoint: https://generativelanguage.googleapis.com/v1beta/models/$TEST_MODEL:generateContent"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Say Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/$TEST_MODEL:generateContent?key=$GEMINI_API_KEY")

HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS:.*//')

if [ "$HTTP_STATUS" == "200" ]; then
  echo -e "\n✅ ÉXITO: Google ha respondido correctamente (Status 200)."
  echo "📝 Respuesta: $(echo $BODY | grep -o 'text": *"[^"]*' | head -1)"
  echo -e "\n🏁 CONCLUSIÓN: La Key y la Red funcionan. El problema está en Docker o el Código."
else
  echo -e "\n❌ ERROR: Google rechazó la conexión (Status $HTTP_STATUS)."
  echo "📝 Detalle del error:"
  echo "$BODY"
  echo -e "\n🏁 CONCLUSIÓN: El problema es la Key, Facturación (Billing) o bloqueo de IP."
fi
echo "---------------------------------------------------"
