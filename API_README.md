# Contactship API

Microservicio para gestión de leads con integración de IA, sincronización desde APIs externas, cache y colas de trabajo.

## Stack Técnico

| Componente        | Tecnología            | Versión |
| ----------------- | --------------------- | ------- |
| Backend Framework | NestJS                | 11.x    |
| Lenguaje          | TypeScript            | 5.8+    |
| Database          | PostgreSQL (Supabase) | -       |
| ORM               | Drizzle ORM           | -       |
| Cache             | Redis (cache-manager) | 7.2+    |
| Job Queue         | BullMQ                | 5.66+   |
| Authentication    | JWT (Passport)        | -       |
| AI/ML             | Mastra AI + OpenAI    | -       |
| Orchestration     | pnpm workspaces       | -       |
| Scheduler         | @nestjs/schedule      | 6.x     |

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
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
└─────────┼──────────────────┼────────────────┼──────────────┘
          │                  │                │
    ┌─────▼──────┐    ┌───▼───────┐   ┌───▼────────┐
    │AuthService  │    │LeadsService│   │SyncService │
    │(JWT)       │    │+AiService  │   │+Queue      │
    └─────┬──────┘    └─────┬─────┘   └─────┬───────┘
          │                   │                │
          │             ┌─────▼─────┐         │
          │             │AiService  │         │
          │             └─────┬─────┘         │
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
    │             │         ┌──────▼────────┐
    │             │         │ OpenAI API    │
    │             │         └───────────────┘
    └─────────────┘
```

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

# 3. Copiar archivo de ejemplo
cp .env.example .env

# 4. Configurar variables de entorno
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
JWT_SECRET=change-this-secret-in-production
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

### Iniciar infraestructura

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

### Autenticación

#### Login (Obtener Token)

**Endpoint:** `POST /auth/login`

**Descripción:** Genera un token JWT para autenticarse en los endpoints protegidos.

**Request Body:**

```typescript
{
  email: string;
  password: string;
}
```

**Respuesta:**

```typescript
{
  access_token: string;
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@contactship.com",
    "password": "admin123"
  }'
```

**Credenciales por defecto (development):**

- Email: `admin@contactship.com`
- Password: `admin123`

---

### Leads

#### Crear Lead (Manual)

**Endpoint:** `POST /leads`

**Auth:** ✅ JWT Required

**Descripción:** Crea un lead manualmente en el sistema.

**Request Body:**

```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  dateOfBirth?: string; // ISO 8601
  nationality?: string;
  gender?: string;
  pictureUrl?: string;
  source?: 'manual' | 'external_api';
  status?: 'new' | 'contacted' | 'converted';
  metadata?: Record<string, unknown>;
}
```

**Validaciones:**

- `firstName`: string, max 255 caracteres
- `lastName`: string, max 255 caracteres
- `email`: email válido, max 255 caracteres
- `phone`: string, max 50 caracteres (opcional)
- `source`: enum `['manual', 'external_api']` (opcional, default: 'manual')
- `status`: enum `['new', 'contacted', 'converted']` (opcional, default: 'new')

**Respuesta:** Lead creado

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "source": "manual",
    "status": "new"
  }'
```

**Errores:**

- `409 Conflict`: Lead con email ya existe

---

#### Crear Lead (Alternative)

**Endpoint:** `POST /create-lead`

**Auth:** ✅ JWT Required

**Descripción:** Endpoint alternativo para crear leads manualmente. Mismos campos y validaciones que `POST /leads`.

---

#### Listar Leads

**Endpoint:** `GET /leads`

**Auth:** ✅ JWT Required

**Descripción:** Lista los leads existentes con paginación y filtros.

**Query Params:**
| Param | Tipo | Default | Descripción |
|-------|-------|----------|-------------|
| page | number | 1 | Número de página |
| take | number | 10 | Registros por página |
| status | enum | - | Filtrar por estado |
| search | string | - | Búsqueda en email, nombres |

**Respuesta:**

```typescript
{
  data: Lead[];
  meta: {
    total: number;
    page: number;
    take: number;
    totalPages: number;
  };
}
```

