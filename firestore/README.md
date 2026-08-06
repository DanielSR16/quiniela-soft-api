# Setup de Firebase (manual, requiere tu cuenta de Google)

1. Ve a https://console.firebase.google.com/ y crea un proyecto nuevo (ej. `quinielasoft`).
2. **Authentication** → Sign-in method → habilita **Email/Password**.
3. **Firestore Database** → crea la base en modo **producción** (no "test mode"), elige una región cercana (ej. `us-central` o `southamerica-east1`).
4. Instala Firebase CLI si no la tienes: `npm install -g firebase-tools`, luego `firebase login`.
5. Desde esta carpeta (`quiniela-api/firestore`), ejecuta `firebase use --add` y selecciona tu proyecto, luego `firebase deploy --only firestore:rules,firestore:indexes` para publicar `firestore.rules` y `firestore.indexes.json`.
6. **Configuración del proyecto** (ícono de engranaje) → **Cuentas de servicio** → **Generar nueva clave privada**. Descarga el JSON — de ahí salen `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` para el `.env` del backend (`quiniela-api/.env.example`). **No subas ese archivo a git.**
7. **Configuración del proyecto** → **Tus apps** → agrega una app **Web** (ícono `</>`). Copia el objeto de configuración (`apiKey`, `authDomain`, etc.) al `.env.local` del frontend (`quiniela-web/.env.local.example`).
8. Avísame cuando tengas ambos (credenciales admin + config web) y seguimos con el seed inicial de `leagues/liga-mx` y la primera temporada.
