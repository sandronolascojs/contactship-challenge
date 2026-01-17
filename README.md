# Contactship Challenge

Microservicio para gestión de leads con integración de IA, sincronización desde APIs externas, cache y colas de trabajo.

## Stack Técnico

- Backend Framework: NestJS 11.x + TypeScript 5.8+
- Database: PostgreSQL (Supabase) con Drizzle ORM
- Cache: Redis (cache-manager) con TTL configurable
- Job Queue: BullMQ 5.66+ para procesos asíncronos
- Authentication: JWT con Passport
- AI/ML: Mastra AI con OpenAI GPT-4o-mini
- Orchestration: pnpm workspaces con Turbo
- Scheduler: @nestjs/schedule para CRON jobs

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        Client (HTTP)                        │
└─────────────────────────┬─────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │             │
              Public      JWT Auth Required
                    │             │
    ┌───────────────▼─────────────▼─────────────────────────────┐
│                    API Controllers                          │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │ AuthController│ LeadsController│ SyncController       │ │
│  │ (login)      │ (CRUD + AI)  │ (Sync jobs)         │ │
│  └──────┬───────┴───────┬──────┴─────────┬──────────┘ │
└─────────┼──────────────────┼────────────────┼────────────────┼──────────────┘
          │                  │                │
    ┌─────▼──────┐    ┌───▼───────┐   ┌───▼────────┐
    │AuthService  │    │LeadsService│   │SyncService │
    │(JWT)       │    │+AiService  │   │+Queue      │
    └─────┬──────┘    └─────┬─────┘   └─────┬──────┘   └─────┬──────┘
          │                   │                │
          │                   │         ┌──────▼──────────────┐
          │                   │         │   BullMQ Queue     │
          │                   │         │ (sync-external-   │
          │                   │         │    leads)          │
          │                   │         └──────┬──────────────┘
          │                   │                │
          │                   │         ┌──────▼──────────────┐
          │                   │         │SyncScheduler        │
          │                   │         │(CRON: cada hora)  │
          │                   │         └─────────────────────┘
          │                   │
    ┌─────▼──────┐    ┌────▼──────────────────┐
    │   Cache    │    │Repositories          │
    │  (Redis)   │    │ - LeadsRepository    │
    │             │    │ - PersonsRepository  │
    │             │    │ - SyncJobsRepository│
    │             │    └──────────────────────┘
    │             │              │
    │             │         ┌────▼────────────┐
    │             │         │ PostgreSQL DB   │
    │             │         └────────────────┘
    │             │
    └─────────────┘
```

## Características Implementadas

### Funcionales ✅

- ✅ Crear leads manualmente (`POST /leads` y `POST /create-lead`)
- ✅ Listar leads existentes (`GET /leads` con paginación y filtros)
- ✅ Obtener detalle de lead (`GET /leads/:id` con cache Redis)
- ✅ Generar resumen con IA (`POST /leads/:id/summarize`)
- ✅ Sincronizar leads automáticamente desde RandomUser.me (CRON cada hora)
- ✅ Disparar sincronización manual (`POST /sync/trigger`)
- ✅ Consultar jobs de sincronización (`GET /sync/jobs` y `GET /sync/jobs/:id`)

### No Funcionales ✅

- ✅ Persistencia en PostgreSQL con Drizzle ORM
- ✅ Validación de DTOs con class-validator
- ✅ Seguridad JWT con Passport
- ✅ Cache Redis con TTL configurable
- ✅ Colas de trabajo (BullMQ)
- ✅ Logs claros con NestJS Logger
- ✅ Manejo consistente de errores con HttpExceptionFilter global

### Integraciones

- ✅ IA: Mastra AI con OpenAI GPT-4o-mini
- ✅ RandomUser.me API: Integración completa con deduplicación por email
- ✅ Scheduler: CRON cada hora para sincronización automática

## Instalación

### Prerrequisitos

- Node.js 18+
- pnpm 10+
- Docker (para Redis y PostgreSQL)
- OpenAI API Key

### Configuración

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd contactship-challenge

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
nano .env
```