**Ejemplo:**

```bash
curl -X GET "http://localhost:3000/leads?page=1&take=10&status=new" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### Obtener Detalle de Lead

**Endpoint:** `GET /leads/:id`

**Auth:** ✅ JWT Required

**Cache:** ✅ Redis (TTL configurable)

**Descripción:** Obtiene el detalle completo de un lead incluyendo la persona asociada.

**Path Params:**
| Param | Tipo | Descripción |
|-------|-------|-------------|
| id | string | UUID del lead |

**Respuesta:** Lead con relaciones

**Ejemplo:**

```bash
curl -X GET http://localhost:3000/leads/{leadId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### Generar Resumen con IA

**Endpoint:** `POST /leads/:id/summarize`

**Auth:** ✅ JWT Required

**Descripción:** Genera un resumen del lead y una próxima acción sugerida utilizando IA. Persiste ambos campos en el lead.

**Path Params:**
| Param | Tipo | Descripción |
|-------|-------|-------------|
| id | string | UUID del lead |

**AI Model:** GPT-4o-mini (configurable)

**Respuesta del AI:**

```typescript
{
  summary: string; // 50-300 caracteres
  next_action: string; // 20-150 caracteres
}
```

**Persistencia:** Ambos campos se guardan en `leads.summary` y `leads.next_action`

**Cache:** Resúmenes cacheados por 24h por email

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/leads/{leadId}/summarize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**

```json
{
  "id": "lead-id",
  "personId": "person-id",
  "email": "john@example.com",
  "summary": "Senior software engineer at TechCorp with 10 years experience in cloud architecture",
  "nextAction": "Schedule discovery call this week",
  "summaryGeneratedAt": "2026-01-17T12:00:00Z"
}
```

---

#### Actualizar Lead

**Endpoint:** `PATCH /leads/:id`

**Auth:** ✅ JWT Required

**Descripción:** Actualiza campos de un lead existente.

**Path Params:**
| Param | Tipo | Descripción |
|-------|-------|-------------|
| id | string | UUID del lead |

**Request Body:** Parcial de CreateLeadDto

**Ejemplo:**

```bash
curl -X PATCH http://localhost:3000/leads/{leadId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "contacted"
  }'
```

---

#### Eliminar Lead

**Endpoint:** `DELETE /leads/:id`

**Auth:** ✅ JWT Required

**Descripción:** Elimina un lead del sistema.

**Path Params:**
| Param | Tipo | Descripción |
|-------|-------|-------------|
| id | string | UUID del lead |

**Status Code:** 204 No Content

**Ejemplo:**

```bash
curl -X DELETE http://localhost:3000/leads/{leadId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### Estadísticas

**Endpoint:** `GET /leads/statistics`

**Auth:** ✅ JWT Required

**Descripción:** Obtiene estadísticas de leads por estado.

**Respuesta:**

```typescript
{
  total: number;
  new: number;
  contacted: number;
  converted: number;
}
```

**Ejemplo:**

```bash
curl -X GET http://localhost:3000/leads/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Sincronización

#### Disparar Sincronización Manual

**Endpoint:** `POST /sync/trigger`

**Auth:** ✅ JWT Required

**Descripción:** Dispara manualmente un job de sincronización para importar leads desde RandomUser.me.

**Batch Size:** 10 leads por ejecución

**Deduplicación:** Por email (no duplicados)

**Respuesta:** SyncJob creado

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/sync/trigger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**

```json
{
  "id": "sync-job-id",
  "status": "pending",
  "recordsProcessed": 0,
  "recordsCreated": 0,
  "recordsSkipped": 0,
  "errors": [],
  "createdAt": "2026-01-17T12:00:00Z"
}
```

---

#### Listar Jobs de Sincronización

**Endpoint:** `GET /sync/jobs`

**Auth:** ✅ JWT Required

**Descripción:** Lista los trabajos de sincronización más recientes.

**Query Params:**
| Param | Tipo | Default | Descripción |
|-------|-------|----------|-------------|
| limit | number | 20 | Número de jobs a retornar |

**Ejemplo:**

