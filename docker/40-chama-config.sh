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

# Configuração web do Firebase (pública por natureza: vai para o navegador). Usada no SMS do cadastro.
auth_domain="${FIREBASE_AUTH_DOMAIN:-$FIREBASE_PROJECT_ID.firebaseapp.com}"
for v in FIREBASE_API_KEY FIREBASE_PROJECT_ID FIREBASE_APP_ID; do
  eval "val=\${$v:-}"
  if [ -z "$val" ]; then
    echo "ERRO: defina $v (Console do Firebase > Configurações do projeto > Seus apps > app da Web)" >&2
    exit 1
  fi
done
for val in "$FIREBASE_API_KEY" "$FIREBASE_PROJECT_ID" "$FIREBASE_APP_ID" "$auth_domain"; do
  if ! echo "$val" | grep -Eq '^[A-Za-z0-9._:-]+$'; then
    echo "ERRO: valor inválido nas variáveis FIREBASE_*: $val" >&2
    exit 1
  fi
done

printf 'window.CHAMA_CONFIG = { apiUrl: "%s", firebase: { apiKey: "%s", authDomain: "%s", projectId: "%s", appId: "%s" } }\n' \
  "$url" "$FIREBASE_API_KEY" "$auth_domain" "$FIREBASE_PROJECT_ID" "$FIREBASE_APP_ID" > /usr/share/nginx/html/config.js
echo "chama: API em $url, Firebase $FIREBASE_PROJECT_ID"
