/**
 * Middlewares de seguridad de la API.
 *
 * Separamos dos preguntas distintas:
 *   1. Autenticación  -> ¿el token es válido y es para esta API?   (falla con 401)
 *   2. Autorización   -> ¿el token tiene el permiso que pide la ruta? (falla con 403)
 */
import { auth, InsufficientScopeError } from 'express-oauth2-jwt-bearer';
import { config } from './config.js';

/**
 * 1. AUTENTICACIÓN: valida el access token (JWT) que llega en
 *    "Authorization: Bearer <token>".
 *
 * La librería comprueba por nosotros:
 *   - Firma: con la clave pública de Auth0, descargada de su endpoint JWKS
 *     (https://<dominio>/.well-known/jwks.json) y cacheada.
 *   - iss (issuer):   que lo haya emitido nuestro tenant de Auth0.
 *   - aud (audience): que el token sea para ESTA API y no para otra.
 *   - exp:            que no esté caducado.
 *
 * Si todo es correcto, deja el contenido del token en req.auth.payload.
 */
export const checkJwt = auth({
  issuerBaseURL: `https://${config.auth0Domain}/`,
  audience: config.auth0Audience,
});

/**
 * 2. AUTORIZACIÓN: exige que el token incluya un permiso concreto.
 *
 * El permiso puede venir en dos claims según quién pide el token:
 *   - "permissions" (array):  usuarios, cuando la API tiene activados
 *                             "Enable RBAC" y "Add Permissions in the Access Token".
 *   - "scope" (string):       aplicaciones M2M (Client Credentials), p. ej. "read:orders".
 *
 * Si no lo tiene, respondemos 403 (autenticado pero sin permiso), no 401.
 *
 * @param {string} permission  p. ej. 'read:orders'
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    const { permissions = [], scope = '' } = req.auth.payload;

    const hasPermission =
      permissions.includes(permission) || scope.split(' ').includes(permission);

    if (!hasPermission) {
      return next(new InsufficientScopeError([permission]));
    }
    next();
  };
}
