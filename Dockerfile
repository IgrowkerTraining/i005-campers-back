# Etapa 1: build
FROM node:22.14.0-alpine as builder

WORKDIR /app

# Copiar dependencias y archivos de prisma
COPY package*.json ./
COPY prisma ./prisma

# Instalar dependencias
RUN npm install

# Generar cliente Prisma con binarios correctos
RUN npx prisma generate

# Copiar el resto de la aplicación y compilar
COPY . .
RUN npm run build

# Etapa 2: producción
FROM node:22.14.0-alpine as production

WORKDIR /app

# Instalar OpenSSL
RUN apk add --no-cache openssl

# Copiar archivos necesarios desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Exponer el puerto de Nest
EXPOSE 3000

# Iniciar la app
CMD ["node", "dist/main"]
