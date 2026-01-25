#!/bin/bash

echo "---------------------------------------------------"
echo "🔍 DIAGNÓSTICO DE AUTH HEADER (PsicoAIssist)"
echo "---------------------------------------------------"
echo "Objetivo: Verificar si Google bloquea la API Key cuando va en la Cabecera (Header)."

if [ -f .env ]; then
  # Manual parsing robusto
  RAW_KEY=$(grep "GEMINI_API_KEY" .env | head -n1 | cut -d '=' -f2-)
  GEMINI_API_KEY=$(echo "$RAW_KEY" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  
  RAW_MODEL=$(grep "GEMINI_MODEL" .env | head -n1 | cut -d '=' -f2-)
  GEMINI_MODEL=$(echo "$RAW_MODEL" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
else
  echo "❌ ERROR: No se encuentra el archivo .env"
  exit 1
fi

MODEL="${GEMINI_MODEL:-gemini-2.0-flash}"

echo "📡 Probando: Header 'x-goog-api-key' (Método de la librería SDK)..."
echo "📍 Modelo: $MODEL"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Say Hello"}]}]}')

HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS:.*//')

if [ "$HTTP_STATUS" == "200" ]; then
  echo -e "\n✅ ÉXITO (Header Funciona):"
  echo "$BODY" | grep -o 'text": *"[^"]*' | head -1
  echo -e "\n🏁 CONCLUSIÓN: El Header funciona. El problema es la librería Node o su versión."
else
  echo -e "\n❌ FALLO (Header Bloqueado):"
  echo "Status: $HTTP_STATUS"
  echo "$BODY"
  echo -e "\n🏁 CONCLUSIÓN: Google bloquea Auth por Header para tu IP. Debemos usar Query Param."
fi
echo "---------------------------------------------------"
