# Stage 1: Build do frontend com Node
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Imagem final Nginx
FROM nginx:alpine

# Limpa diretório padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia build estático gerado no Stage 1
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copia configuração do proxy reverso e SPA
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
