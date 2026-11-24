/**
 * Auth0 Action — Trigger: Login / Post Login
 *
 * Qué hace: añade los roles del usuario (RBAC de Auth0) como un claim
 * personalizado en el ID token y en el access token.
 *
 * Por qué: Auth0 no incluye los roles en los tokens por defecto. Con este claim:
 *   - la SPA puede mostrar los roles (los lee del ID token),
 *   - la API podría usarlos si lo necesitara (los lee del access token).
 *
 * Por qué un namespace (URL): Auth0 exige que los claims personalizados usen un
 * nombre con formato URL para no chocar con los claims estándar de OIDC
 * (sub, email, name...). No tiene que ser una URL real.
 *
 * Instalación:
 *   1. Actions > Library > Build Custom > Trigger "Login / Post Login".
 *   2. Pegar este código y pulsar Deploy.
 *   3. Actions > Flows > Login: arrastrar la Action al flujo y pulsar Apply.
 */

// Debe coincidir con VITE_CLAIM_NAMESPACE en spa/.env
const NAMESPACE = 'https://practica.local';

exports.onExecutePostLogin = async (event, api) => {
  // Roles asignados al usuario en User Management > Roles (array vacío si no tiene).
  const roles = event.authorization?.roles ?? [];

  api.idToken.setCustomClaim(`${NAMESPACE}/roles`, roles);
  api.accessToken.setCustomClaim(`${NAMESPACE}/roles`, roles);
};