```bash
curl -X GET "http://localhost:3000/sync/jobs?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### Obtener Detalle de Job

**Endpoint:** `GET /sync/jobs/:id`

**Auth:** ✅ JWT Required

**Descripción:** Obtiene el detalle completo de un job de sincronización.

**Path Params:**
| Param | Tipo | Descripción |
|-------|-------|-------------|
| id | string | UUID del sync job |

**Ejemplo:**

```bash
curl -X GET http://localhost:3000/sync/jobs/{jobId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Health Check (Públicos)

#### Health Check

**Endpoint:** `GET /health`

**Auth:** ❌ Público

**Descripción:** Health check completo para orchestration (Kubernetes, load balancers).

**Respuesta:**

```typescript
{
  status: 'ok' | 'error',
  info: {
    database: {
      status: 'up' | 'down',
      message?: string;
    };
  }
}
```

#### Liveness

**Endpoint:** `GET /health/liveness`

**Auth:** ❌ Público

**Descripción:** Liveness probe para Kubernetes.

**Respuesta:**

```json
{
  "status": "ok"
}
```

#### Readiness

**Endpoint:** `GET /health/readiness`

**Auth:** ❌ Público

**Descripción:** Readiness probe para Kubernetes.

**Respuesta:**

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

#### API Info

**Endpoint:** `GET /`

**Auth:** ❌ Público

**Descripción:** Información de la API.

**Respuesta:**

```json
{
  "name": "Contactship API",
  "version": "1.0.0",
  "description": "Leads management microservice"
}
```

#### Ping

**Endpoint:** `GET /ping`

**Auth:** ❌ Público

**Descripción:** Ping simple.

**Respuesta:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-17T12:00:00Z"
}
```

---

## Estrategias Implementadas

### Deduplicación

La deduplicación se realiza a nivel de email en la tabla `leads`:

1. **Sincronización automática:**

   ```typescript
   const existingLead = await db.select().from(leads).where(eq(leads.email, user.email)).limit(1);

   if (existingLead.length > 0) {
     recordsSkipped++;
     continue;
   }
   ```

2. **Creación manual:**
   ```typescript
   const existingLead = await this.leadsRepository.findOneByEmail(email);
   if (existingLead) {
     throw new ConflictException('Lead with email already exists');
   }
   ```

### Cache

#### Cache de Leads (GET /leads/:id)

- **Key:** `lead:${leadId}`
- **TTL:** Configurable via `DEFAULT_CACHE_TTL`
- **Invalidación:** Al actualizar o eliminar un lead
- **Implementación:** Redis con cache-manager

#### Cache de Summary de IA

- **Key:** `ai:summary:${email}`
- **TTL:** 86400 segundos (24 horas)
- **Razón:** Los resúmenes de IA son computacionalmente costosos
- **Invalidación:** Automática por TTL

### Job Queue (BullMQ)

#### Arquitectura

```
SyncScheduler (CRON)
  ↓
SyncService.triggerSyncExternalLeads()
  ↓
BullMQ Queue (sync-external-leads)
  ↓
SyncExternalLeadsProcessor.process()
  ↓
  • Fetch desde RandomUser.me
  • Procesar usuarios (deduplicación)
  • Crear leads y personas
  • Actualizar sync_jobs
```

#### Configuración

- **Queue Name:** `sync-external-leads`
- **Connection:** Redis
- **Attempts:** 3 con backoff exponencial
- **Retry Delay:** 2000ms (2s)

### Sincronización Automática

#### CRON Job

- **Expression:** `0 * * * *` (cada hora)
- **Implementación:** `@Cron(CronExpression.EVERY_HOUR)`
- **Batch Size:** 10 leads por ejecución
- **Source:** RandomUser.me API

#### RandomUser.me API

**Endpoint:** `https://randomuser.me/api/?results=10`

**Response Structure:**

```typescript
{
  results: [
    {
      email: string;
      phone: string;
      name: {
        first: string;
        last: string;
      };
      location: {
        street: { number: number; name: string; };
        city: string;
        state: string;
        postcode: string;
        country: string;
      };
      picture: { medium: string; };
      dob: { date: string; };
      login: { uuid: string; };
      gender: string;
      nat: string;
    }
  ];
}
```

