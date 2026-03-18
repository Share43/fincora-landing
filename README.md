# Fincora — Plataforma SaaS para Administradores de Fincas

Fincora es una plataforma web que permite a administradores de fincas gestionar comunidades de vecinos, incidencias, documentos y juntas desde un panel privado, ofreciendo además un portal público sin login para el presidente de cada comunidad.

---

## Arquitectura general

```
fincora/
├── frontend/   → Next.js 14 (App Router) + TypeScript + Tailwind CSS
└── backend/    → Node.js + Hono + TypeScript + Prisma ORM
```

---

## Frontend (`/frontend`)

**Stack:** Next.js 14 · App Router · TypeScript · Tailwind CSS · TanStack Query · Axios

### Estructura de rutas

```
src/app/
├── layout.tsx                        ← Root layout (fuente, metadata global)
├── page.tsx                          ← Landing / redirect
│
├── (admin)/                          ← Grupo de rutas privadas (requiere JWT)
│   ├── layout.tsx                    ← Sidebar + shell del panel
│   ├── login/page.tsx                ← Formulario de login
│   ├── dashboard/page.tsx            ← KPIs y resumen global
│   ├── communities/page.tsx          ← Lista y creación de comunidades
│   ├── incidents/page.tsx            ← Incidencias (todas las comunidades)
│   ├── documents/page.tsx            ← Gestión de documentos
│   └── meetings/page.tsx             ← Juntas y convocatorias
│
└── [communitySlug]/                  ← Portal público del presidente (sin login)
    ├── layout.tsx                    ← Header con nav de la comunidad
    ├── page.tsx                      ← Home de la comunidad
    ├── incidents/page.tsx            ← Incidencias de la comunidad
    ├── documents/page.tsx            ← Documentos de la comunidad
    └── meetings/page.tsx             ← Juntas de la comunidad
```

### Decisiones clave

- El grupo `(admin)` usa un layout con sidebar. La autenticación se protegerá vía **Next.js Middleware** que valida el JWT almacenado en una cookie httpOnly.
- El portal `[communitySlug]` es completamente público. El acceso al contenido real se controla mediante un `publicToken` único por comunidad que se pasa como query param o cookie de sesión corta.
- `src/lib/api.ts` centraliza el cliente Axios con interceptores de autenticación.
- `src/types/index.ts` exporta todos los tipos compartidos.

---

## Backend (`/backend`)

**Stack:** Node.js · Hono · TypeScript · Prisma ORM · PostgreSQL · JWT (jose) · bcryptjs

### Estructura

```
backend/
├── prisma/
│   └── schema.prisma       ← Modelos: Administrator, Community, Resident,
│                               Incident, Document, Meeting
└── src/
    ├── index.ts             ← Bootstrap: Hono app, CORS, logger, rutas
    ├── lib/
    │   └── prisma.ts        ← Singleton de PrismaClient
    ├── middleware/
    │   └── auth.ts          ← Verificación JWT (Bearer token)
    └── routes/
        ├── auth.ts          ← POST /auth/login
        ├── communities.ts   ← CRUD /communities
        ├── incidents.ts     ← CRUD /incidents
        ├── documents.ts     ← CRUD /documents
        └── meetings.ts      ← CRUD /meetings
```

### Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/login` | ✗ | Devuelve JWT |
| `GET` | `/communities` | ✓ | Lista las comunidades del admin |
| `POST` | `/communities` | ✓ | Crear comunidad |
| `PATCH` | `/communities/:id` | ✓ | Editar comunidad |
| `DELETE` | `/communities/:id` | ✓ | Eliminar comunidad |
| `GET` | `/incidents` | ✓ | Lista incidencias (filtros: communityId, status) |
| `POST` | `/incidents` | ✓ | Crear incidencia |
| `PATCH` | `/incidents/:id` | ✓ | Actualizar incidencia |
| `GET` | `/documents` | ✓ | Lista documentos (filtros: communityId, category) |
| `POST` | `/documents` | ✓ | Registrar documento |
| `GET` | `/meetings` | ✓ | Lista juntas (filtros: communityId, status) |
| `POST` | `/meetings` | ✓ | Convocar junta |
| `GET` | `/health` | ✗ | Health check |

### Modelo de datos (simplificado)

```
Administrator ─┬─ Community ─┬─ Resident (isPresident flag)
               │             ├─ Incident  (status, priority)
               │             ├─ Document  (category, fileUrl)
               │             └─ Meeting   (type, status, agenda, minutes)
               └─ (más comunidades...)
```

Cada `Community` tiene un `publicToken` (CUID) único que otorga acceso de lectura al portal público sin necesidad de login.

---

## Puesta en marcha

### Requisitos
- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd backend
cp .env.example .env          # Ajusta DATABASE_URL y JWT_SECRET
npm install
npm run db:migrate            # Crea las tablas en PostgreSQL
npm run dev                   # API en http://localhost:3001
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # App en http://localhost:3000
```

---

## Próximos pasos sugeridos

- [ ] Middleware de Next.js para proteger rutas `(admin)` con JWT en cookie httpOnly
- [ ] Endpoint público `/public/[token]` para el portal del presidente
- [ ] Subida de archivos (documentos) vía Supabase Storage o S3
- [ ] Paginación en todos los endpoints de listado
- [ ] Tests de integración (Vitest + Supertest)
- [ ] Despliegue: Vercel (frontend) + Railway/Render (backend + PostgreSQL)
