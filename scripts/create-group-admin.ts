import 'dotenv/config';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
  process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error(
    'Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY en .env',
  );
}

function readArg(flag: string, fallback?: string): string {
  const prefix = `--${flag}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  const value = found?.slice(prefix.length) ?? fallback;
  if (!value) {
    throw new Error(
      `Falta el argumento --${flag}=... (ej. --email=admin@ejemplo.com)`,
    );
  }
  return value;
}

const groupId = readArg('groupId', 'principal');
const groupName = readArg('groupName', 'Quiniela');
const email = readArg('email');
const password = readArg('password');
const displayName = readArg('displayName', 'Admin');

initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

async function main() {
  const auth = getAuth();
  const db = getFirestore();

  const userRecord = await auth.createUser({ email, password, displayName });
  const uid = userRecord.uid;

  await db.collection('users').doc(uid).set({
    email,
    displayName,
    isSuperAdmin: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  await db.collection('groups').doc(groupId).set({
    name: groupName,
    createdAt: FieldValue.serverTimestamp(),
  });

  await db
    .collection('groups')
    .doc(groupId)
    .collection('members')
    .doc(uid)
    .set({
      role: 'group_admin',
      isActive: true,
      joinedAt: FieldValue.serverTimestamp(),
    });

  console.log('Listo:');
  console.log(`  groupId: ${groupId}`);
  console.log(`  uid:     ${uid}`);
  console.log(`  email:   ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error creando el grupo/admin:', err);
    process.exit(1);
  });
