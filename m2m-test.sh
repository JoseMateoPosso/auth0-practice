#!/usr/bin/env bash
#
# Prueba del flujo Client Credentials (máquina a máquina, M2M).
#
# Un servicio backend (sin usuario) se autentica con su client_id + client_secret,
# obtiene un access token para la API y lo usa para llamar a /api/orders.
#
# Uso:
#   AUTH0_DOMAIN=TU-TENANT.us.auth0.com \
#   AUTH0_AUDIENCE=https://api.practica.local \
#   M2M_CLIENT_ID=xxx M2M_CLIENT_SECRET=yyy \
#   ./m2m-test.sh
#
# Requisitos: curl y node (ya necesario para la API).

# Salir ante cualquier error, variable no definida o fallo en un pipe.
set -euo pipefail

# Validar variables obligatorias (muestra el mensaje y sale si falta alguna).
: "${AUTH0_DOMAIN:?Falta AUTH0_DOMAIN}"
: "${AUTH0_AUDIENCE:?Falta AUTH0_AUDIENCE}"
: "${M2M_CLIENT_ID:?Falta M2M_CLIENT_ID}"
: "${M2M_CLIENT_SECRET:?Falta M2M_CLIENT_SECRET}"
API_URL="${API_URL:-http://localhost:3001}"

# 1. Pedir el token a Auth0 (endpoint /oauth/token, grant_type=client_credentials).
echo "1) Solicitando access token a Auth0..."
RESPONSE=$(curl -s --request POST "https://${AUTH0_DOMAIN}/oauth/token" \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "client_id=${M2M_CLIENT_ID}" \
  --data-urlencode "client_secret=${M2M_CLIENT_SECRET}" \
  --data-urlencode "audience=${AUTH0_AUDIENCE}")

# Extraer access_token del JSON (con node, para no depender de jq/python).
TOKEN=$(node -e '
  const body = JSON.parse(process.argv[1]);
  if (!body.access_token) { console.error("Error de Auth0:", body); process.exit(1); }
  console.log(body.access_token);
' "$RESPONSE")

# Nunca imprimir el token completo: es una credencial.
echo "   Token obtenido: ${TOKEN:0:20}..."

# 2. Llamar a la API protegida con el token.
echo "2) GET ${API_URL}/api/orders"
curl -s -i "${API_URL}/api/orders" --header "Authorization: Bearer ${TOKEN}"
echo
