#!/bin/bash

echo "---------------------------------------------------"
echo "🔍 LISTADO DE MODELOS DISPONIBLES (PsicoAIssist)"
echo "---------------------------------------------------"

if [ -f .env ]; then
  RAW_KEY=$(grep "GEMINI_API_KEY" .env | head -n1 | cut -d '=' -f2-)
  GEMINI_API_KEY=$(echo "$RAW_KEY" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
else
  echo "❌ ERROR: No se encuentra el archivo .env"
  exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ ERROR: No se encontró GEMINI_API_KEY"
  exit 1
fi

echo "✅ API Key: ${GEMINI_API_KEY:0:10}..."

echo -e "\n📡 Consultando a Google qué modelos permite usar tu Key..."
echo "📍 Endpoint: https://generativelanguage.googleapis.com/v1beta/models"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
  "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY")

HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS:.*//')

if [ "$HTTP_STATUS" == "200" ]; then
  echo -e "\n✅ ÉXITO (Status 200). Modelos encontrados:"
  # Extract model names using grep/sed for simplicity avoiding jq dependency
  echo "$BODY" | grep "\"name\": \"models/" | sed 's/.*"name": "\(.*\)",/\1/'
else
  echo -e "\n❌ ERROR (Status $HTTP_STATUS)."
  echo "📝 Detalle:"
  echo "$BODY"
fi
echo "---------------------------------------------------"
