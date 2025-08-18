# ---------- Base para construir ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Mejor cacheo: primero dependencias
COPY package*.json ./
RUN npm ci

# Copiamos el código
COPY tsconfig*.json ./
COPY src ./src

# Compilamos a dist
RUN npm run build

# ---------- Imagen final ligera ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Variables por defecto (puedes sobreescribir con Compose)
ENV NODE_ENV=production
ENV PORT=3000

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos build listo
COPY --from=builder /app/dist ./dist

# Si usas archivos .env en runtime, copia si aplicara (normalmente se inyectan en compose)
# EXPOSE para documentación
EXPOSE 3000

# Comando en producción
CMD ["node", "dist/main.js"]