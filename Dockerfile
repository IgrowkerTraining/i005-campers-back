# Etapa 1: build
FROM node:slim AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar el proyecto
RUN npm run build

# Etapa 2: runtime
FROM node:slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copiar solo el código compilado
COPY --from=builder /app/dist ./dist

# Exponer el puerto por defecto de NestJS (3000)
EXPOSE 3000

CMD ["node", "dist/main"]

