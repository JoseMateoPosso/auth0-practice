/**
 * Configuración de la SPA.
 *
 * Vite expone al navegador solo las variables que empiezan por VITE_.
 * Ojo: todo lo que esté aquí es PÚBLICO (acaba en el JavaScript del navegador),
 * por eso no hay ningún client secret. La SPA es un "cliente público" en OAuth 2.0
 * y se protege con PKCE en lugar de con un secreto.
 */
const env = import.meta.env;

export const config = {
  auth0Domain: env.VITE_AUTH0_DOMAIN,
  auth0ClientId: env.VITE_AUTH0_CLIENT_ID,
  // Para qué API pedimos el access token (debe ser el Identifier de la API en Auth0).
  auth0Audience: env.VITE_AUTH0_AUDIENCE,
  // Prefijo del claim de roles que añade la Action (action/add-roles-claim.js).
  claimNamespace: env.VITE_CLAIM_NAMESPACE,
  apiUrl: env.VITE_API_URL ?? 'http://localhost:3001',
};

// Aviso temprano si falta configuración, en lugar de un error confuso de Auth0.
const missing = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(`Falta configuración en spa/.env: ${missing.join(', ')}`);
}
