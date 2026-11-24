import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { callApi } from '../api.js';

// Endpoints que queremos probar y qué esperamos de cada uno.
const ENDPOINTS = [
  { path: '/api/private', description: 'cualquier usuario autenticado' },
  { path: '/api/orders', description: 'requiere el permiso read:orders' },
];

/**
 * Botones para llamar a la API y ver la respuesta (código HTTP + cuerpo).
 */
export default function ApiTester() {
  const { getAccessTokenSilently } = useAuth0();
  const [result, setResult] = useState(null);

  const handleCall = async (path) => {
    try {
      // Devuelve el access token de la caché o pide uno nuevo a Auth0 sin
      // redirigir al usuario. Nunca lo guardamos nosotros a mano.
      const accessToken = await getAccessTokenSilently();
      const { status, body } = await callApi(path, accessToken);
      setResult({ path, status, body });
    } catch (err) {
      setResult({ path, status: 'error', body: err.message });
    }
  };

  return (
    <section>
      <h2>Probar la API</h2>

      {ENDPOINTS.map(({ path, description }) => (
        <button key={path} onClick={() => handleCall(path)} style={{ marginRight: 8 }}>
          GET {path} <small>({description})</small>
        </button>
      ))}

      {result && (
        <pre>
          {`GET ${result.path} -> ${result.status}\n`}
          {JSON.stringify(result.body, null, 2)}
        </pre>
      )}
    </section>
  );
}
