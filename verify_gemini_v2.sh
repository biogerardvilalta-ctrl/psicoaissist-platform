#!/bin/bash

echo "---------------------------------------------------"
echo "🔍 DIAGNÓSTICO DE CONEXIÓN GEMINI V2 (PsicoAIssist)"
echo "---------------------------------------------------"

# Manual .env parsing to avoid xargs/quote issues
if [ -f .env ]; then
  # Read KEY directly using grep to handle quotes securely
  RAW_KEY=$(grep "GEMINI_API_KEY" .env | head -n1 | cut -d '=' -f2-)
  # Remove potential surrounding quotes (double or single)
  GEMINI_API_KEY=$(echo "$RAW_KEY" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  
  # Read MODEL
  RAW_MODEL=$(grep "GEMINI_MODEL" .env | head -n1 | cut -d '=' -f2-)
  GEMINI_MODEL=$(echo "$RAW_MODEL" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
else
  echo "❌ ERROR: No se encuentra el archivo .env"
  exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ ERROR: No se encontró GEMINI_API_KEY en el archivo .env"
  exit 1
fi

echo "✅ API Key leída: ${GEMINI_API_KEY:0:10}...... (Longitud: ${#GEMINI_API_KEY})"
TEST_MODEL="${GEMINI_MODEL:-gemini-1.5-flash}"

echo -e "\n📡 Probando conexión directa..."
echo "📍 Modelo: $TEST_MODEL"
echo "📍 Endpoint: https://generativelanguage.googleapis.com/v1beta/models/$TEST_MODEL:generateContent"

# Request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Say Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/$TEST_MODEL:generateContent?key=$GEMINI_API_KEY")

HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS:.*//')

if [ "$HTTP_STATUS" == "200" ]; then
  echo -e "\n✅ ÉXITO: Google ha respondido correctamente (Status 200)."
  echo "📝 Respuesta: $(echo $BODY | grep -o 'text": *"[^"]*' | head -1)"
  echo -e "\n🏁 CONCLUSIÓN: La Key está PERFECTA. El problema está en la App."
else
  echo -e "\n❌ ERROR: Google rechazó la conexión (Status $HTTP_STATUS)."
  echo "📝 Detalle del error:"
  echo "$BODY"
  echo -e "\n🏁 CONCLUSIÓN: La Key o el Billing fallan."
fi
echo "---------------------------------------------------"
