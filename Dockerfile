FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
# O Railway define PORT; localmente fica 8080. API_URL é lida ao subir o container (ver 40-chama-config.sh).
ENV PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 docker/40-chama-config.sh /docker-entrypoint.d/40-chama-config.sh
COPY --from=build /app/dist /usr/share/nginx/html