### Variables de entorno

```env
# API
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/contactship

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h

# Cache (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
CACHE_STRATEGY=redis

# Job Queue (BullMQ)
BULLMQ_REDIS_HOST=localhost
BULLMQ_REDIS_PORT=6379
BULLMQ_REDIS_PASSWORD=
BULLMQ_REDIS_DB=0

# Scheduler
SYNC_CRON=0 * * * *

# AI (OpenAI)
OPENAI_API_KEY=sk-...
```

### Iniciar Infraestructura

```bash
# Iniciar Redis y PostgreSQL con Docker
docker-compose up -d
```

### Migraciones

```bash
cd services/api
pnpm db:push
```

### Desarrollo

```bash
# Iniciar servidor en modo desarrollo
pnpm dev
```

El API estará disponible en `http://localhost:3000`

## API Endpoints

### Públicos (sin autenticación)

| Método | Ruta              | Descripción           |
| ------ | ----------------- | --------------------- |
| GET    | /                 | Información de la API |
| GET    | /ping             | Health check simple   |
| GET    | /health           | Health check completo |
| GET    | /health/liveness  | Liveness probe (K8s)  |
| GET    | /health/readiness | Readiness probe (K8s) |
| POST   | /auth/login       | Obtener token JWT     |

### Autenticados (requieren JWT `Authorization: Bearer <token>`)

#### Leads

| Método | Ruta                 | Descripción                         |
| ------ | -------------------- | ----------------------------------- |
| POST   | /leads               | Crear lead manualmente              |
| POST   | /create-lead         | Crear lead (alternativo)            |
| GET    | /leads               | Listar leads (paginación)           |
| GET    | /leads/:id           | Obtener detalle de lead (con cache) |
| POST   | /leads/:id/summarize | Generar resumen con IA              |
| PATCH  | /leads/:id           | Actualizar lead                     |
| DELETE | /leads/:id           | Eliminar lead                       |
| GET    | /leads/statistics    | Obtener estadísticas                |

#### Sync

| Método | Ruta           | Descripción                       |
| ------ | -------------- | --------------------------------- |
| POST   | /sync/trigger  | Disparar sincronización manual    |
| GET    | /sync/jobs     | Listar trabajos de sincronización |
| GET    | /sync/jobs/:id | Obtener detalle de trabajo        |

## Documentación Detallada

Para una documentación técnica completa de todos los endpoints, esquemas, y arquitectura, ver `API_README.md`.

## Credenciales por defecto

```json
{
  "email": "admin@contactship.com",
  "password": "admin123"
}
```

## Scripts

```bash
# Instalación
pnpm install

# Desarrollo
pnpm dev

# Tests
pnpm test
pnpm test:e2e

# Calidad
pnpm lint
pnpm typecheck
```

## Docker

```bash
# Iniciar servicios
docker-compose up -d
```

## Criterios de Evaluación Cumplidos

| Requisito                  | Estado                                   |
| -------------------------- | ---------------------------------------- |
| Diseño y estructura        | ✅ Módulos separados por responsabilidad |
| Uso de NestJS y TypeScript | ✅ TypeScript estricto sin `any`         |
| Modelo de datos            | ✅ Schemas con Drizzle ORM               |
| Persistencia               | ✅ PostgreSQL con conexiones pool        |
| Cache                      | ✅ Redis con TTL configurable            |
| Colas                      | ✅ BullMQ con reintentos                 |
| Deduplicación              | ✅ Por email en BD                       |
| IA                         | ✅ Mastra AI + OpenAI                    |
| Validación DTOs            | ✅ class-validator                       |
| Seguridad                  | ✅ JWT con Passport                      |
| Logs y errores             | ✅ NestJS Logger                         |
| README claro               | ✅ Documentación técnica completa        |

## License

UNLICENSED
