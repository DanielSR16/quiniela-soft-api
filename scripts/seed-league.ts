import 'dotenv/config';
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
  process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error(
    'Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY en .env',
  );
}

initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

async function seed() {
  const db = getFirestore();

  const leagueRef = db.collection('leagues').doc('liga-mx');
  await leagueRef.set({
    name: 'Liga MX',
    country: 'México',
    apiFootballLeagueId: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  const seasonRef = leagueRef.collection('seasons').doc('apertura-2026');
  await seasonRef.set({
    name: 'Apertura 2026',
    year: 2026,
    apiFootballSeasonId: null,
    isCurrent: true,
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log('Seed listo: leagues/liga-mx y leagues/liga-mx/seasons/apertura-2026');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error al hacer seed:', err);
    process.exit(1);
  });
