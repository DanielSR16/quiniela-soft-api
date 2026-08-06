# QuinielaSoft API

Backend (NestJS) de QuinielaSoft — web de quinielas de fútbol para grupos cerrados de amigos/familia, empezando con Liga MX.

Ver [REQUIREMENTS.md](./REQUIREMENTS.md) para los requerimientos completos del producto.

## Stack

- NestJS + TypeScript
- Firebase Admin SDK (Firestore + Authentication)
- API-Football (RapidAPI) como fuente de datos de partidos
- GitHub Actions (cron) como disparador del job de sincronización

## Desarrollo

```bash
npm install
cp .env.example .env   # completar con credenciales de Firebase Admin SDK y API-Football
npm run start:dev
```

## Estructura

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
