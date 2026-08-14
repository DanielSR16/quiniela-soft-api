import 'dotenv/config';

const { FIREBASE_WEB_API_KEY } = process.env;

if (!FIREBASE_WEB_API_KEY) {
  throw new Error('Falta FIREBASE_WEB_API_KEY en .env');
}

function readArg(flag: string): string {
  const prefix = `--${flag}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  const value = found?.slice(prefix.length);
  if (!value) {
    throw new Error(`Falta el argumento --${flag}=...`);
  }
  return value;
}

const email = readArg('email');
const password = readArg('password');

/**
 * Simula lo que haría el frontend: login directo contra Firebase Auth
 * (nunca contra nuestro backend) para obtener un idToken de prueba.
 */
async function main() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Login falló: ${JSON.stringify(body)}`);
  }

  console.log('idToken:');
  console.log(body.idToken);
  console.log('\nPrueba con:');
  console.log(
    `curl -H "Authorization: Bearer ${body.idToken}" http://localhost:3000/users/me`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
