# AGENTS.md

Instrucciones para agentes de IA (Claude Code y similares) que trabajen en este repo.

## Qué es este proyecto

Backend NestJS de **QuinielaSoft**: web de quinielas de fútbol para grupos cerrados (multi-tenant), empezando con Liga MX. Ver [REQUIREMENTS.md](./REQUIREMENTS.md) para el detalle completo del producto (reglas de puntuación, estrategia de sync con API-Football, hosting, etc.) — es la fuente de verdad de requerimientos y debe consultarse antes de tomar decisiones de diseño no triviales.

Frontend (`quiniela-web`, Next.js) vive en un repo separado; no está en este working directory.

## Stack

- NestJS + TypeScript
- Firebase Admin SDK (Firestore + Authentication) — no hay ORM ni SQL
- API-Football (RapidAPI) como única fuente de datos de partidos, free tier limitado a 100 req/día — cualquier código que llame a esta API debe respetar la estrategia de bajo consumo descrita en REQUIREMENTS.md §4
- Sync disparado por GitHub Actions (cron) vía `POST /internal/sync/run`, no por Cloud Scheduler/Functions

## Estructura de `src/`

El proyecto es un scaffold reciente; muchos de estos módulos aún no existen y se irán creando conforme avance el desarrollo:

```
src/
├── firebase/       # Firebase Admin SDK compartido
├── auth/           # Guards de autenticación/roles
├── users/          # Perfiles de usuario
├── groups/         # Grupos de quiniela (multi-tenant), membership y roles por grupo
├── leagues/        # Ligas/temporadas/rondas (genérico multi-liga)
├── matches/        # Partidos
├── predictions/    # Predicciones de usuarios por grupo
├── scoring/        # Motor de puntuación
├── ranking/        # Cálculo de rankings por grupo
├── external-api/   # Cliente de API-Football
├── sync/           # Orquestación de sincronización de partidos/resultados
├── admin/          # Endpoints de administración (grupo y super-admin)
└── common/         # Filtros, interceptores, DTOs compartidos
```

## Comandos

```bash
npm install
cp .env.example .env       # credenciales de Firebase Admin SDK y API-Football
npm run start:dev          # servidor con watch
npm run lint                # eslint --fix
npm run format               # prettier --write
npm test                     # jest (unit)
npm run test:e2e              # jest (e2e, config en test/jest-e2e.json)
npm run seed:league            # scripts/seed-league.ts, crea leagues/liga-mx en Firestore
```

Antes de dar por terminado un cambio no trivial, correr `npm run lint` y `npm test`.

## Convenciones de código

- Prettier: comillas simples, trailing comma en todo (`.prettierrc`).
- ESLint con `typescript-eslint` recomendado + type-checked; `no-explicit-any` está desactivado a propósito, pero `no-floating-promises` y `no-unsafe-argument` son warnings a tomar en serio.
- Seguir la convención modular estándar de NestJS (`*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs con `class-validator`/`class-transformer`).
- Reglas de puntuación y demás configuración de negocio son **por grupo**, no globales — evitar hardcodear valores como los 5/3/0 puntos default; deben vivir en `groups/{groupId}/scoringRules` en Firestore.
- Los partidos (`matches`) son globales/compartidos entre grupos; las predicciones (`predictions`) son por grupo y por usuario.

## Firestore

- Reglas de seguridad e índices viven en `firestore/` (`firestore.rules`, `firestore.indexes.json`), no en `src/`.
- Este proyecto usa Firestore como única base de datos — no asumir SQL, transacciones relacionales ni joins; diseñar accesos a datos pensando en documentos/colecciones y denormalización cuando haga falta.

## Cosas a NO hacer

- No añadir llamadas a API-Football fuera del flujo de sync ya diseñado (una sola llamada por jornada/ciclo) — el free tier es de 100 req/día.
- No implementar fallback a TheSportsDB (descartado explícitamente para el MVP, ver REQUIREMENTS.md §4).
- No mover el trigger de sync a Cloud Scheduler/Firebase Functions (se evita a propósito por requerir plan Blaze con tarjeta).
- No recalcular retroactivamente puntuaciones al cambiar `scoringRules` salvo que se implemente explícitamente una acción de "recalcular" disparada por el admin.
- **Por ahora NO implementar el rol de super-admin** (creación de múltiples grupos, `isSuperAdmin` en `users/{uid}`, `SuperAdminGuard` aplicado en endpoints reales). La app va a operar con un solo grupo/instancia por ahora, así que solo se implementa el flujo de **admin de grupo** (`group_admin`, `GroupRoleGuard`). El código del guard de super-admin puede quedar escrito pero sin usarse todavía; no construir endpoints ni scripts (bootstrap, etc.) que dependan de él hasta que se decida soportar múltiples grupos.
