FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Endereço público da API, embutido no build (no Railway, defina como variável do serviço).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL VITE_BASE=/
RUN test -n "$VITE_API_URL" || (echo "Defina VITE_API_URL" && exit 1)
RUN npm run build

FROM nginx:1.29-alpine
# O Railway define PORT; localmente fica 8080.
ENV PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
