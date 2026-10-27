#!/bin/sh
# Gera /config.js com o endereço público da API a partir de API_URL (ou VITE_API_URL).
# Aceita só o domínio (ex.: ${{chama-api.RAILWAY_PUBLIC_DOMAIN}}); nesse caso usa https.
set -e
url="${API_URL:-$VITE_API_URL}"
if [ -z "$url" ]; then
  echo "ERRO: defina a variável API_URL com o endereço público da chama-api (o domínio do serviço da API em Settings > Networking)" >&2
  exit 1
fi
case "$url" in
  http://* | https://*) ;;
  *) url="https://$url" ;;
esac
url="${url%/}"
if ! echo "$url" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]+)?(/[A-Za-z0-9._/-]*)?$'; then
  echo "ERRO: API_URL inválida: $url" >&2
  exit 1
fi
printf 'window.CHAMA_CONFIG = { apiUrl: "%s" }\n' "$url" > /usr/share/nginx/html/config.js
echo "chama: API em $url"
