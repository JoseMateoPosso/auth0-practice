import { useAuth0 } from '@auth0/auth0-react';
import { config } from '../config.js';

/**
 * Muestra los datos del usuario, que vienen del ID token.
 *
 * El ID token sirve para que la SPA sepa QUIÉN es el usuario.
 * Para llamar a la API se usa el access token (ver ApiTester).
 */
export default function Profile() {
  const { user } = useAuth0();

  // Claim personalizado añadido por la Action post-login.
  const roles = user[`${config.claimNamespace}/roles`] ?? [];

  return (
    <section>
      <p>
        Hola, <strong>{user.name}</strong> ({user.email})
      </p>
      <p>Roles: {roles.length > 0 ? roles.join(', ') : 'ninguno'}</p>
    </section>
  );
}