**Mapeo a BD:**

```typescript
{
  person: {
    firstName: user.name.first,
    lastName: user.name.last,
    phone: user.phone,
    pictureUrl: user.picture.medium,
    address: { /* mapeado desde user.location */ },
    dateOfBirth: new Date(user.dob.date),
    gender: user.gender
  },
  lead: {
    personId: person.id,
    email: user.email,
    externalId: user.login.uuid,
    source: 'external_api',
    status: 'new',
    syncedAt: new Date(),
    metadata: {
      location: `${user.location.city}, ${user.location.country}`,
      profession: user.nat
    }
  }
}
```

### Integración de IA

#### AI Service

- **Framework:** Mastra AI
- **Model:** OpenAI GPT-4o-mini
- **Prompt:** Analiza lead y genera resumen + acción
- **Output:** JSON estructurado con Zod schema

#### Schema de Respuesta

```typescript
{
  summary: string; // 50-300 caracteres
  next_action: string; // 20-150 caracteres
}
```

#### Prompt Template

```
Analyze the following lead and generate a professional summary and strategic next action.

## Lead Information

**Personal Details:**
- Full Name: {firstName} {lastName}
- Email: {email}
- Phone: {phone}
- Age: {age}

**Professional Details:**
- Profession: {profession}
- Location: {location}

**Acquisition Context:**
- Source: {manual | external_api}

## Task

Based on the lead information above, generate:
1. A professional summary (50-300 characters) capturing the lead's key attributes
2. A specific, actionable next step (20-150 characters) for engagement

Ensure your response is valid JSON matching the required schema.
```

### Seguridad

#### JWT Authentication

**Token Structure:**

```typescript
{
  sub: string; // Email del usuario
  email: string; // Email del usuario
  iat: number; // Issued at
  exp: number; // Expiration
}
```

**Configuration:**

- `JWT_SECRET`: Clave secreta para firmar tokens
- `JWT_EXPIRES_IN`: 1h (configurable)

**Middleware:**

- `JwtAuthGuard`: Protege endpoints que requieren autenticación
- `JwtStrategy`: Valida tokens en cada request

**Uso:**

