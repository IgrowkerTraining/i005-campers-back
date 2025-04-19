# Etapa 1: build
FROM node:22.14.0-alpine as builder

WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json prisma ./
RUN npm install

# Agregar el binaryTarget correcto en schema.prisma antes de este paso
RUN npx prisma generate

# Copiar el resto de archivos y construir la app
COPY . .
RUN npm run build

# Etapa 2: producción
FROM node:22.14.0-alpine as production

WORKDIR /app

# Instalar OpenSSL necesario en producción
RUN apk add --no-cache openssl

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.prisma ./node_modules/.prisma

# Exponer el puerto por defecto de Nest
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]