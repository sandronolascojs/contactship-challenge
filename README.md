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

## Instalación y Configuración

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18 o superior
- **pnpm** 10 o superior
- **Docker** y **Docker Compose** (para Redis)
- **Cuenta de Supabase** con un proyecto creado
- **OpenAI API Key** (para funcionalidades de IA)

### Paso 1: Clonar el Repositorio

```bash
git clone <repo-url>
cd contactship-challenge
```

### Paso 2: Instalar Dependencias

```bash
# Instalar todas las dependencias del monorepo
pnpm install
```

### Paso 3: Configurar Supabase

1. **Crear un proyecto en Supabase:**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Obtener la URL de conexión:**
   - En el panel de Supabase, ve a **Settings** > **Database**
   - Busca la sección **Connection string**
   - Selecciona **Direct connection** (para servidores de larga duración)
   - Copia la URL de conexión (formato: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`)
   - **Importante:** Agrega `?sslmode=require` al final de la URL

3. **Ejemplo de URL completa:**
   ```
   postgresql://postgres.abcdefghijklmnop:tu_password@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
   ```

### Paso 4: Configurar Variables de Entorno

```bash
# Crear archivo .env desde el ejemplo (si existe)
cp .env.example .env

# Editar el archivo .env
nano .env
# o
code .env
```

**Configura las siguientes variables:**

```env
# API
PORT=3000
NODE_ENV=development

# Database (Supabase)
# Reemplaza con tu URL de conexión directa de Supabase (para servidores de larga duración)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
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
OPENAI_API_KEY=sk-tu-api-key-aqui
```

### Paso 5: Iniciar Infraestructura con Docker

**Nota:** PostgreSQL se gestiona a través de Supabase, solo necesitamos Redis localmente.

```bash
# Iniciar Redis con Docker Compose
docker-compose up -d

# Verificar que Redis esté corriendo
docker-compose ps

# Ver logs de Redis (opcional)
docker-compose logs -f redis
```

**Verificar conexión a Redis:**

```bash
# Probar conexión a Redis
docker exec -it contactship-redis redis-cli ping
# Debería responder: PONG
```

### Paso 6: Ejecutar Migraciones de Base de Datos

Las migraciones crean las tablas necesarias en Supabase usando Drizzle ORM.

**Opción A: Push directo (recomendado para desarrollo rápido)**

Sincroniza el schema directamente sin crear archivos de migración:

```bash
# Desde el paquete db
cd packages/db
pnpm drizzle-kit push

# O desde la raíz del monorepo
pnpm --filter @contactship/db drizzle-kit push
```

**Opción B: Migraciones versionadas (recomendado para producción)**

Genera archivos de migración y luego los ejecuta:

```bash
# 1. Generar archivos de migración
cd packages/db
pnpm db:generate

# 2. Ejecutar migraciones
pnpm db:migrate
```

**Nota importante sobre variables de entorno:**

- Los scripts `db:generate` y `db:migrate` usan `dotenv -e ./.env.local` para cargar variables de entorno
- Puedes crear un archivo `.env.local` en `packages/db/` con tu `DATABASE_URL`
- O configurar `DATABASE_URL` como variable de entorno del sistema
- Para `drizzle-kit push`, usa la variable `DATABASE_URL` del sistema o `.env` en la raíz

**Verificar migraciones:**

- Ve al panel de Supabase > **Table Editor**
- Deberías ver las tablas: `persons`, `leads`, `sync_jobs`, `sync_job_leads`

**Si encuentras errores:**

- Verifica que la URL de conexión sea correcta
- Asegúrate de que el proyecto de Supabase esté activo
- Revisa los logs del comando para más detalles

### Paso 7: Iniciar el Servidor de Desarrollo

```bash
# Desde la raíz del proyecto
pnpm dev

# O iniciar solo el servicio API
pnpm --filter @contactship/api dev
```

El servidor estará disponible en: **`http://localhost:3000`**

### Paso 8: Verificar que Todo Funciona

1. **Health Check:**

   ```bash
   curl http://localhost:3000/health
   ```

2. **Login (obtener token JWT):**

   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@contactship.com",
       "password": "admin123"
     }'
   ```

3. **Acceder a la documentación Swagger:**
   - Abre en tu navegador: `http://localhost:3000/api/docs`

## Guía Rápida de Inicio

Si ya tienes todo configurado, aquí está el flujo rápido:

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar .env con tu DATABASE_URL de Supabase y OPENAI_API_KEY

# 3. Iniciar Redis
docker-compose up -d

# 4. Ejecutar migraciones (push directo para desarrollo)
cd packages/db && pnpm drizzle-kit push

