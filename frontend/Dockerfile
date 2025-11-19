# Frontend Dockerfile for Vite + React
# Multi-stage: dev (hot reload) & prod (static build)

# ---------- Base node image ----------
FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend .


# ---------- Development image ----------
FROM base AS dev

EXPOSE 5173

# Vite dev server with HMR, listening on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


# ---------- Production build ----------
FROM base AS build

RUN npm run build


# ---------- Production Nginx image ----------
FROM nginx:1.27-alpine AS prod

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
