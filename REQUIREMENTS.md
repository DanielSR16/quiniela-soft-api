# QuinielaSoft — Requerimientos

Documento vivo de requerimientos del producto. Se va ampliando conforme surgen nuevas decisiones. Vive en el repo del backend (`quiniela-api`) como fuente única de verdad, ya que backend y frontend son proyectos separados.

## 1. Producto

Web de quinielas de fútbol para grupos cerrados de amigos/familia/oficina. Los usuarios predicen el marcador de cada partido de una jornada antes de que inicie y ganan puntos según qué tan bien acertaron. Responsive: debe verse bien en mobile, tablet y desktop.

## 2. Alcance (MVP)

- Liga MX para el MVP.
- Arquitectura de datos genérica desde el día uno para soportar múltiples ligas/torneos a futuro (ej. Mundial de Clubes) sin rediseño mayor: cada liga es un documento en una colección `leagues`, con `seasons` y `rounds` propios.
- Se contempla la fase de liguilla de Liga MX: cuartos de final y semifinal a ida y vuelta (dos partidos), tercer lugar y final a partido único. Cada partido (incluidas ida y vuelta) se predice de forma independiente con las mismas reglas de puntuación; no hay predicción adicional de "quién avanza".

## 3. Stack técnico

- **Backend**: NestJS — proyecto independiente (`quiniela-api`).
- **Frontend**: Next.js (App Router) + Tailwind CSS — proyecto independiente (`quiniela-web`). Elegido por: ecosistema amplio, responsive fácil, SSR/SEO, mismo lenguaje (TypeScript) que el backend, posible reuso futuro con React Native.
- **Base de datos**: Firebase Firestore.
- **Autenticación**: Firebase Authentication.
- Backend y frontend son **repos separados** (no monorepo). Los tipos TypeScript del dominio se mantienen en paralelo en `src/types/` de cada proyecto (duplicación aceptable dado el tamaño del proyecto).

## 4. Fuente de datos de partidos

- **API-Football** (RapidAPI), free tier = 100 requests/día. Única fuente para el MVP.
- TheSportsDB queda descartado del MVP (livescore es de paga vía Patreon $9/mes, cobertura de Liga MX menos consistente) — se deja solo como nota de posible fallback futuro, sin implementar.

### Estrategia de llamadas (para no exceder 100 req/día)

- Sync de fixtures de una jornada: 1 sola llamada trae todos los partidos de esa fecha/ronda (no es 1 llamada por partido).
- Actualización de resultados: un job periódico (cada 30-45 min) solo llama a la API si existe al menos un partido cuyo `kickoffAt` ya pasó y su `status` en Firestore aún no es `finished`. Una sola llamada trae el estado de todos los partidos pendientes de esa fecha.
- Si no hay nada pendiente, el job no llama a la API ese ciclo.
- Consumo diario esperado: ~10-20 requests incluso en día de jornada completa.
- El cierre de predicciones (usuarios ya no pueden cambiar su pronóstico) se calcula localmente comparando la hora actual contra `kickoffAt` (ya sincronizado) — no consume requests de la API.

## 5. Trigger del job de sincronización

- **GitHub Actions con cron** (workflow en `quiniela-api/.github/workflows/sync-cron.yml`), corriendo cada 30-45 min, hace `POST` a un endpoint interno protegido del backend (`POST /internal/sync/run`, header secreto `X-Sync-Secret`).
- Se eligió sobre Cloud Scheduler + Firebase Functions para evitar tener que activar el plan Blaze de Firebase (que requiere tarjeta registrada), aunque el trade-off es que el cron de GitHub Actions puede retrasarse algunos minutos en horas pico — aceptable para este caso de uso.
- Toda la lógica de negocio del sync vive en NestJS; el workflow solo actúa como "reloj" externo confiable (no depende de que el backend esté despierto para dispararse).
- El mismo request de sync sirve como "ping" que despierta al backend si está dormido en su hosting free tier.

## 6. Autenticación y gestión de usuarios

- Firebase Authentication para login (sin registro público abierto).
- **Grupos de quiniela (multi-tenant)**: la app soporta múltiples grupos independientes (ej. "Amigos", "Oficina"), cada uno con sus propios ~20 jugadores, sus propias predicciones y su propio ranking. Los partidos son compartidos/globales entre todos los grupos (no se duplican).
  - Solo el **super-admin** (dueño de la app) crea grupos nuevos y asigna un admin de grupo.
  - Un usuario puede pertenecer a varios grupos con el mismo login, cambiando entre ellos con un selector de "grupo activo".
  - El admin de cada grupo invita/crea manualmente a sus jugadores.

## 7. Reglas de puntuación

Configurables **por grupo** (no globales), almacenadas en Firestore (`groups/{groupId}/scoringRules`), editables por el admin del grupo desde el panel:

- **5 pts** (default): marcador exacto (ej. real 1-2, predicción 1-2).
- **3 pts** (default): acertó el signo del resultado (quién gana, o empate) pero no el marcador exacto (ej. real 1-2 —gana visitante—, predicción 1-3 —también gana visitante—; o real 1-1 —empate—, predicción 2-2 —también empate—).
- **0 pts** (default): falló el signo (ej. real 1-2 —gana visitante—, predicción 2-1 —hubiera ganado local—).

Un cambio de reglas solo aplica hacia adelante (no recalcula retroactivamente lo ya jugado), salvo que el admin dispare explícitamente una acción de "recalcular con las reglas actuales".

## 8. Jornadas y resultados

- Las jornadas (rounds) se auto-sincronizan desde la API; el admin no las arma manualmente partido por partido.
- Los resultados se toman automáticamente de la API cuando el partido termina; el admin no los captura a mano.

## 9. Ranking

- Tabla de posiciones por jornada Y tabla acumulada de temporada ("cómo va la jornada" + acumulado), una por grupo.
- Los puntos de liguilla (cuartos, semis, tercer lugar, final) se suman al mismo acumulado de temporada — no hay ranking separado de fase final.

## 10. Cierre de predicciones

- Al llegar la hora de kickoff programada del partido (no en tiempo real vía API, sino comparación local contra el campo `kickoffAt` ya sincronizado).

## 11. Hosting (100% gratis)

| Componente | Servicio |
|---|---|
| Frontend | Vercel (Hobby) |
| Backend | Render (free web service) |
| Base de datos + Auth | Firebase Firestore + Authentication (plan Spark, sin tarjeta) |
| Trigger de sync | GitHub Actions (cron) |
| Datos de partidos | API-Football (RapidAPI free tier) |

## Pendientes / decisiones futuras

- Definir si se agrega un fallback real a TheSportsDB si API-Football deja de ser viable.
- Definir política de límite de grupos que puede crear el super-admin (¿ilimitados?).
- Evaluar si se necesita recuperación de contraseña / login social (Google) además de email/password.
- Evaluar página de "historial" de jornadas pasadas con predicciones propias (mencionada como posible fase futura, no confirmada aún).
- Evaluar si en el futuro conviene extraer los tipos TS compartidos a un paquete npm publicado, si la duplicación entre `quiniela-api` y `quiniela-web` se vuelve dolorosa.

## Changelog de requerimientos

- 2026-08-05: Documento inicial creado con todos los requerimientos confirmados en la conversación de planeación (producto, alcance, stack, estrategia de API, hosting, auth, grupos multi-tenant, reglas de puntuación configurables por grupo, liguilla, ranking, cierre de predicciones).
