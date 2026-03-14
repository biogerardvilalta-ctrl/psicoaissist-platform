#!/bin/bash

# check-env.sh
# Script para verificar que estemos corriendo el entorno en development
# Protege de no lanzar sin querer un entorno de preprod o prod conectándose
# a bases de datos o APIs reales en local.

red='\033[0;31m'
green='\033[0;32m'
nc='\033[0m' # No Color

# Cargar variables del .env si existe
if [ -f .env ]; then
  source .env
fi

if [ "$NODE_ENV" != "development" ]; then
  echo -e "${red}========================================================================${nc}"
  echo -e "${red}ERROR CRÍTICO: El entorno no está configurado para desarrollo local.${nc}"
  echo -e "${red}NODE_ENV actual: '${NODE_ENV}'${nc}"
  echo -e ""
  echo -e "${red}REGLA DE ORO:${nc} Siempre se debe trabajar en local con ${green}NODE_ENV=development${nc}"
  echo -e "Asegúrate de que el archivo .env tenga NODE_ENV=development"
  echo -e "Los entornos de preprod o prod solo deben lanzarse en el servidor vía GitHub Actions."
  echo -e "${red}========================================================================${nc}"
  echo -e "Abortando el despliegue..."
  exit 1
fi

echo -e "${green}✅ Entorno configurado correctamente para desarrollo (NODE_ENV=development).${nc}"
exit 0