# O usar migraciones versionadas (producción):
# cd packages/db && pnpm db:generate && pnpm db:migrate

# 5. Iniciar servidor
pnpm dev
```

## Comandos Útiles

### Docker

```bash
# Iniciar Redis
docker-compose up -d

# Detener Redis
docker-compose down

# Ver logs de Redis
docker-compose logs -f redis

# Reiniciar Redis
docker-compose restart redis

# Ver estado de contenedores
docker-compose ps
```

### Base de Datos

```bash
# Opción 1: Push directo (desarrollo rápido)
# Sincroniza el schema directamente sin crear archivos de migración
cd packages/db
pnpm drizzle-kit push

# O desde la raíz del monorepo
pnpm --filter @contactship/db drizzle-kit push

# Opción 2: Migraciones versionadas (producción)
# Generar archivos de migración
cd packages/db
pnpm db:generate

# Ejecutar migraciones
pnpm db:migrate

# O ejecutar migraciones localmente
pnpm db:migrate:local

# Ver estado de la base de datos en Supabase
# Ve al panel de Supabase > Table Editor
```

**Nota:** Los scripts `db:generate` y `db:migrate` cargan variables de entorno desde `packages/db/.env.local`.
Crea este archivo con tu `DATABASE_URL` o configura la variable de entorno del sistema.

### Desarrollo

```bash
# Iniciar en modo desarrollo (watch mode)
pnpm dev

# Build para producción
pnpm build

# Ejecutar tests
pnpm test

# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm typecheck
```

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

## Troubleshooting

### Error: Cannot connect to Redis

**Solución:**

```bash
# Verificar que Redis esté corriendo
docker-compose ps

# Si no está corriendo, iniciarlo
docker-compose up -d redis

# Ver logs para diagnosticar
docker-compose logs redis
```

### Error: Cannot connect to Database (Supabase)

**Solución:**

1. Verifica que la URL de conexión en `DATABASE_URL` sea correcta
2. Asegúrate de que la URL incluya `?sslmode=require` al final
3. Verifica que el proyecto de Supabase esté activo
4. Revisa que la contraseña de la base de datos sea correcta
5. Verifica que la región en la URL coincida con tu proyecto

**Formato correcto (conexión directa para servidores de larga duración):**

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

**Nota:** Usamos conexión directa (puerto 5432) en lugar de connection pooling (puerto 6543) porque es más adecuada para servidores de larga duración que mantienen conexiones persistentes.

### Error: Migration failed

**Solución:**

```bash
# Verificar que DATABASE_URL esté configurada correctamente
echo $DATABASE_URL

# Asegúrate de estar en el directorio correcto
cd packages/db

# Para push directo:
pnpm drizzle-kit push

# Para migraciones versionadas:
# 1. Verifica que exista packages/db/.env.local con DATABASE_URL
# 2. O configura DATABASE_URL como variable de entorno
# 3. Genera migraciones
pnpm db:generate
# 4. Ejecuta migraciones
pnpm db:migrate

# Si persiste, verifica:
# 1. Que la URL de conexión incluya ?sslmode=require
# 2. Que el proyecto de Supabase esté activo
# 3. Los permisos en Supabase (Settings > Database)
# 4. Para scripts db:*, verifica que packages/db/.env.local exista
# 5. Revisa los logs del comando para más detalles
```

### Error: OpenAI API Key missing

**Solución:**

- Verifica que `OPENAI_API_KEY` esté configurada en tu archivo `.env`
- Asegúrate de que la API key sea válida y tenga créditos disponibles

### Error: Port 3000 already in use

**Solución:**

```bash
# Cambiar el puerto en .env
PORT=3001

# O detener el proceso que usa el puerto 3000
lsof -ti:3000 | xargs kill -9
```

## Criterios de Evaluación Cumplidos

| Requisito                  | Estado                                                    |
| -------------------------- | --------------------------------------------------------- |
| Diseño y estructura        | ✅ Módulos separados por responsabilidad                  |
| Uso de NestJS y TypeScript | ✅ TypeScript estricto sin `any`                          |
| Modelo de datos            | ✅ Schemas con Drizzle ORM                                |
| Persistencia               | ✅ PostgreSQL con conexión directa (long-running servers) |
| Cache                      | ✅ Redis con TTL configurable                             |
| Colas                      | ✅ BullMQ con reintentos                                  |
| Deduplicación              | ✅ Por email en BD                                        |
| IA                         | ✅ Mastra AI + OpenAI                                     |
| Validación DTOs            | ✅ class-validator                                        |
| Seguridad                  | ✅ JWT con Passport                                       |
| Logs y errores             | ✅ NestJS Logger                                          |
| README claro               | ✅ Documentación técnica completa                         |

## License

UNLICENSED
