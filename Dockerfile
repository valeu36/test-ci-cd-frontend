# Keep in step with .nvmrc.
ARG NODE_VERSION=24.18.0

# ---- builder: the production bundle -----------------------------------------
FROM node:${NODE_VERSION}-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Baked into the bundle at build time (see .env.example). On Railway, set
# VITE_API_URL as a service variable — Railway passes service variables to a
# Dockerfile build as build args when the Dockerfile declares them.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---- runner: static files behind nginx ---------------------------------------
FROM nginx:1.29-alpine AS runner

# Railway injects PORT; 80 is the local default.
ENV PORT=80
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