```bash
# Header
Authorization: Bearer <token>

# Ejemplo
curl -X GET http://localhost:3000/leads \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Rate Limiting

- **TTL:** 60 segundos
- **Max Requests:** 100 por ventana

## Modelo de Datos

### Leads Table

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  external_id VARCHAR(255),
  source VARCHAR(20) NOT NULL DEFAULT 'manual',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  metadata JSONB,
  synced_at TIMESTAMP,
  summary TEXT,
  next_action TEXT,
  summary_generated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Indexes:**

- `idx_leads_person_id` (person_id)
- `idx_leads_email` (email)
- `idx_leads_external_id` (external_id)
- `idx_leads_source` (source)
- `idx_leads_status` (status)

### Persons Table

```sql
CREATE TABLE persons (
  id UUID PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address JSONB,
  date_of_birth TIMESTAMP,
  nationality VARCHAR(100),
  gender VARCHAR(20),
  picture_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Indexes:**

- `idx_persons_phone` (phone)

### Sync Jobs Table

```sql
CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  errors JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Indexes:**

- `idx_sync_jobs_status` (status)
- `idx_sync_jobs_created_at` (created_at)

### Sync Job Leads Table

```sql
CREATE TABLE sync_job_leads (
  sync_job_id UUID REFERENCES sync_jobs(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (sync_job_id, lead_id)
);
```

**Indexes:**

- `idx_sync_job_leads_sync_job_id` (sync_job_id)
- `idx_sync_job_leads_lead_id` (lead_id)

## Scripts Disponibles

```bash
# Instalación
pnpm install

# Desarrollo
pnpm dev                    # Modo watch
pnpm start:dev              # Modo watch con SWC

# Build
pnpm build                   # Compilar a dist/

# Producción
pnpm start:prod             # Ejecutar desde dist/

# Testing
pnpm test                    # Tests unitarios
pnpm test:cov                # Tests con coverage
pnpm test:e2e                # Tests E2E

# Calidad
pnpm lint                    # ESLint
pnpm lint:fix                # ESLint con auto-fix
pnpm typecheck               # TypeScript type check
pnpm format                  # Prettier
```

## Docker

### docker-compose.yml

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: contactship
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

### Ejecutar

```bash
docker-compose up -d
docker-compose logs -f
```

## Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
pnpm test:e2e
```

### Ejemplo de Test

```typescript
describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LeadsService, LeadsRepository],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should create a lead', async () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const result = await service.create(dto);

    expect(result).toHaveProperty('id');
    expect(result.email).toBe(dto.email);
  });
});
```

## Deployment

### Variables de Entorno de Producción

```env
NODE_ENV=production
PORT=3000

DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=<secure-random-256-bit-key>
JWT_EXPIRES_IN=1h

REDIS_HOST=redis.production.internal
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

OPENAI_API_KEY=<openai-key>
```

### Health Check para Orchestration

```bash
curl http://your-api.com/health
curl http://your-api.com/health/liveness
curl http://your-api.com/health/readiness
```

## Estructura del Proyecto

```
contactship-challenge/
├── packages/
│   ├── ai/                   # Agentes de IA (Mastra)
│   ├── db/                    # Schemas y utilidades de DB (Drizzle)
│   ├── types/                 # Tipos TypeScript compartidos
│   ├── telemetry/             # Logging
│   └── shared/                # Utilidades compartidas
├── services/
│   └── api/                  # API NestJS
│       ├── src/
│       │   ├── auth/          # Autenticación JWT
│       │   ├── ai/            # Integración de IA
│       │   ├── cache/         # Cache Redis
│       │   ├── common/         # DTOs, interfaces, utils
│       │   ├── config/         # Configuración
│       │   ├── database/       # Conexión DB
│       │   ├── health/         # Health checks
│       │   ├── integrations/   # APIs externas
│       │   ├── leads/          # Leads CRUD + AI
│       │   ├── persons/        # Persons CRUD
│       │   ├── queues/         # BullMQ jobs
│       │   ├── scheduler/      # CRON jobs
│       │   └── sync/           # Sincronización
│       └── package.json
├── .env.example
├── docker-compose.yml
├── README.md
├── API_README.md
└── AGENTS.md
```

## Criterios de Evaluación Cumplidos

| Requisito                  | Estado | Notas                                 |
| -------------------------- | ------ | ------------------------------------- |
| Diseño y estructura        | ✅     | Módulos separados por responsabilidad |
| Uso de NestJS y TypeScript | ✅     | TypeScript estricto sin `any`         |
| Modelo de datos            | ✅     | Schemas con Drizzle ORM               |
| Persistencia               | ✅     | PostgreSQL con conexiones pool        |
| Cache                      | ✅     | Redis con TTL configurable            |
| Colas                      | ✅     | BullMQ con reintentos                 |
| Deduplicación              | ✅     | Por email en DB                       |
| IA                         | ✅     | Mastra AI + OpenAI                    |
| Validación DTOs            | ✅     | class-validator                       |
| Seguridad                  | ✅     | JWT con Passport                      |
| Logs                       | ✅     | NestJS Logger                         |
| Errores                    | ✅     | HttpExceptionFilter global            |
| README claro               | ✅     | Este documento                        |

## Troubleshooting

### Error: Cannot connect to Redis

**Solución:** Verificar que Redis esté corriendo

```bash
docker-compose ps
docker-compose logs redis
```

### Error: JWT Expired

**Solución:** El token expira después de 1h. Login nuevamente para obtener un nuevo token.

### Error: Lead already exists

**Solución:** El email ya está registrado. Usa un email diferente.

### Error: OpenAI API Key missing

**Solución:** Configurar `OPENAI_API_KEY` en `.env`

## Soporte

- **Documentación de NestJS:** https://docs.nestjs.com
- **Drizzle ORM:** https://orm.drizzle.team
- **BullMQ:** https://docs.bullmq.io
- **Mastra AI:** https://mastra.ai

## License

UNLICENSED
