/**
 * Configuración de la API.
 *
 * Toda la configuración sale de variables de entorno (archivo .env en local).
 * Si falta una variable obligatoria, la API no arranca: es mejor fallar al
 * inicio con un mensaje claro que fallar en la primera petición con un error raro.
 */
import 'dotenv/config';

/** Lee una variable de entorno obligatoria o detiene el arranque. */
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa api/.env (copia de .env.example).`);
  }
  return value;
}

export const config = {
  // Tenant de Auth0, p. ej. "mi-tenant.us.auth0.com" (sin https://).
  auth0Domain: required('AUTH0_DOMAIN'),

  // Identificador de la API registrada en Auth0. El token debe traer este valor en "aud".
  auth0Audience: required('AUTH0_AUDIENCE'),

  // Origen de la SPA al que permitimos llamar a la API desde el navegador (CORS).
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  port: Number(process.env.PORT ?? 3001),
};
