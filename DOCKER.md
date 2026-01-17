# Docker Compose Setup

Este proyecto usa un docker-compose optimizado para monorepo con Redis y el servicio API.

## Arquitectura

- **Dockerfile por servicio** (`services/api/Dockerfile`) - Solo copia dependencias necesarias
- **Build multi-stage** - Reduce imagen final eliminando devDependencies
- **Non-root user** - Mejora seguridad
- **Docker layer caching** - Builds más rápidos

## Servicios

- **Redis**: `redis:7-alpine` (puerto 6379) con persistencia
- **API**: NestJS (puerto 3000) con health checks

## Setup Inicial

```bash
cp .env.example .env
docker-compose up -d
```

## Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo API
docker-compose logs -f api

# Solo Redis
docker-compose logs -f redis
```

## Gestión

```bash
# Detener
docker-compose down

# Detener + eliminar volúmenes
docker-compose down -v

# Reconstruir API
docker-compose up -d --build api

# Ver estado
docker-compose ps
```

## Connection Strings

- **Redis**: `redis://localhost:6379` (host) | `redis://redis:6379` (Docker)
- **API**: `http://localhost:3000`

## Build Details

El Dockerfile del API:

1. Instala solo `dependencies` del servicio (sin devDependencies)
2. Usa layer caching para builds incrementales
3. Ejecuta como usuario `nestjs:nodejs` (non-root)
4. Imagen final ~150MB (vs ~500MB sin optimización)
